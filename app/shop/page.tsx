
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { createClient } from "../../lib/supabase/client";
import { CHARACTERS } from "../../lib/characters";

type Progress = {
  coins: number;
  owned_characters: string[];
};

export default function ShopPage() {
  const router = useRouter();

  const [progress, setProgress] = useState<Progress>({
    coins: 0,
    owned_characters: ["disciple"],
  });

  const [loading, setLoading] = useState(true);
  const [busyCharacter, setBusyCharacter] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadShop() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("player_progress")
        .select("coins, owned_characters")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Couldn't load your coins. Please refresh.");
      } else if (data) {
        setProgress({
          coins: data.coins ?? 0,
          owned_characters: data.owned_characters ?? ["disciple"],
        });
      }

      setLoading(false);
    }

    loadShop();
  }, [router]);

  async function buyCharacter(characterId: string) {
    setBusyCharacter(characterId);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.rpc("buy_character", {
      p_character_id: characterId,
    });

    if (error) {
      setMessage(error.message);
      setBusyCharacter("");
      return;
    }

    if (data?.error) {
      setMessage(data.error);
      setBusyCharacter("");
      return;
    }

    setProgress((previous) => ({
      coins:
        typeof data?.total_coins === "number"
          ? data.total_coins
          : previous.coins,
      owned_characters: Array.isArray(data?.owned_characters)
        ? data.owned_characters
        : [...previous.owned_characters, characterId],
    }));

    const character = CHARACTERS.find(
      (item) => item.id === characterId
    );

    setMessage(`${character?.name ?? "Character"} unlocked successfully!`);
    setBusyCharacter("");
  }

  return (
    <main style={styles.page}>
      <Navbar />

      <section style={styles.intro}>
        <p style={styles.eyebrow}>BIBLE TYPE MARKETPLACE</p>
        <h1 style={styles.title}>Character Shop</h1>
        <p style={styles.subtitle}>
          Unlock biblical figures and expand your collection using coins
          earned from racing.
        </p>

        {loading ? (
          <p>Loading character shop...</p>
        ) : (
          <p style={styles.balance}>
            Your balance:
            <strong>{progress.coins.toLocaleString()} coins</strong>
          </p>
        )}

        {message && (
          <p role="status" style={styles.message}>
            {message}
          </p>
        )}
      </section>

      {loading ? (
        <p style={styles.loading}>LOADING CHARACTERS...</p>
      ) : (
        <section style={styles.grid}>
          {CHARACTERS.map((character) => {
            const owned = progress.owned_characters.includes(character.id);

            return (
              <article key={character.id} style={styles.card}>
                <div
                  style={{
                    ...styles.avatar,
                    color: character.color,
                    borderColor: character.color,
                    background: `${character.color}15`,
                  }}
                >
                  {character.initials}
                </div>

                <p
                  style={{
                    ...styles.rarity,
                    color: character.color,
                  }}
                >
                  {character.rarity}
                </p>

                <h2 style={styles.characterName}>
                  {character.name}
                </h2>

                <p style={styles.characterTitle}>
                  {character.title}
                </p>

                <p style={styles.description}>
                  {character.description}
                </p>

                <p style={styles.price}>
                  {owned
                    ? "UNLOCKED"
                    : `${character.price.toLocaleString()} COINS`}
                </p>

                <button
                  style={
                    owned ? styles.ownedButton : styles.buyButton
                  }
                  disabled={
                    owned ||
                    busyCharacter !== "" ||
                    progress.coins < character.price
                  }
                  onClick={() => buyCharacter(character.id)}
                >
                  {owned
                    ? "ALREADY OWNED"
                    : busyCharacter === character.id
                      ? "UNLOCKING..."
                      : progress.coins < character.price
                        ? "NOT ENOUGH COINS"
                        : `UNLOCK FOR ${character.price.toLocaleString()} COINS`}
                </button>
              </article>
            );
          })}
        </section>
      )}

      <div style={styles.footer}>
        <button
          style={styles.garageButton}
          onClick={() => router.push("/garage")}
        >
          VIEW YOUR CHARACTER COLLECTION
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b1120",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
    paddingBottom: 40,
  },
  intro: {
    textAlign: "center",
    padding: "44px 20px 30px",
  },
  eyebrow: {
    color: "#facc15",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 3,
  },
  title: {
    fontSize: 42,
    fontWeight: 900,
    margin: "10px 0",
  },
  subtitle: {
    maxWidth: 550,
    margin: "0 auto",
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  balance: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    background: "#172338",
    borderRadius: 10,
  },
  message: {
    color: "#fde68a",
    overflowWrap: "anywhere",
  },
  loading: {
    padding: 50,
    color: "#94a3b8",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    maxWidth: 1200,
    padding: "0 24px",
    margin: "0 auto",
  },
  card: {
    padding: 24,
    textAlign: "center",
    background: "#111c30",
    border: "1px solid #26364f",
    borderRadius: 18,
  },
  avatar: {
    width: 85,
    height: 85,
    display: "grid",
    placeItems: "center",
    margin: "0 auto 12px",
    border: "2px solid",
    borderRadius: "50%",
    fontSize: 25,
    fontWeight: 950,
  },
  rarity: {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  characterName: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: 900,
  },
  characterTitle: {
    color: "#e1b955",
    fontSize: 12,
    fontWeight: 800,
  },
  description: {
    minHeight: 55,
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.6,
  },
  price: {
    color: "#facc15",
    fontWeight: 900,
  },
  buyButton: {
    width: "100%",
    padding: 13,
    background: "#facc15",
    color: "#111827",
    border: 0,
    borderRadius: 9,
    fontWeight: 900,
    cursor: "pointer",
  },
  ownedButton: {
    width: "100%",
    padding: 13,
    background: "#14532d",
    color: "#86efac",
    border: 0,
    borderRadius: 9,
    fontWeight: 900,
    cursor: "default",
  },
  garageButton: {
    padding: "14px 22px",
    background: "#172338",
    color: "#facc15",
    border: "1px solid #475569",
    borderRadius: 9,
    fontWeight: 900,
    cursor: "pointer",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 35,
    padding: "0 20px",
  },
};
