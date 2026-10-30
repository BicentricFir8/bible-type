
"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { CHARACTERS } from "../../lib/characters";

type Race = {
  id: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration_ms: number;
  created_at: string;
};

type Progress = {
  coins: number;
  xp: number;
  owned_characters: string[];
};

function getLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function getLevelProgress(xp: number) {
  return xp % 100;
}

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [races, setRaces] = useState<Race[]>([]);
  const [progress, setProgress] = useState<Progress>({
    coins: 0,
    xp: 0,
    owned_characters: ["disciple"],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const [profileResult, raceResult, progressResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("race_results")
            .select("id, wpm, accuracy, mistakes, duration_ms, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("player_progress")
            .select("coins, xp, owned_characters")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      setUsername(profileResult.data?.username ?? "Player");

      if (raceResult.error) {
        setMessage("Couldn't load your race stats. Please refresh.");
      } else {
        setRaces(raceResult.data ?? []);
      }

      if (progressResult.error) {
        setMessage(
          "Couldn't load your coins and XP. Please check your database permissions."
        );
      } else if (progressResult.data) {
        setProgress({
          coins: progressResult.data.coins ?? 0,
          xp: progressResult.data.xp ?? 0,
          owned_characters: progressResult.data.owned_characters ?? ["disciple"],
        });
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Couldn't sign out. Please try again.");
      return;
    }

    router.replace("/login");
  }

  const bestWpm = races.reduce(
    (best, race) => Math.max(best, race.wpm),
    0
  );

  const averageAccuracy =
    races.length === 0
      ? 0
      : Math.round(
          races.reduce((sum, race) => sum + race.accuracy, 0) /
            races.length
        );

  const level = getLevel(progress.xp);
  const xpInLevel = getLevelProgress(progress.xp);

  const ownedCharacterCount = progress.owned_characters.filter((id) =>
    CHARACTERS.some((character) => character.id === id)
  ).length;

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Loading your player profile...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <Navbar />

      <header style={styles.header}>
        <span />
        <button onClick={signOut} style={styles.signOut}>
          Sign Out
        </button>
      </header>

      <section style={styles.card}>
        <p style={styles.eyebrow}>PLAYER DASHBOARD</p>
        <h2 style={styles.heading}>Welcome, {username}!</h2>
        <p style={styles.subtitle}>
          Every race is a chance to improve.
        </p>

        {message && <p role="alert" style={styles.message}>{message}</p>}

        <button
          style={styles.raceButton}
          onClick={() => router.push("/")}
        >
          START RACING
        </button>

        <section style={styles.progressCard}>
          <div style={styles.levelHeader}>
            <div>
              <p style={styles.sectionLabel}>YOUR PROGRESS</p>
              <h3 style={styles.levelTitle}>Level {level}</h3>
            </div>
            <div style={styles.coinBadge}>
              <span style={styles.coinIcon}>C</span>
              <strong>{progress.coins.toLocaleString()}</strong>
              <span>coins</span>
            </div>
          </div>

          <div style={styles.xpRow}>
            <span>Experience points</span>
            <strong>{progress.xp.toLocaleString()} XP</strong>
          </div>

          <div
            style={styles.progressTrack}
            role="progressbar"
            aria-label="Progress toward next level"
            aria-valuenow={xpInLevel}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                ...styles.progressFill,
                width: `${xpInLevel}%`,
              }}
            />
          </div>

          <p style={styles.xpNote}>
            {100 - xpInLevel} XP until Level {level + 1}
          </p>

          <div style={styles.ownedCharacters}>
            <span>Biblical characters owned</span>
            <strong>{ownedCharacterCount} / {CHARACTERS.length}</strong>
          </div>

          <button
            style={styles.shopButton}
            onClick={() => router.push("/garage")}
          >
            VIEW CHARACTER COLLECTION
          </button>
        </section>

        <div style={styles.stats}>
          <div style={styles.statBox}>
            <strong>{races.length}</strong>
            <span>Races</span>
          </div>
          <div style={styles.statBox}>
            <strong>{bestWpm}</strong>
            <span>Best WPM</span>
          </div>
          <div style={styles.statBox}>
            <strong>
              {races.length === 0 ? "—" : `${averageAccuracy}%`}
            </strong>
            <span>Average Accuracy</span>
          </div>
        </div>

        <h3 style={styles.historyTitle}>RECENT RACES</h3>

        {races.length === 0 ? (
          <p style={styles.note}>
            No completed races saved yet. Finish a race to start building
            your stats!
          </p>
        ) : (
          <div style={styles.history}>
            {races.slice(0, 10).map((race) => (
              <div key={race.id} style={styles.raceRow}>
                <div>
                  <strong>{race.wpm} WPM</strong>
                  <p style={styles.raceDetails}>
                    {race.accuracy}% accuracy · {race.mistakes} mistakes
                  </p>
                </div>
                <span style={styles.date}>
                  {new Date(race.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <p style={styles.note}>
          Your stats update whenever you open or refresh this dashboard.
        </p>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b1120",
    color: "#f8fafc",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signOut: {
    background: "#1e293b",
    color: "white",
    border: "1px solid #475569",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  card: {
    maxWidth: "700px",
    margin: "50px auto",
    padding: "36px 24px",
    textAlign: "center",
    background: "#111c30",
    border: "1px solid #26364f",
    borderRadius: "20px",
  },
  eyebrow: {
    color: "#facc15",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "3px",
  },
  heading: {
    fontSize: "36px",
    margin: "16px 0",
    overflowWrap: "anywhere",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: "17px",
  },
  raceButton: {
    margin: "24px 0",
    padding: "15px 28px",
    background: "#facc15",
    color: "#111827",
    border: "none",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "16px",
    cursor: "pointer",
  },
  progressCard: {
    padding: "22px",
    background: "#0b1120",
    border: "1px solid #334155",
    borderRadius: "14px",
    textAlign: "left",
  },
  levelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  sectionLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
  },
  levelTitle: {
    margin: "6px 0 0",
    fontSize: "28px",
    color: "#facc15",
  },
  coinBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    background: "#1e293b",
    borderRadius: "10px",
  },
  coinIcon: {
    display: "inline-flex",
    width: "22px",
    height: "22px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#facc15",
    color: "#111827",
    fontWeight: 900,
  },
  xpRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "24px",
    color: "#cbd5e1",
    fontSize: "13px",
  },
  progressTrack: {
    height: "10px",
    marginTop: "10px",
    overflow: "hidden",
    background: "#334155",
    borderRadius: "999px",
  },
  progressFill: {
    height: "100%",
    background: "#facc15",
    borderRadius: "999px",
    transition: "width 250ms ease",
  },
  xpNote: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  ownedCharacters: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #26364f",
    color: "#cbd5e1",
  },
  shopButton: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    background: "#1e293b",
    color: "#facc15",
    border: "1px solid #475569",
    borderRadius: "8px",
    fontWeight: 900,
    cursor: "pointer",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "20px 8px",
    background: "#0b1120",
    borderRadius: "12px",
  },
  historyTitle: {
    textAlign: "left",
    marginTop: "32px",
    fontSize: "13px",
    letterSpacing: "2px",
    color: "#facc15",
  },
  history: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  raceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    padding: "14px",
    background: "#0b1120",
    borderRadius: "10px",
  },
  raceDetails: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  date: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  note: {
    marginTop: "24px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  message: {
    color: "#fca5a5",
    fontSize: "13px",
  },
};
