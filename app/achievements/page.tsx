
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { createClient } from "../../lib/supabase/client";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type Race = {
  wpm: number;
  accuracy: number;
};

const rarity: Record<string, string> = {
  first_race: "Common",
  ten_races: "Common",
  accuracy_95: "Uncommon",
  speed_60: "Uncommon",
  fifty_races: "Rare",
  speed_100: "Epic",
  perfect_accuracy: "Epic",
  hundred_races: "Legendary",
};

const rewards: Record<string, number> = {
  first_race: 25,
  ten_races: 50,
  speed_60: 75,
  accuracy_95: 100,
  fifty_races: 150,
  speed_100: 200,
  perfect_accuracy: 250,
  hundred_races: 500,
};

export default function AchievementsPage() {
  const router = useRouter();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [claimError, setClaimError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const [
        achievementResult,
        unlockedResult,
        raceResult,
        claimedResult,
      ] = await Promise.all([
        supabase
          .from("achievements")
          .select("id, name, description, icon")
          .order("name"),

        supabase
          .from("player_achievements")
          .select("achievement_id")
          .eq("user_id", user.id),

        supabase
          .from("race_results")
          .select("wpm, accuracy")
          .eq("user_id", user.id),

        supabase
          .from("achievement_claims")
          .select("achievement_id")
          .eq("user_id", user.id),
      ]);

      if (
        achievementResult.error ||
        unlockedResult.error ||
        raceResult.error ||
        claimedResult.error
      ) {
        setError(
          achievementResult.error?.message ||
          unlockedResult.error?.message ||
          raceResult.error?.message ||
          claimedResult.error?.message ||
          "Unable to load achievements."
        );
        setLoading(false);
        return;
      }

      setAchievements(achievementResult.data || []);

      setUnlocked(
        (unlockedResult.data || []).map(
          (item) => item.achievement_id
        )
      );

      setClaimed(
        (claimedResult.data || []).map(
          (item) => item.achievement_id
        )
      );

      setRaces(raceResult.data || []);
      setLoading(false);
    }

    loadData();
  }, [router]);

  async function claimReward(achievementId: string) {
    setClaimError("");
    setSuccessMessage("");
    setClaiming(achievementId);

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "claim_achievement_reward",
      {
        p_achievement_id: achievementId,
      }
    );

    if (error) {
      setClaimError(error.message);
      setClaiming(null);
      return;
    }

    setClaimed((previous) => [...previous, achievementId]);

    setSuccessMessage(
      `You claimed ${data.coins_awarded} coins!`
    );

    setClaiming(null);

    // Refresh the page so the Navbar loads the updated coin balance.
    window.location.reload();
  }

  const totalRaces = races.length;

  const bestWpm = totalRaces
    ? Math.max(...races.map((race) => race.wpm))
    : 0;

  const bestAccuracy = totalRaces
    ? Math.max(...races.map((race) => race.accuracy))
    : 0;

  const perfectAccuracy = races.some(
    (race) => race.accuracy >= 100
  );

  function getProgress(id: string): [number, number] {
    switch (id) {
      case "first_race":
        return [Math.min(totalRaces, 1), 1];
      case "ten_races":
        return [Math.min(totalRaces, 10), 10];
      case "fifty_races":
        return [Math.min(totalRaces, 50), 50];
      case "hundred_races":
        return [Math.min(totalRaces, 100), 100];
      case "speed_60":
        return [Math.min(bestWpm, 60), 60];
      case "speed_100":
        return [Math.min(bestWpm, 100), 100];
      case "accuracy_95":
        return [Math.min(bestAccuracy, 95), 95];
      case "perfect_accuracy":
        return [perfectAccuracy ? 1 : 0, 1];
      default:
        return [0, 1];
    }
  }

  const percentage = achievements.length
    ? Math.round((unlocked.length / achievements.length) * 100)
    : 0;

  return (
    <main style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <p style={styles.eyebrow}>YOUR COLLECTION</p>
        <h1 style={styles.title}>Achievements</h1>
        <p style={styles.subtitle}>
          Complete races, improve your typing, and earn achievements.
          Claim coins when you unlock them!
        </p>

        {loading ? (
          <p style={styles.message}>Loading achievements...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <>
            <section style={styles.summary}>
              <div>
                <p style={styles.label}>ACHIEVEMENTS UNLOCKED</p>
                <strong style={styles.number}>
                  {unlocked.length} / {achievements.length}
                </strong>
              </div>

              <div style={styles.overallProgress}>
                <div style={styles.progressHeader}>
                  <span>Collection progress</span>
                  <strong>{percentage}%</strong>
                </div>
                <div style={styles.track}>
                  <div
                    style={{
                      ...styles.fill,
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {claimError && (
              <p style={styles.error}>{claimError}</p>
            )}

            {successMessage && (
              <p style={styles.success}>{successMessage}</p>
            )}

            <section style={styles.grid}>
              {achievements.map((achievement) => {
                const isUnlocked = unlocked.includes(achievement.id);
                const isClaimed = claimed.includes(achievement.id);
                const reward = rewards[achievement.id] || 0;

                const [current, target] = getProgress(achievement.id);

                const progress = Math.round(
                  (current / target) * 100
                );

                return (
                  <article
                    key={achievement.id}
                    style={{
                      ...styles.card,
                      ...(isUnlocked ? styles.unlockedCard : {}),
                    }}
                  >
                    <div style={styles.cardTop}>
                      <span style={styles.icon}>
                        {achievement.icon}
                      </span>

                      <span style={styles.rarity}>
                        {rarity[achievement.id] || "Standard"}
                      </span>
                    </div>

                    <h2 style={styles.cardTitle}>
                      {achievement.name}
                    </h2>

                    <p style={styles.description}>
                      {achievement.description}
                    </p>

                    <div style={styles.reward}>
                      <span>COIN REWARD</span>
                      <strong>{reward} C</strong>
                    </div>

                    <div style={styles.progressHeader}>
                      <span>
                        {isUnlocked ? "Completed" : "Progress"}
                      </span>
                      <strong>
                        {isUnlocked ? 100 : progress}%
                      </strong>
                    </div>

                    <div style={styles.track}>
                      <div
                        style={{
                          ...styles.fill,
                          width: `${isUnlocked ? 100 : progress}%`,
                        }}
                      />
                    </div>

                    <p style={styles.progressText}>
                      {isUnlocked
                        ? "Achievement unlocked!"
                        : `${current} / ${target}`}
                    </p>

                    {!isUnlocked ? (
                      <p style={styles.status}>LOCKED</p>
                    ) : isClaimed ? (
                      <p style={styles.claimed}>✓ REWARD CLAIMED</p>
                    ) : (
                      <button
                        style={styles.claimButton}
                        disabled={claiming !== null}
                        onClick={() => claimReward(achievement.id)}
                      >
                        {claiming === achievement.id
                          ? "CLAIMING..."
                          : `CLAIM ${reward} COINS`}
                      </button>
                    )}
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b1424",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "45px 24px 70px",
  },
  eyebrow: {
    color: "#facc15",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2px",
  },
  title: {
    fontSize: "36px",
    fontWeight: 900,
    margin: "8px 0",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "30px",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "25px",
    padding: "25px",
    background: "#17243a",
    border: "1px solid #2b3b55",
    borderRadius: "16px",
    marginBottom: "30px",
  },
  label: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 800,
  },
  number: {
    fontSize: "32px",
    color: "#facc15",
  },
  overallProgress: {
    flex: 1,
    minWidth: "220px",
    maxWidth: "500px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#cbd5e1",
    fontSize: "12px",
    marginBottom: "9px",
  },
  track: {
    height: "8px",
    background: "#334155",
    borderRadius: "20px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    background: "#facc15",
    borderRadius: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "22px",
    background: "#17243a",
    border: "1px solid #2b3b55",
    borderRadius: "15px",
    opacity: 0.8,
  },
  unlockedCard: {
    border: "1px solid #b28b22",
    opacity: 1,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  icon: {
    fontSize: "30px",
    background: "#26364f",
    padding: "12px",
    borderRadius: "12px",
  },
  rarity: {
    color: "#facc15",
    fontSize: "11px",
    fontWeight: 800,
  },
  cardTitle: {
    fontSize: "18px",
    marginBottom: "8px",
  },
  description: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
    minHeight: "40px",
  },
  reward: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#26364f",
    borderRadius: "8px",
    padding: "10px",
    margin: "15px 0",
    color: "#cbd5e1",
    fontSize: "11px",
    fontWeight: 800,
  },
  progressText: {
    color: "#94a3b8",
    fontSize: "11px",
  },
  status: {
    borderTop: "1px solid #334155",
    paddingTop: "13px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1px",
  },
  claimed: {
    borderTop: "1px solid #334155",
    paddingTop: "13px",
    color: "#4ade80",
    fontSize: "11px",
    fontWeight: 900,
  },
  claimButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    background: "#facc15",
    color: "#111827",
    border: "none",
    borderRadius: "8px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
  },
  message: {
    color: "#cbd5e1",
    padding: "30px 0",
  },
  error: {
    color: "#fecaca",
    background: "#451d2b",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  success: {
    color: "#bbf7d0",
    background: "#163b2b",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
};
