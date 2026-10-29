
"use client";

import Navbar from "./components/Navbar";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../lib/supabase/client";

type RaceStatus = "ready" | "countdown" | "racing" | "finished";

type CarOption = {
  id: string;
  name: string;
  color: string;
  accent: string;
};

const PASSAGE =
  "Yahweh is my shepherd: I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He guides me in the paths of righteousness for his name's sake.";

const CARS: CarOption[] = [
  {
    id: "blue",
    name: "Blue Racer",
    color: "#39a9ff",
    accent: "#d3efff",
  },
  {
    id: "gold",
    name: "Gold Cruiser",
    color: "#f4bd4f",
    accent: "#fff0ad",
  },
  {
    id: "red",
    name: "Red Comet",
    color: "#ff5e6c",
    accent: "#ffd9dc",
  },
];

const BOT_RACERS = [
  {
    id: "psalm",
    name: "PSALM PILOT",
    initials: "PP",
    color: "#ad8cff",
    accent: "#e9deff",
    finishSeconds: 29,
  },
  {
    id: "grace",
    name: "GRACE RACER",
    initials: "GR",
    color: "#51dba0",
    accent: "#d2ffea",
    finishSeconds: 38,
  },
  {
    id: "verse",
    name: "VERSE VELOCITY",
    initials: "VV",
    color: "#ff9256",
    accent: "#ffe0cb",
    finishSeconds: 49,
  },
];

function CarGraphic({
  color,
  accent,
}: {
  color: string;
  accent: string;
}) {
  return (
    <svg
      viewBox="0 0 128 64"
      width="94"
      height="48"
      role="img"
      aria-label="Race car"
    >
      <ellipse
        cx="64"
        cy="51"
        rx="52"
        ry="8"
        fill="#020617"
        opacity="0.5"
      />
      <circle cx="30" cy="44" r="11" fill="#080d15" />
      <circle cx="30" cy="44" r="5" fill="#9ca9b8" />
      <circle cx="94" cy="44" r="11" fill="#080d15" />
      <circle cx="94" cy="44" r="5" fill="#9ca9b8" />

      <path
        d="M8 36 L13 27 Q16 23 28 22 L47 19 L59 9 L83 9 Q93 9 100 21 L112 25 Q120 27 121 35 L120 42 L8 42 Z"
        fill={color}
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <path
        d="M51 19 L61 12 L81 12 Q88 12 94 21 Z"
        fill="#172c43"
      />
      <path
        d="M62 13 L62 19 L88 20 Q84 13 79 13 Z"
        fill={accent}
        opacity="0.7"
      />
      <path
        d="M17 29 L44 25 L48 36 L13 36 Z"
        fill={accent}
        opacity="0.5"
      />
      <path
        d="M51 27 L103 27 L110 31 L51 31 Z"
        fill="#ffffff"
        opacity="0.24"
      />
      <path d="M9 35 L19 35 L16 39 L9 39 Z" fill="#fff2c7" />
      <path d="M111 32 L119 34 L119 38 L111 38 Z" fill="#ff354c" />
      <path d="M13 22 L34 21 L30 25 L14 26 Z" fill={accent} />
      <path d="M88 42 L105 42 L109 39 L110 42 Z" fill="#0b1220" />
    </svg>
  );
}

function formatTime(milliseconds: number) {
  const safeTime = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const tenths = Math.floor((safeTime % 1000) / 100);

  return `${minutes}:${seconds}.${tenths}`;
}

export default function HomePage() {
  const savedRaceRef = useRef(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [status, setStatus] = useState<RaceStatus>("ready");
  const [selectedCarId, setSelectedCarId] = useState("blue");
  const [ownedCars, setOwnedCars] = useState<string[]>(["blue"]);
  const [typed, setTyped] = useState("");
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [raceStartAt, setRaceStartAt] = useState<number | null>(null);
  const [finishTimeMs, setFinishTimeMs] = useState<number | null>(null);

  const typingRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
  async function loadSelectedCar() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("player_progress")
      .select("selected_car")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Could not load selected car:", error.message);
      return;
    }

    if (data && CARS.some((car) => car.id === data.selected_car)) {
      setSelectedCarId(data.selected_car);
    }
  }

  loadSelectedCar();
}, []);

  const selectedCar = CARS.find((car) => car.id === selectedCarId) ?? CARS[0];

  let correctCount = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === PASSAGE[i]) correctCount++;
  }

 const totalKeyAttempts = correctKeystrokes + mistakes;

const accuracy =
  totalKeyAttempts === 0
    ? 0
    : Math.round((correctKeystrokes / totalKeyAttempts) * 100);

