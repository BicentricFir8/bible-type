"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { PASSAGES, choosePassage } from "../lib/passages";
import { CHARACTERS } from "../lib/characters";

type RaceStatus = "ready" | "countdown" | "racing" | "finished";

type RaceBot = {
  id: string;
  name: string;
  initials: string;
  color: string;
  wpm: number;
  finishSeconds: number;
};

const BOT_NAMES = [
  { id: "psalm", name: "PSALM PILOT", initials: "PP", color: "#ad8cff" },
  { id: "grace", name: "GRACE RACER", initials: "GR", color: "#51dba0" },
  { id: "verse", name: "VERSE VELOCITY", initials: "VV", color: "#ff9256" },
];

function formatTime(milliseconds: number) {
  const safeTime = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const tenths = Math.floor((safeTime % 1000) / 100);

  return `${minutes}:${seconds}.${tenths}`;
}

function getPlaceLabel(place: number) {
  if (place === 1) return "1ST";
  if (place === 2) return "2ND";
  if (place === 3) return "3RD";
  return `${place}TH`;
}

export default function HomePage() {
  const savedRaceRef = useRef(false);
  const typingRef = useRef<HTMLTextAreaElement>(null);

  const [saveMessage, setSaveMessage] = useState("");
  const [status, setStatus] = useState<RaceStatus>("ready");

  const [selectedCharacterId, setSelectedCharacterId] = useState("disciple");

  const [typed, setTyped] = useState("");
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [countdown, setCountdown] = useState(3);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [raceStartAt, setRaceStartAt] = useState<number | null>(null);
  const [finishTimeMs, setFinishTimeMs] = useState<number | null>(null);

  const [currentPassage, setCurrentPassage] = useState(PASSAGES[0]);
  const [averageWpm, setAverageWpm] = useState(40);
  const [recentWpms, setRecentWpms] = useState<number[]>([]);
  const [usedPassageIds, setUsedPassageIds] = useState<string[]>([]);
  const [raceSettingsLoaded, setRaceSettingsLoaded] = useState(false);

  const [raceBots, setRaceBots] = useState<RaceBot[]>([]);

  const selectedCharacter =
    CHARACTERS.find((character) => character.id === selectedCharacterId) ??
    CHARACTERS[0];

  const passage = currentPassage.text;

  const totalKeyAttempts = correctKeystrokes + mistakes;

  const accuracy =
    totalKeyAttempts === 0
      ? 0
      : Math.round((correctKeystrokes / totalKeyAttempts) * 100);

  const progress =
    passage.length === 0
      ? 0
      : Math.min(100, Math.round((typed.length / passage.length) * 100));

  const shownTime = finishTimeMs ?? elapsedMs;

  const wpm =
    shownTime > 0
      ? Math.round(typed.length / 5 / (shownTime / 60000))
      : 0;

  const finishSeconds =
    finishTimeMs === null ? null : finishTimeMs / 1000;

  const place =
    finishSeconds === null
      ? null
      : 1 +
        raceBots.filter((bot) => bot.finishSeconds < finishSeconds).length;

  useEffect(() => {
    async function loadPlayerData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRaceSettingsLoaded(true);
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("player_progress")
        .select("selected_character")
        .eq("user_id", user.id)
        .maybeSingle();

      if (playerError) {
        console.error("Could not load player progress:", playerError.message);
      } else if (playerData) {
        if (
          CHARACTERS.some(
            (character) => character.id === playerData.selected_character
          )
        ) {
          setSelectedCharacterId(playerData.selected_character);
        }
      }

      const { data: settings, error: settingsError } = await supabase
        .from("player_race_settings")
        .select("average_wpm, recent_wpms, used_passage_ids")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        console.error("Could not load race settings:", settingsError.message);
      } else if (settings) {
        setAverageWpm(
          typeof settings.average_wpm === "number" && settings.average_wpm > 0
            ? settings.average_wpm
            : 40
        );

        setRecentWpms(
          Array.isArray(settings.recent_wpms) ? settings.recent_wpms : []
        );

        setUsedPassageIds(
          Array.isArray(settings.used_passage_ids)
            ? settings.used_passage_ids
            : []
        );
      } else {
        const { error: insertError } = await supabase
          .from("player_race_settings")
          .upsert({
            user_id: user.id,
            average_wpm: 40,
            recent_wpms: [],
            used_passage_ids: [],
          });

        if (insertError) {
          console.error("Could not create race settings:", insertError.message);
        }
      }

      setRaceSettingsLoaded(true);
    }

    loadPlayerData().catch((error) => {
      console.error("Could not load player data:", error);
      setRaceSettingsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (status !== "countdown") return;

    const timeout = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown((current) => current - 1);
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

    const completedTimeMs = finishTimeMs;
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
        completedTimeMs > 0
          ? Math.round(typed.length / 5 / (completedTimeMs / 60000))
          : 0;

      const { data: reward, error } = await supabase.rpc("complete_race", {
        p_wpm: finalWpm,
        p_accuracy: accuracy,
        p_mistakes: mistakes,
        p_duration_ms: completedTimeMs,
      });

      if (error) {
        console.error("Could not save race:", error.message);
        setSaveMessage(error.message);
        savedRaceRef.current = false;
        return;
      }

      const updatedRecentWpms = [...recentWpms, finalWpm].slice(-10);

      const updatedAverageWpm = Math.max(
        1,
        Math.round(
          updatedRecentWpms.reduce((total, speed) => total + speed, 0) /
            updatedRecentWpms.length
        )
      );

      const updatedUsedIds =
        usedPassageIds.length >= PASSAGES.length
          ? [currentPassage.id]
          : Array.from(new Set([...usedPassageIds, currentPassage.id]));

      const { error: settingsError } = await supabase
        .from("player_race_settings")
        .upsert({
          user_id: user.id,
          average_wpm: updatedAverageWpm,
          recent_wpms: updatedRecentWpms,
          used_passage_ids: updatedUsedIds,
        });

      setRecentWpms(updatedRecentWpms);
      setAverageWpm(updatedAverageWpm);
      setUsedPassageIds(updatedUsedIds);

      const rewardMessage =
        `+${reward.coins_earned} coins, ` +
        `+${reward.xp_earned} XP, and ` +
        `+${reward.points_earned ?? 0} race points.`;

      if (settingsError) {
        console.error("Could not update race settings:", settingsError.message);
        setSaveMessage(
          `Race saved! ${rewardMessage} Passage settings could not be updated.`
        );
        return;
      }

      setSaveMessage(`Race saved! ${rewardMessage}`);
    }

    saveRace();
  }, [
    status,
    finishTimeMs,
    typed.length,
    accuracy,
    mistakes,
    recentWpms,
    usedPassageIds,
    currentPassage,
  ]);

  function startRace() {
    const nextPassage = choosePassage(averageWpm, usedPassageIds);
    const wordCount = nextPassage.text.trim().split(/\s+/).length;

    const randomizedBots = BOT_NAMES.map((bot) => {
      const botWpm = Math.floor(Math.random() * 56) + 30;

      return {
        ...bot,
        wpm: botWpm,
        finishSeconds: (wordCount / botWpm) * 60,
      };
    });

    setCurrentPassage(nextPassage);
    setRaceBots(randomizedBots);

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

  function resetRace() {
    setTyped("");
    setCorrectKeystrokes(0);
    setMistakes(0);
    setFeedback("");
    setElapsedMs(0);
    setFinishTimeMs(null);
    setRaceStartAt(null);
    setCountdown(3);
    setStatus("ready");
    setSaveMessage("");
  }

  function handleTypingKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (status !== "racing") {
      event.preventDefault();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      setTyped((current) => current.slice(0, -1));
      setFeedback("");
      return;
    }

    if (event.key.length !== 1) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const expected = passage[typed.length];

    if (expected === undefined) return;

    if (event.key !== expected) {
      setMistakes((current) => current + 1);

      const expectedLabel = expected === " " ? "SPACE" : `“${expected}”`;
      const pressedLabel = event.key === " " ? "SPACE" : `“${event.key}”`;

      setFeedback(
        `Wrong key! You pressed ${pressedLabel}. Press ${expectedLabel} to advance.`
      );

      return;
    }

    const nextText = typed + event.key;

    setTyped(nextText);
    setCorrectKeystrokes((current) => current + 1);
    setFeedback("");

    if (nextText === passage && raceStartAt !== null) {
      const finalTime = Date.now() - raceStartAt;

      setElapsedMs(finalTime);
      setFinishTimeMs(finalTime);
      setStatus("finished");
    }
  }

  const racers = [
    {
      id: "you",
      name: selectedCharacter.name,
      initials: selectedCharacter.initials,
      color: selectedCharacter.color,
      progress: status === "finished" ? 100 : progress,
      isPlayer: true,
    },
    ...raceBots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      initials: bot.initials,
      color: bot.color,
      progress:
        status === "ready"
          ? 0
          : Math.min(
              100,
              Math.round(((shownTime / 1000) / bot.finishSeconds) * 100)
            ),
      isPlayer: false,
    })),
  ];

  return (
    <main className="bt-page">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-icon">B</span>
          <span>
            <span className="brand-name">BIBLE TYPE</span>
            <span className="brand-subtitle">SCRIPTURE RACING</span>
          </span>
        </Link>

        <div className="topbar-right">
          <span className="mode-pill">
            <span className="online-dot" />
            SOLO RACE
          </span>

          <Link className="profile-link" href="/garage">
            GARAGE & SHOP ↗
          </Link>

          <Link className="profile-link" href="/leaderboard">
            LEADERBOARD ↗
          </Link>

          <Link className="profile-link" href="/dashboard">
            PROFILE ↗
          </Link>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">READY · SET · TYPE</div>
          <h1>
            Faith meets the <span>fast lane.</span>
          </h1>
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
                      {racer.isPlayer ? "YOU" : racer.name}
                    </span>
                  </div>

                  <div className={`track-lane lane-${index}`}>
                    <div className="start-line" />
                    <div className="finish-line" />

                    <div
                      className="lane-character"
                      style={{
                        left: `calc(${racer.progress}% - ${
                          racer.progress * 0.7
                        }px)`,
                        borderColor: racer.color,
                        color: racer.color,
                        background: `${racer.color}20`,
                      }}
                    >
                      {racer.initials}
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
              <span className="legend-dot player-dot" /> YOUR CHARACTER
            </span>
            <span>
              <span className="legend-dot bot-dot" /> COMPUTER RACERS
            </span>
            <span className="track-code">TRACK 01 · SCRIPTURE SPRINT</span>
          </div>

          {status === "finished" && place !== null && (
            <div className="result-card">
              <div className="result-badge">{getPlaceLabel(place)}</div>

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
                  You finished in {formatTime(finishTimeMs ?? 0)} with {wpm}{" "}
                  WPM and {accuracy}% accuracy.
                </p>

                <p role="status">
                  {saveMessage || "Saving your race..."}
                </p>
              </div>

              <div className="result-actions">
                <button className="primary-button" onClick={startRace}>
                  RACE AGAIN ↗
                </button>
                <button className="secondary-button" onClick={resetRace}>
                  BACK TO READY
                </button>
              </div>
            </div>
          )}
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
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="selected-racer">
            <span
              className="runner-initials"
              style={{
                color: selectedCharacter.color,
                borderColor: selectedCharacter.color,
              }}
            >
              {selectedCharacter.initials}
            </span>
            <div>
              <span className="preview-label">YOUR RACER</span>
              <strong>{selectedCharacter.name}</strong>
            </div>
            <Link href="/garage">CHANGE ↗</Link>
          </div>

          <button
            className="primary-button start-button"
            onClick={startRace}
            disabled={
              !raceSettingsLoaded ||
              status === "countdown" ||
              status === "racing"
            }
          >
            {!raceSettingsLoaded
              ? "LOADING PLAYER..."
              : status === "ready"
                ? "START RACE →"
                : status === "countdown"
                  ? "GET READY..."
                  : status === "racing"
                    ? "RACE IN PROGRESS"
                    : "RACE AGAIN →"}
          </button>
        </section>

        <section className="panel typing-panel">
          <div className="typing-heading">
            <div>
              <div className="section-kicker">THE WORD IS YOUR TRACK</div>
              <h2>Type the passage</h2>
            </div>

            <span className="translation-pill">
              WORLD ENGLISH BIBLE · WEB
            </span>
          </div>

          <div className="verse-box">
            <div className="verse-reference">{currentPassage.reference}</div>

            <p className="verse-text" aria-label={passage}>
              {passage.split("").map((character, index) => {
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
                    {character}
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
            maxLength={passage.length}
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
            <div>
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
            </div>

            <span className="character-count">
              {typed.length} / {passage.length} CHARACTERS
            </span>
          </div>
        </section>
      </div>

      <footer className="page-footer">
        <span>
          BIBLE TYPE <span className="footer-dot">•</span> LEARN · TYPE · RACE
        </span>
        <span>
          PASSAGE: {currentPassage.reference} · WORLD ENGLISH BIBLE (PUBLIC
          DOMAIN)
        </span>
      </footer>

      <style jsx global>{`
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
          font-weight: 1000;
          font-style: italic;
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
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
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
        }

        .profile-link {
          color: #f4bd4f;
          text-decoration: none;
          background: rgba(244, 189, 79, 0.06);
        }

        .profile-link:hover {
          background: rgba(244, 189, 79, 0.13);
        }

        .hero {
          max-width: 1380px;
          margin: 0 auto;
          min-height: 155px;
          padding: 30px 0;
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
          grid-template-columns: minmax(0, 1fr) 300px;
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

        .race-panel,
        .typing-panel {
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
          grid-template-columns: 115px 1fr;
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
          grid-template-columns: 115px minmax(0, 1fr);
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
        }

        .track-lane {
          position: relative;
          min-width: 0;
          height: 59px;
          overflow: hidden;
          border: 1px solid rgba(135, 158, 184, 0.12);
          border-radius: 5px;
          background:
            repeating-linear-gradient(90deg, transparent 0 32px, rgba(255,255,255,.025) 32px 33px),
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
          background-image: repeating-conic-gradient(#172334 0% 25%, #e8edf4 0% 50%);
          background-size: 12px 12px;
        }

        .lane-character {
          position: absolute;
          z-index: 2;
          top: 50%;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 2px solid;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 950;
          transform: translateY(-50%);
          transition: left 0.12s linear;
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

        .stats-panel {
          padding: 20px;
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
        }

        .stat-card .time-value {
          font-size: 20px;
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

        .selected-racer {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 17px;
          padding: 12px;
          border: 1px dashed #2b3b50;
          border-radius: 8px;
          background: rgba(6, 15, 28, 0.4);
        }

        .selected-racer > div {
          flex: 1;
          min-width: 0;
        }

        .selected-racer strong {
          display: block;
          color: #f0f5fc;
          font-size: 12px;
        }

        .selected-racer a {
          color: #f4bd4f;
          font-size: 9px;
          font-weight: 900;
          text-decoration: none;
        }

        .preview-label {
          display: block;
          margin-bottom: 5px;
          color: #748ba5;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
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
        }

        .primary-button {
          color: #171a20;
          border: 1px solid #f4bd4f;
          background: linear-gradient(180deg, #ffd36d, #edb343);
        }

        .primary-button:hover:not(:disabled) {
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

        .start-button {
          width: 100%;
          min-height: 48px;
          margin-top: 14px;
        }

        .typing-panel {
          grid-column: 1 / -1;
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
          width: 100%;
          min-width: 0;
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #2a3e56;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(25, 60, 91, 0.23), transparent 70%), #0b1727;
        }

        .verse-reference {
          margin-bottom: 14px;
          color: #e8b94f;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.7px;
        }

        .verse-text {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 0;
          color: #a4b6ca;
          font-family: "Courier New", monospace;
          font-size: clamp(16px, 2vw, 21px);
          font-weight: 700;
          line-height: 1.95;
          letter-spacing: 0.2px;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: normal;
        }

        .verse-character {
          border-radius: 2px;
          transition: color 0.08s linear, background 0.08s linear;
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

        .typing-feedback {
          margin: 0 0 10px !important;
          color: #ff8292 !important;
          font-size: 11px !important;
          font-weight: 800;
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
          background: linear-gradient(105deg, rgba(244, 189, 79, 0.1), rgba(11, 23, 39, 0.9));
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
          margin: 5px 0;
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes cursor-pulse {
          0%, 100% { border-color: #f4bd4f; }
          50% { border-color: transparent; }
        }

        @media (max-width: 760px) {
          .bt-page {
            padding: 15px 12px 18px;
          }

          .topbar {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .topbar-right {
            justify-content: flex-start;
          }

          .mode-pill {
            display: none;
          }

          .hero {
            min-height: 135px;
          }

          .hero-mark {
            display: none;
          }

          .main-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .typing-panel {
            grid-column: auto;
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
          }

          .track-lane {
            height: 53px;
          }

          .lane-character {
            width: 34px;
            height: 34px;
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

        @media (max-width: 390px) {
          .race-panel,
          .typing-panel {
            padding: 12px;
          }

          .panel-heading h2,
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

          .lane-character {
            width: 30px;
            height: 30px;
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}