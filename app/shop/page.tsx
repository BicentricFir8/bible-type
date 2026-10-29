
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { createClient } from "../../lib/supabase/client";

type Progress = {
  coins: number;
  owned_cars: string[];
};

const shopCars = [
  {
    id: "gold",
    name: "Gold Cruiser",
    price: 250,
    color: "#facc15",
    description: "A golden upgrade for dedicated racers.",
  },
  {
    id: "red",
    name: "Red Comet",
    price: 500,
    color: "#f87171",
    description: "A bold ride for serious Bible Type players.",
  },
];

export default function ShopPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyCar, setBusyCar] = useState("");
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
        .select("coins, owned_cars")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Couldn't load your coins. Please refresh.");
      } else {
        setProgress(
          data ?? {
            coins: 0,
            owned_cars: ["blue"],
          }
        );
      }

      setLoading(false);
    }

    loadShop();
  }, [router]);

  async function buyCar(carId: string) {
    setBusyCar(carId);
    setMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("buy_car", {
      p_car_id: carId,
    });

    if (error) {
      setMessage(error.message);
      setBusyCar("");
      return;
    }

    setProgress({
      coins: data.coins_remaining,
      owned_cars: data.owned_cars,
    });

    setMessage(
      `${shopCars.find((car) => car.id === carId)?.name} unlocked successfully!`
    );
    setBusyCar("");
  }

  return (
    <main style={styles.page}>
      <Navbar />

      <section style={styles.intro}>
        <p style={styles.eyebrow}>BIBLE TYPE MARKETPLACE</p>
        <h1 style={styles.title}>Car Shop</h1>
        <p style={styles.subtitle}>
          Spend your race earnings on new rides.
        </p>

        {loading ? (
          <p>Loading shop...</p>
        ) : (
          <p style={styles.balance}>
            Your balance: <strong>{progress?.coins.toLocaleString() ?? 0} coins</strong>
          </p>
        )}

        {message && <p role="status" style={styles.message}>{message}</p>}
      </section>

      <section style={styles.grid}>
        {shopCars.map((car) => {
          const owned = progress?.owned_cars.includes(car.id) ?? false;

          return (
            <article key={car.id} style={styles.card}>
              <div style={styles.preview}>
                <svg viewBox="0 0 240 120" style={{ width: "100%", maxWidth: 240 }}>
                  <ellipse cx="120" cy="99" rx="92" ry="10" fill="#020617" opacity=".45" />
                  <path
                    d="M25 72 L37 51 Q42 43 57 40 L83 21 Q89 16 102 16 L145 16 Q159 17 168 31 L190 48 L207 53 Q219 58 220 72 L215 86 L24 86 Z"
                    fill={car.color}
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  <path d="M91 25 L143 25 Q153 26 161 39 L174 49 L73 49 Z" fill="#172554" />
                  <circle cx="66" cy="85" r="19" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
                  <circle cx="66" cy="85" r="8" fill="#cbd5e1" />
                  <circle cx="180" cy="85" r="19" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
                  <circle cx="180" cy="85" r="8" fill="#cbd5e1" />
                </svg>
              </div>

              <h2 style={styles.carName}>{car.name}</h2>
              <p style={styles.description}>{car.description}</p>
              <p style={styles.price}>{car.price} COINS</p>

              <button
                style={owned ? styles.ownedButton : styles.buyButton}
                disabled={loading || owned || busyCar !== ""}
                onClick={() => buyCar(car.id)}
              >
                {owned
                  ? "ALREADY OWNED"
                  : busyCar === car.id
                    ? "PURCHASING..."
                    : `BUY FOR ${car.price} COINS`}
              </button>
            </article>
          );
        })}
      </section>
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
    padding: "44px 20px 24px",
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
    color: "#cbd5e1",
  },
  balance: {
    display: "inline-flex",
    gap: 8,
    padding: "12px 18px",
    background: "#172338",
    borderRadius: 10,
  },
  message: {
    color: "#fde68a",
    overflowWrap: "anywhere",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    maxWidth: 900,
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
  preview: {
    display: "grid",
    placeItems: "center",
    minHeight: 130,
    background: "#0b1120",
    borderRadius: 12,
  },
  carName: {
    marginTop: 18,
    fontSize: 21,
    fontWeight: 800,
  },
  description: {
    minHeight: 40,
    color: "#94a3b8",
    fontSize: 13,
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
};