const progress = Math.min(
  100,
  Math.round((typed.length / PASSAGE.length) * 100)
);

  const shownTime = finishTimeMs ?? elapsedMs;

  const wpm =
    shownTime > 0
      ? Math.round(typed.length / 5 / (shownTime / 60000))
      : 0;

  const finishSeconds = finishTimeMs === null ? null : finishTimeMs / 1000;

  const place =
    finishSeconds === null
      ? null
      : 1 +
        BOT_RACERS.filter((racer) => racer.finishSeconds < finishSeconds)
          .length;

  useEffect(() => {
    if (status !== "countdown") return;

    const timeout = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setRaceStartAt(Date.now());
        setStatus("racing");
      }
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [status, countdown]);

  useEffect(() => {
    if (status !== "racing" || raceStartAt === null) return;

    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - raceStartAt);
    }, 100);

    return () => window.clearInterval(interval);
  }, [status, raceStartAt]);

  useEffect(() => {
    if (status === "racing") {
      typingRef.current?.focus();
    }
  }, [status]);
  
useEffect(() => {
  if (status !== "finished" || finishTimeMs === null) return;
  if (savedRaceRef.current) return;

  savedRaceRef.current = true;

  async function saveRace() {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaveMessage("Sign in to save your race stats.");
      return;
    }

    const finalWpm =
finishTimeMs !== null && finishTimeMs > 0
        ? Math.round(typed.length / 5 / (finishTimeMs / 60000))
        : 0;

   
const { data: reward, error } = await supabase.rpc("complete_race", {
  p_wpm: finalWpm,
  p_accuracy: accuracy,
  p_mistakes: mistakes,
  p_duration_ms: finishTimeMs,
});

if (error) {
  console.error("Could not save race:", error.message);
  setSaveMessage(error.message);
  savedRaceRef.current = false;
  return;
}

setSaveMessage(
  `Race saved! +${reward.coins_earned} coins and +${reward.xp_earned} XP.`
);

  }

  saveRace();
}, [status, finishTimeMs, typed.length, accuracy, mistakes]);


  function startRace() {
    savedRaceRef.current = false;
    setSaveMessage("");
    setTyped("");
    setCorrectKeystrokes(0);
    setMistakes(0);
    setFeedback("");
    setElapsedMs(0);
    setFinishTimeMs(null);
    setRaceStartAt(null);
    setCountdown(3);
    setStatus("countdown");
  }


function handleTypingKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (status !== "racing") {
    event.preventDefault();
    return;
  }

  // Let the browser handle keyboard shortcuts without counting them.
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  // Backspace moves back one character so you can retry it.
  if (event.key === "Backspace") {
    event.preventDefault();
    setTyped((current) => current.slice(0, -1));
    setFeedback("");
    return;
  }

  // Ignore non-character keys, such as arrows and Shift.
  if (event.key.length !== 1) {
    event.preventDefault();
    return;
  }

  // Prevent the browser from inserting the key automatically.
  event.preventDefault();

  const expected = PASSAGE[typed.length];

  if (expected === undefined) return;

  // A wrong key counts as a mistake but does NOT advance.
  if (event.key !== expected) {
    setMistakes((current) => current + 1);

    const expectedLabel =
      expected === " " ? "SPACE" : `“${expected}”`;

    const pressedLabel =
      event.key === " " ? "SPACE" : `“${event.key}”`;

    setFeedback(
      `Wrong key! You pressed ${pressedLabel}. Press ${expectedLabel} to advance.`
    );

    return;
  }

  // Only the exact correct key advances your position.
  const nextText = typed + event.key;

  setTyped(nextText);
  setCorrectKeystrokes((current) => current + 1);
  setFeedback("");

  // Finish the race only when the entire passage is correct.
  if (nextText === PASSAGE && raceStartAt !== null) {
    const finalTime = Date.now() - raceStartAt;

    setElapsedMs(finalTime);
    setFinishTimeMs(finalTime);
    setStatus("finished");
  }
}


  function changeCar() {
    setTyped("");
    setCorrectKeystrokes(0);
    setMistakes(0);
    setFeedback("");
    setElapsedMs(0);
    setFinishTimeMs(null);
    setRaceStartAt(null);
    setCountdown(3);
    setStatus("ready");
  }

  const playerProgress = status === "finished" ? 100 : progress;

  const racers = [
    {
      id: "you",
      name: "YOU",
      initials: "YOU",
      color: selectedCar.color,
      accent: selectedCar.accent,
      progress: playerProgress,
      isPlayer: true,
    },
    ...BOT_RACERS.map((racer) => ({
      ...racer,
      progress: Math.min(
        100,
        Math.round(((shownTime / 1000) / racer.finishSeconds) * 100)
      ),
      isPlayer: false,
    })),
  ];
 <Navbar />
  return (
    <main className="bt-page">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Bible Type home">
          <span className="brand-icon">B</span>
          <span>
            <span className="brand-name">BIBLE TYPE</span>
            <span className="brand-subtitle">SCRIPTURE RACING</span>
          </span>
        </a>

        <div className="topbar-right">
          <span className="mode-pill">
            <span className="online-dot" />
            SOLO RACE
          </span>
          <a className="profile-link" href="/dashboard">
            PLAYER PROFILE ↗
          </a>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">READY · SET · TYPE</div>
          <h1>Faith meets the <span>fast lane.</span></h1>
          <p>
            Race through Scripture. Find your rhythm. Make every word count.
          </p>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <div className="hero-mark-line" />
          <div className="hero-mark-line short" />
          <div className="hero-mark-label">BT / 001</div>
        </div>
      </section>

      <div className="main-grid">
        <section className="panel race-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">THE CIRCUIT</div>
              <h2>Race Arena</h2>
            </div>
            <span className={`race-status status-${status}`}>
              <span className="status-dot" />
              {status === "ready"
                ? "STAGING"
                : status === "countdown"
                  ? "GET READY"
                  : status === "racing"
                    ? "RACE LIVE"
                    : "FINISHED"}
            </span>
          </div>

          <div className="track-heading">
            <span>RACER</span>
            <div className="track-heading-labels">
              <span>START</span>
              <span>FINISH</span>
            </div>
          </div>

          <div className="track-area">
            <div className="track-lanes">
              {racers.map((racer, index) => (
                <div className="race-lane" key={racer.id}>
                  <div className="runner-label">
                    <span
                      className="runner-initials"
                      style={{
                        borderColor: racer.color,
                        color: racer.color,
                      }}
                    >
                      {racer.initials}
                    </span>
                    <span className="runner-name">
                      {racer.isPlayer ? selectedCar.name : racer.name}
                    </span>
                  </div>

                  <div className={`track-lane lane-${index}`}>
                    <div className="start-line" />
                    <div className="finish-line" />
                    <div
                      className="lane-car"
                      style={{
                        left: `calc(${racer.progress}% - ${
                          racer.progress * 0.94
                        }px)`,
                      }}
                    >
                      <CarGraphic
                        color={racer.color}
                        accent={racer.accent}
                      />
                    </div>
                    <span className="lane-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {status === "countdown" && (
              <div className="race-overlay" role="status" aria-live="assertive">
                <div className="countdown-number">{countdown}</div>
                <div className="countdown-label">GET READY TO RACE</div>
              </div>
            )}
          </div>

          <div className="track-footer">
            <span>
              <span className="legend-dot player-dot" /> YOUR CAR
            </span>
            <span>
              <span className="legend-dot bot-dot" /> COMPUTER RACERS
            </span>
            <span className="track-code">TRACK 01 · SCRIPTURE SPRINT</span>
          </div>

          {status === "finished" && place !== null && (
            <div className="result-card">
              <div className="result-badge">{place === 1 ? "1ST" : `${place}TH`}</div>
              <div className="result-copy">
                <div className="section-kicker">
                  {place === 1 ? "VICTORY" : "RACE COMPLETE"}
                </div>
                <h3>
                  {place === 1
                    ? "You crossed the finish line first!"
                    : "Great job finishing the race!"}
                </h3>
                <p>
                  You finished in {formatTime(finishTimeMs ?? 0)} with{" "}
                  {wpm} WPM and {accuracy}% accuracy.
                </p>
                <p role="status">{saveMessage || "Saving your race..."}</p>
              </div>
              <div className="result-actions">
                <button className="primary-button" onClick={startRace}>
                  RACE AGAIN ↗
                </button>
                <button className="secondary-button" onClick={changeCar}>
                  CHANGE CAR
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="sidebar">
          <section className="panel garage-panel">
            <div className="section-kicker">YOUR GARAGE</div>
            <h2>Choose your ride</h2>
            <p className="panel-description">
              Pick a car before the starting lights.
            </p>

           
<div className="car-options">
  {CARS.map((car) => {
    const isOwned = ownedCars.includes(car.id);
    const isSelected = selectedCarId === car.id;

    return (
      <button
        key={car.id}
        className={`car-option ${isSelected ? "selected" : ""}`}
        onClick={async () => {
          if (!isOwned) return;

          const supabase = createClient();

          const { error } = await supabase.rpc("select_car", {
            p_car_id: car.id,
          });

          if (error) {
            console.error("Could not select car:", error.message);
            setSaveMessage("Could not select this car. Please try again.");
            return;
          }

          setSelectedCarId(car.id);
          setSaveMessage("");
        }}
        disabled={
          !isOwned ||
          status === "countdown" ||
          status === "racing"
        }
        aria-pressed={isSelected}
      >
        <span
          className="car-swatch"
          style={{ background: car.color }}
        />

        <span className="car-option-name">
          {car.name}
          {!isOwned && " — LOCKED"}
        </span>

        <span className="car-option-check">
          {isSelected ? "✓" : !isOwned ? "🔒" : ""}
        </span>
      </button>
    );
  })}
</div>


            <div className="selected-car-preview">
              <CarGraphic
                color={selectedCar.color}
                accent={selectedCar.accent}
              />
              <div>
                <span className="preview-label">SELECTED VEHICLE</span>
                <strong>{selectedCar.name}</strong>
              </div>
            </div>

            <button
              className="primary-button start-button"
              onClick={startRace}
              disabled={status === "countdown" || status === "racing"}
            >
              {status === "ready"
                ? "START RACE  →"
                : status === "countdown"
                  ? "GET READY..."
                  : status === "racing"
                    ? "RACE IN PROGRESS"
                    : "RACE COMPLETE"}
            </button>

            <p className="garage-note">
              {status === "ready"
                ? "Hit the button when you are ready."
                : status === "countdown"
                  ? "Take a breath. The race is about to begin."
                  : status === "racing"
                    ? "Type the passage exactly as shown below."
                    : "Your results are ready. Race again whenever you like."}
            </p>
          </section>

          <section className="panel stats-panel">
            <div className="section-kicker">LIVE TELEMETRY</div>
            <h2>Your race stats</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">SPEED</span>
                <strong>{status === "ready" ? "—" : wpm}</strong>
                <span className="stat-unit">WPM</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">ACCURACY</span>
                <strong>
                  {totalKeyAttempts === 0 ? "—" : `${accuracy}%`}
                </strong>
                <span className="stat-unit">CORRECT</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">TIME</span>
                <strong className="time-value">{formatTime(shownTime)}</strong>
                <span className="stat-unit">ELAPSED</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">PROGRESS</span>
                <strong>{progress}%</strong>
                <span className="stat-unit">PASSAGE</span>
              </div>
            </div>

            <div className="progress-heading">
              <span>RACE PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Passage typing progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        </aside>

        <section className="panel typing-panel">
          <div className="typing-heading">
            <div>
              <div className="section-kicker">THE WORD IS YOUR TRACK</div>
              <h2>Type the passage</h2>
            </div>
            <span className="translation-pill">WORLD ENGLISH BIBLE · WEB</span>
          </div>

          <div className="verse-box">
            <div className="verse-reference">PSALM 23:1–3</div>
            <p className="verse-text" aria-label={PASSAGE}>
              {PASSAGE.split("").map((character, index) => {
                const characterWasTyped = index < typed.length;
                const isCorrect =
                  characterWasTyped && typed[index] === character;
                const isIncorrect =
                  characterWasTyped && typed[index] !== character;
                const isCurrent =
                  index === typed.length && status === "racing";

                let className = "verse-character";
                if (isCorrect) className += " character-correct";
                if (isIncorrect) className += " character-incorrect";
                if (isCurrent) className += " character-current";

                return (
                  <span className={className} key={index}>
                    {character === " " ? "\u00A0" : character}
                  </span>
                );
              })}
            </p>
          </div>

          <label className="typing-label" htmlFor="race-input">
            {status === "ready"
              ? "YOUR INPUT"
              : status === "countdown"
                ? "GET INTO POSITION"
                : status === "racing"
                  ? "TYPE NOW — EVERY CHARACTER COUNTS"
                  : "RACE FINISHED"}
          </label>

          <textarea
            ref={typingRef}
            id="race-input"
            className="typing-input"
            value={typed}
            onKeyDown={handleTypingKey}
            readOnly
            maxLength={PASSAGE.length}
            rows={3}
            disabled={status !== "racing"}
            placeholder={
              status === "ready"
                ? "Press START RACE to begin..."
                : status === "countdown"
                  ? "Get ready..."
                  : status === "racing"
                    ? "Start typing the passage here..."
                    : "You finished the passage!"
            }
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby="typing-help"
          />

          <div className="typing-bottom">
            {feedback && (
  <p className="typing-feedback" role="status">
    {feedback}
  </p>
)}
            <p id="typing-help">
              {status === "racing"
                ? "Type the passage exactly as shown. Use Backspace to correct mistakes."
                : status === "finished"
                  ? "Well raced! Check your results above."
                  : "Your typing area will unlock when the race begins."}
            </p>
            <span className="character-count">
              {typed.length} / {PASSAGE.length} CHARACTERS
            </span>
          </div>
        </section>
      </div>

      <footer className="page-footer">
        <span>BIBLE TYPE <span className="footer-dot">•</span> LEARN · TYPE · RACE</span>
        <span>PASSAGE: PSALM 23:1–3 · WORLD ENGLISH BIBLE (PUBLIC DOMAIN)</span>
      </footer>

      <style jsx global>{`
      .typing-feedback {
  margin: 10px 0 0;
  color: #ff8292;
  font-size: 11px;
  font-weight: 800;
}
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #08111f;
          color: #edf3ff;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        textarea {
          font: inherit;
        }

        button:focus-visible,
        a:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #f4bd4f;
          outline-offset: 3px;
        }

        .bt-page {
          min-height: 100vh;
          padding: 24px clamp(14px, 3vw, 38px) 22px;
          background:
            radial-gradient(ellipse at 75% 0%, rgba(30, 92, 140, 0.18), transparent 38%),
            #08111f;
        }

        .topbar {
          max-width: 1380px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding-bottom: 25px;
          border-bottom: 1px solid #1f2b3c;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: inherit;
          text-decoration: none;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f4bd4f;
          color: #111827;
          font-size: 25px;
          line-height: 1;
          font-weight: 1000;
          font-style: italic;
          box-shadow: 0 5px 25px rgba(244, 189, 79, 0.13);
        }

        .brand-name,
        .brand-subtitle {
          display: block;
        }

        .brand-name {
          font-size: 19px;
          font-weight: 950;
          letter-spacing: 1.8px;
        }

        .brand-subtitle {
          margin-top: 4px;
          color: #7e94ad;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.2px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mode-pill,
        .profile-link {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #29394e;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .mode-pill {
          color: #b4c6d9;
          background: #111d2e;
        }

        .online-dot,
        .status-dot {
          width: 7px;
          height: 7px;
          display: inline-block;
          border-radius: 50%;
          background: #52dda0;
          box-shadow: 0 0 10px rgba(82, 221, 160, 0.35);
        }

        .profile-link {
          color: #f4bd4f;
          text-decoration: none;
          background: rgba(244, 189, 79, 0.06);
          transition: background 0.15s ease;
        }

        .profile-link:hover {
          background: rgba(244, 189, 79, 0.13);
        }

        .hero {
          max-width: 1380px;
          margin: 0 auto;
          min-height: 175px;
          padding: 33px 0 27px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .eyebrow,
        .section-kicker {
          color: #eab84e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .hero h1 {
          margin: 12px 0 9px;
          font-size: clamp(29px, 4.3vw, 45px);
          line-height: 1.05;
          letter-spacing: -1.8px;
          font-weight: 950;
        }

        .hero h1 span {
          color: #f4bd4f;
        }

        .hero p {
          margin: 0;
          color: #93a6bd;
          font-size: 14px;
          line-height: 1.6;
        }

        .hero-mark {
          width: 150px;
          min-width: 125px;
          height: 90px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 9px;
          border-left: 1px solid #29374b;
          padding-left: 25px;
          opacity: 0.85;
        }

        .hero-mark-line {
          width: 80px;
          height: 5px;
          border-radius: 10px;
          background: #f4bd4f;
          transform: skewX(-28deg);
        }

        .hero-mark-line.short {
          width: 52px;
          background: #477ba4;
        }

        .hero-mark-label {
          margin-top: 3px;
          color: #7e94ad;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 900;
        }

        .main-grid {
          max-width: 1380px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 315px;
          gap: 18px;
          align-items: start;
        }

        .panel {
          min-width: 0;
          border: 1px solid #24344a;
          border-radius: 13px;
          background: linear-gradient(145deg, #111e30, #0e1929);
          box-shadow: 0 13px 34px rgba(0, 0, 0, 0.12);
        }

        .race-panel {
          padding: 22px;
        }

        .panel-heading,
        .typing-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .panel-heading h2,
        .garage-panel h2,
        .stats-panel h2,
        .typing-heading h2 {
          margin: 7px 0 0;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }

        .race-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          color: #a9bdd1;
          background: #142438;
          border: 1px solid #2a3b50;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
          white-space: nowrap;
        }

        .status-racing .status-dot {
          animation: pulse 1s infinite;
        }

        .status-finished .status-dot {
          background: #f4bd4f;
        }

        .track-heading {
          display: grid;
          grid-template-columns: 105px 1fr;
          gap: 10px;
          margin-top: 26px;
          margin-bottom: 8px;
          color: #7389a2;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .track-heading-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 7px;
        }

        .track-area {
          position: relative;
          overflow: hidden;
          border: 1px solid #2a3b50;
          border-radius: 9px;
          background: #101927;
        }

        .track-lanes {
          padding: 7px 0;
        }

        .race-lane {
          min-width: 0;
          min-height: 74px;
          display: grid;
          grid-template-columns: 105px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          padding: 5px 10px;
          border-bottom: 1px solid #202e40;
        }

        .race-lane:last-child {
          border-bottom: 0;
        }

        .runner-label {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .runner-initials {
          width: 28px;
          height: 28px;
          min-width: 28px;
          display: grid;
          place-items: center;
          border: 1px solid;
          border-radius: 7px;
          background: #101927;
          font-size: 9px;
          font-weight: 950;
        }

        .runner-name {
          min-width: 0;
          overflow: hidden;
          color: #9dafc3;
          font-size: 9px;
          font-weight: 850;
          line-height: 1.3;
          letter-spacing: 0.3px;
          overflow-wrap: anywhere;
        }

        .track-lane {
          position: relative;
          min-width: 0;
          height: 59px;
          overflow: hidden;
          border: 1px solid rgba(135, 158, 184, 0.12);
          border-radius: 5px;
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0 32px,
              rgba(255, 255, 255, 0.025) 32px 33px
            ),
            linear-gradient(180deg, #202d3b 0%, #182433 100%);
        }

        .track-lane::before {
          position: absolute;
          top: 50%;
          right: 0;
          left: 0;
          border-top: 1px dashed rgba(208, 222, 238, 0.25);
          content: "";
        }

        .start-line {
          position: absolute;
          z-index: 1;
          top: 0;
          bottom: 0;
          left: 3px;
          width: 3px;
          background: rgba(242, 248, 255, 0.68);
        }

        .finish-line {
          position: absolute;
          z-index: 1;
          top: 0;
          right: 3px;
          bottom: 0;
          width: 12px;
          background-color: #e8edf4;
          background-image: repeating-conic-gradient(
            #172334 0% 25%,
            #e8edf4 0% 50%
          );
          background-size: 12px 12px;
        }

        .lane-car {
          position: absolute;
          z-index: 2;
          top: 50%;
          width: 94px;
          height: 48px;
          display: flex;
          align-items: center;
          transform: translateY(-50%);
          transition: left 0.12s linear;
        }

        .lane-car svg {
        transform: scaleX(-1);
          display: block;
          width: 94px;
          max-width: none;
          height: 48px;
          filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.3));
        }

        .lane-number {
          position: absolute;
          right: 20px;
          bottom: 3px;
          color: rgba(204, 217, 230, 0.36);
          font-size: 8px;
          font-weight: 900;
        }

        .race-overlay {
          position: absolute;
          z-index: 8;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(6, 13, 24, 0.72);
          backdrop-filter: blur(3px);
          text-align: center;
        }

        .countdown-number {
          color: #f4bd4f;
          font-size: clamp(54px, 8vw, 86px);
          font-weight: 1000;
          line-height: 1;
          text-shadow: 0 0 35px rgba(244, 189, 79, 0.2);
        }

        .countdown-label {
          color: #e6eef8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .track-footer {
          min-height: 40px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          padding-top: 15px;
          color: #849ab2;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .track-footer > span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 7px;
          height: 7px;
          display: inline-block;
          border-radius: 50%;
        }

        .player-dot {
          background: #39a9ff;
        }

        .bot-dot {
          background: #ad8cff;
        }

        .track-code {
          margin-left: auto;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .garage-panel,
        .stats-panel {
          padding: 20px;
        }

        .panel-description {
          margin: 8px 0 17px;
          color: #8fa3b9;
          font-size: 12px;
          line-height: 1.5;
        }

        .car-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .car-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          color: #b6c6d8;
          text-align: left;
          border: 1px solid #293a50;
          border-radius: 8px;
          background: #0d1827;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .car-option:hover:not(:disabled) {
          border-color: #536780;
        }

        .car-option.selected {
          color: #f1f6fc;
          border-color: #d9a83f;
          background: rgba(244, 189, 79, 0.075);
        }

        .car-option:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .car-swatch {
          width: 9px;
          height: 24px;
          display: block;
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.06);
        }

        .car-option-name {
          flex: 1;
          font-size: 12px;
          font-weight: 800;
        }

        .car-option-check {
          color: #f4bd4f;
          font-weight: 950;
        }

        .selected-car-preview {
          min-height: 75px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 15px 0;
          padding: 8px;
          border: 1px dashed #2b3b50;
          border-radius: 8px;
          background: rgba(6, 15, 28, 0.4);
        }

        .selected-car-preview svg {
        transform: scaleX(-1);
          flex: 0 0 94px;
        }

        .preview-label {
          display: block;
          margin-bottom: 6px;
          color: #748ba5;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .selected-car-preview strong {
          display: block;
          color: #f0f5fc;
          font-size: 12px;
        }

        .primary-button,
        .secondary-button {
          min-height: 43px;
          border-radius: 7px;
          padding: 12px 14px;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1px;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            background 0.15s ease;
        }

        .primary-button {
          color: #171a20;
          border: 1px solid #f4bd4f;
          background: linear-gradient(180deg, #ffd36d, #edb343);
          box-shadow: 0 6px 18px rgba(244, 189, 79, 0.1);
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: linear-gradient(180deg, #ffdc86, #f4bd4f);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .secondary-button {
          color: #c3d2e2;
          border: 1px solid #34465c;
          background: #132136;
        }

        .secondary-button:hover {
          background: #1c2d43;
        }

        .start-button {
          width: 100%;
          min-height: 48px;
        }

        .garage-note {
          margin: 10px 0 0;
          color: #8095ac;
          font-size: 10px;
          line-height: 1.5;
          text-align: center;
        }

        .stats-panel h2 {
          margin-bottom: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .stat-card {
          min-width: 0;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 13px;
          border: 1px solid #29394e;
          border-radius: 8px;
          background: #0c1726;
        }

        .stat-label {
          color: #7f95ad;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .stat-card strong {
          margin-top: 8px;
          color: #f0f5fb;
          font-size: 25px;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .stat-card .time-value {
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .stat-unit {
          margin-top: 3px;
          color: #8297ad;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.8px;
        }

        .progress-heading {
          display: flex;
          justify-content: space-between;
          margin-top: 19px;
          margin-bottom: 8px;
          color: #8fa4bb;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .progress-track {
          height: 7px;
          overflow: hidden;
          border-radius: 20px;
          background: #24354a;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #399ff7, #f4bd4f);
          transition: width 0.12s ease;
        }

        .typing-panel {
          grid-column: 1 / -1;
          padding: 22px;
        }

        .translation-pill {
          display: inline-block;
          padding: 8px 10px;
          color: #94acc4;
          border: 1px solid #2a3b50;
          border-radius: 6px;
          background: #101d2e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .verse-box {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #2a3e56;
          border-radius: 9px;
          background:
            linear-gradient(135deg, rgba(25, 60, 91, 0.23), transparent 70%),
            #0b1727;
        }

        .verse-reference {
          margin-bottom: 14px;
          color: #e8b94f;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.7px;
        }

        .verse-text {
          margin: 0;
          color: #a4b6ca;
          font-family: "Courier New", monospace;
          font-size: clamp(16px, 2vw, 21px);
          font-weight: 700;
          line-height: 1.95;
          letter-spacing: 0.2px;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .verse-character {
          border-radius: 2px;
          transition:
            color 0.08s linear,
            background 0.08s linear;
        }

        .character-correct {
          color: #61e0a5;
        }

        .character-incorrect {
          color: #fff;
          background: #b8324b;
          text-decoration: underline;
          text-decoration-color: #ff8b9c;
        }

        .character-current {
          border-bottom: 2px solid #f4bd4f;
          animation: cursor-pulse 0.9s infinite;
        }

        .typing-label {
          display: block;
          margin-top: 19px;
          margin-bottom: 9px;
          color: #94a8bf;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1.3px;
        }

        .typing-input {
          width: 100%;
          min-height: 102px;
          display: block;
          resize: vertical;
          padding: 15px;
          color: #e7effb;
          border: 1px solid #344a64;
          border-radius: 8px;
          outline: none;
          background: #091321;
          font-family: "Courier New", monospace;
          font-size: 15px;
          line-height: 1.7;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .typing-input:focus {
          border-color: #d8a940;
          box-shadow: 0 0 0 3px rgba(244, 189, 79, 0.08);
        }

        .typing-input:disabled {
          color: #9bacc0;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .typing-input::placeholder {
          color: #60758d;
        }

        .typing-bottom {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
        }

        .typing-bottom p {
          margin: 0;
          color: #8298af;
          font-size: 10px;
          line-height: 1.6;
        }

        .character-count {
          color: #7e94ad;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }

        .result-card {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 17px;
          padding: 17px;
          border: 1px solid rgba(244, 189, 79, 0.35);
          border-radius: 9px;
          background: linear-gradient(
            105deg,
            rgba(244, 189, 79, 0.1),
            rgba(11, 23, 39, 0.9)
          );
        }

        .result-badge {
          width: 58px;
          height: 58px;
          min-width: 58px;
          display: grid;
          place-items: center;
          color: #1b1c1f;
          border-radius: 12px;
          background: #f4bd4f;
          font-size: 18px;
          font-weight: 1000;
        }

        .result-copy {
          min-width: 0;
          flex: 1;
        }

        .result-copy h3 {
          margin: 5px 0 5px;
          color: #f3f7fc;
          font-size: 16px;
          line-height: 1.3;
        }

        .result-copy p {
          margin: 0;
          color: #9db0c5;
          font-size: 11px;
          line-height: 1.6;
        }

        .result-actions {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .page-footer {
          max-width: 1380px;
          margin: 23px auto 0;
          padding-top: 17px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          border-top: 1px solid #1d2a3b;
          color: #637991;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .footer-dot {
          padding: 0 4px;
          color: #e8b84e;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.35;
          }
        }

        @keyframes cursor-pulse {
          0%, 100% {
            border-color: #f4bd4f;
          }
          50% {
            border-color: transparent;
          }
        }

        @media (max-width: 1000px) {
          .main-grid {
            grid-template-columns: minmax(0, 1fr) 285px;
            gap: 12px;
          }

          .race-panel,
          .typing-panel {
            padding: 17px;
          }

          .garage-panel,
          .stats-panel {
            padding: 16px;
          }

          .track-heading,
          .race-lane {
            grid-template-columns: 88px minmax(0, 1fr);
          }

          .runner-label {
            gap: 5px;
          }

          .runner-initials {
            width: 25px;
            min-width: 25px;
            height: 25px;
          }

          .runner-name {
            font-size: 8px;
          }

          .track-code {
            margin-left: 0;
          }

          .result-card {
            flex-wrap: wrap;
          }

          .result-copy {
            flex-basis: calc(100% - 80px);
          }

          .result-actions {
            width: 100%;
            flex-direction: row;
          }

          .result-actions button {
            flex: 1;
          }
        }

        @media (max-width: 760px) {
          .bt-page {
            padding: 15px 12px 18px;
          }

          .topbar {
            padding-bottom: 17px;
          }

          .brand-icon {
            width: 37px;
            height: 37px;
            font-size: 22px;
          }

          .brand-name {
            font-size: 15px;
          }

          .brand-subtitle {
            font-size: 8px;
            letter-spacing: 1.5px;
          }

          .topbar-right {
            gap: 7px;
          }

          .mode-pill {
            display: none;
          }

          .profile-link {
            padding: 8px;
            font-size: 8px;
            letter-spacing: 0.4px;
          }

          .hero {
            min-height: 135px;
            padding: 28px 0 22px;
          }

          .hero h1 {
            letter-spacing: -1px;
          }

          .hero p {
            max-width: 420px;
            font-size: 12px;
          }

          .hero-mark {
            width: 70px;
            min-width: 70px;
            height: 70px;
            padding-left: 12px;
          }

          .hero-mark-line {
            width: 40px;
          }

          .hero-mark-line.short {
            width: 27px;
          }

          .main-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .race-panel,
          .typing-panel {
            grid-column: auto;
          }

          .sidebar {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
          }

          .track-heading,
          .race-lane {
            grid-template-columns: 80px minmax(0, 1fr);
            gap: 6px;
          }

          .race-lane {
            min-height: 66px;
            padding: 4px 6px;
          }

          .runner-name {
            font-size: 8px;
            letter-spacing: 0;
          }

          .track-lane {
            height: 53px;
          }

          .lane-car,
          .lane-car svg {
            width: 80px;
            height: 42px;
          }

          .lane-car {
            left: calc(var(--unused, 0px));
          }

          .lane-number {
            right: 16px;
          }

          .track-footer {
            gap: 10px;
          }

          .translation-pill {
            max-width: 148px;
            white-space: normal;
            line-height: 1.5;
            text-align: center;
          }

          .verse-box {
            padding: 15px;
          }

          .verse-text {
            font-size: 16px;
            line-height: 1.9;
          }

          .typing-bottom {
            flex-direction: column;
          }

          .result-card {
            align-items: flex-start;
          }

          .page-footer {
            line-height: 1.7;
          }
        }

        @media (max-width: 390px) {
          .race-panel,
          .typing-panel {
            padding: 12px;
          }

          .panel-heading h2,
          .garage-panel h2,
          .stats-panel h2,
          .typing-heading h2 {
            font-size: 18px;
          }

          .race-status {
            padding: 7px;
            font-size: 8px;
          }

          .track-heading,
          .race-lane {
            grid-template-columns: 69px minmax(0, 1fr);
            gap: 5px;
          }

          .runner-initials {
            width: 22px;
            min-width: 22px;
            height: 22px;
            font-size: 8px;
          }

          .runner-name {
            font-size: 7px;
          }

          .lane-car,
          .lane-car svg {
            width: 72px;
            height: 38px;
          }

          .result-badge {
            width: 48px;
            min-width: 48px;
            height: 48px;
          }

          .result-copy h3 {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}
