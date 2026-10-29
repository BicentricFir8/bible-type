
"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Progress = {
  coins: number;
  owned_cars: string[];
  selected_car: string;
};

const CARS = [
  {
    id: "blue",
    name: "Blue Racer",
    price: 0,
    color: "#38bdf8",
    description: "Your dependable starter car.",
  },
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

function CarPreview({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 240 120"
      role="img"
      aria-label="Car preview"
      style={{ width: "100%", maxWidth: "240px" }}
    >
      <ellipse cx="120" cy="99" rx="92" ry="10" fill="#020617" opacity=".45" />
      <path
        d="M25 72 L37 51 Q42 43 57 40 L83 21 Q89 16 102 16 L145 16 Q159 17 168 31 L190 48 L207 53 Q219 58 220 72 L215 86 L24 86 Z"
        fill={color}
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <path
        d="M91 25 L143 25 Q153 26 161 39 L174 49 L73 49 Z"
        fill="#172554"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      <path d="M117 25 L117 49" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M29 66 L52 66" stroke="#f8fafc" strokeWidth="5" />
      <path d="M193 64 L215 64" stroke="#fb7185" strokeWidth="5" />
      <circle cx="66" cy="85" r="19" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="66" cy="85" r="8" fill="#cbd5e1" />
      <circle cx="180" cy="85" r="19" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="180" cy="85" r="8" fill="#cbd5e1" />
    </svg>
  );
}

export default function GaragePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyCar, setBusyCar] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCar, setSelectedCar] = useState("blue");

  useEffect(() => {
    async function loadGarage() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("player_progress")
        .select("coins, owned_cars, selected_car")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Couldn't load your garage. Please refresh.");
      } else {
        const loadedProgress = data ?? {
          coins: 0,
          owned_cars: ["blue"],
          selected_car: "blue",
        };

        setProgress(loadedProgress);

        setSelectedCar(
  loadedProgress.selected_car &&
  loadedProgress.owned_cars.includes(loadedProgress.selected_car)
    ? loadedProgress.selected_car
    : "blue"
);
      }

      setLoading(false);
    }

    loadGarage();
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

    setProgress((previous) =>
      previous
        ? {
            ...previous,
            coins: data.coins_remaining,
            owned_cars: data.owned_cars,
          }
        : previous
    );

    setSelectedCar(carId);
    setMessage(`${CARS.find((car) => car.id === carId)?.name} unlocked!`);
    setBusyCar("");
  }

  if (loading) {
    return <main style={styles.page}>Loading your garage...</main>;
  }

  if (!progress) {
    return (
      <main style={styles.page}>
        <p>{message || "Couldn't load your player progress."}</p>
        <button style={styles.button} onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
     <Navbar />

      <section style={styles.intro}>
        <p style={styles.eyebrow}>YOUR COLLECTION</p>
        <h2 style={styles.title}>Car Garage</h2>
        <p style={styles.subtitle}>
          Earn coins by racing and unlock new rides.
        </p>
        <div style={styles.balance}>
          <span style={styles.coinIcon}>C</span>
          <strong>{progress.coins.toLocaleString()}</strong>
          <span>coins available</span>
        </div>
      </section>

      {message && (
        <p role="status" style={styles.message}>
          {message}
        </p>
      )}

      <section style={styles.grid}>
        {CARS.map((car) => {
          const owned = progress.owned_cars.includes(car.id);
          const selected = selectedCar === car.id;

          return (
            <article key={car.id} style={styles.carCard}>
              <div style={styles.carImage}>
                <CarPreview color={car.color} />
              </div>

              <h3 style={styles.carName}>{car.name}</h3>
              <p style={styles.description}>{car.description}</p>

              <p style={styles.price}>
                {car.price === 0 ? "FREE STARTER" : `${car.price} COINS`}
              </p>

              {owned ? (
                <button
                  style={selected ? styles.selectedButton : styles.button}
                 onClick={async () => {
  setMessage("");
  setBusyCar(car.id);

  const supabase = createClient();

  const { error } = await supabase.rpc("select_car", {
    p_car_id: car.id,
  });

  if (error) {
    setMessage(error.message);
    setBusyCar("");
    return;
  }

  setSelectedCar(car.id);
  setProgress((previous) =>
    previous
      ? { ...previous, selected_car: car.id }
      : previous
  );

  setMessage(`${car.name} selected for your next race.`);
  setBusyCar("");
}}
                >
                  {selected ? "SELECTED" : "SELECT CAR"}
                </button>
              ) : (
                <button
                  style={styles.button}
                  disabled={busyCar !== ""}
                  onClick={() => buyCar(car.id)}
                >
                  {busyCar === car.id
                    ? "PURCHASING..."
                    : `UNLOCK FOR ${car.price}`}
                </button>
              )}
            </article>
          );
        })}
      </section>

      <p style={styles.footer}>
        Car selection is currently saved on this page. Next, we'll connect
        your selected car to the actual race.
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#0b1120",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    color: "#facc15",
    fontSize: "25px",
    fontWeight: 900,
    letterSpacing: "2px",
  },
  secondaryButton: {
    padding: "10px 16px",
    color: "#f8fafc",
    background: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "9px",
    cursor: "pointer",
  },
  intro: {
    textAlign: "center",
    margin: "45px 0 28px",
  },
  eyebrow: {
    color: "#facc15",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "3px",
  },
  title: {
    margin: "10px 0",
    fontSize: "42px",
    fontWeight: 900,
  },
  subtitle: {
    color: "#cbd5e1",
  },
  balance: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "15px",
    padding: "12px 18px",
    background: "#172338",
    border: "1px solid #334155",
    borderRadius: "12px",
  },
  coinIcon: {
    display: "inline-flex",
    width: "23px",
    height: "23px",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    background: "#facc15",
    color: "#111827",
    fontWeight: 900,
  },
  message: {
    maxWidth: "500px",
    margin: "0 auto 20px",
    padding: "12px",
    textAlign: "center",
    color: "#fde68a",
    background: "#172338",
    borderRadius: "10px",
    overflowWrap: "anywhere",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  carCard: {
    padding: "24px",
    textAlign: "center",
    background: "#111c30",
    border: "1px solid #26364f",
    borderRadius: "18px",
  },
  carImage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "130px",
    background: "#0b1120",
    borderRadius: "12px",
  },
  carName: {
    marginTop: "18px",
    fontSize: "21px",
    fontWeight: 800,
  },
  description: {
    minHeight: "40px",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  price: {
    margin: "18px 0",
    color: "#facc15",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "1px",
  },
  button: {
    width: "100%",
    padding: "13px 10px",
    color: "#111827",
    background: "#facc15",
    border: "none",
    borderRadius: "9px",
    fontWeight: 900,
    cursor: "pointer",
  },
  selectedButton: {
    width: "100%",
    padding: "13px 10px",
    color: "#86efac",
    background: "#14532d",
    border: "1px solid #166534",
    borderRadius: "9px",
    fontWeight: 900,
    cursor: "pointer",
  },
  footer: {
    maxWidth: "700px",
    margin: "35px auto 0",
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "13px",
    lineHeight: 1.6,
  },
};
