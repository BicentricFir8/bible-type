"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { CHARACTERS } from "../../lib/characters";

export default function GaragePage() {
  const [ownedCharacters, setOwnedCharacters] = useState<string[]>([
    "disciple",
  ]);
  const [selectedCharacterId, setSelectedCharacterId] =
    useState("disciple");
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadGarage() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Sign in to use your character garage.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("player_progress")
        .select("coins, owned_characters, selected_character")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
      } else if (data) {
        setCoins(data.coins ?? 0);

        if (Array.isArray(data.owned_characters)) {
          setOwnedCharacters(data.owned_characters);
        }

        if (
          CHARACTERS.some(
            (character) => character.id === data.selected_character
          )
        ) {
          setSelectedCharacterId(data.selected_character);
        }
      }

      setLoading(false);
    }

    loadGarage().catch((error) => {
      console.error("Could not load garage:", error);
      setMessage("Could not load your garage.");
      setLoading(false);
    });
  }, []);

  async function buyCharacter(characterId: string) {
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.rpc("buy_character", {
      p_character_id: characterId,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.owned_characters) {
      setOwnedCharacters(data.owned_characters);
    }

    if (typeof data?.total_coins === "number") {
      setCoins(data.total_coins);
    }

    setMessage("Character unlocked!");
  }

  async function selectCharacter(characterId: string) {
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.rpc("select_character", {
      p_character_id: characterId,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setSelectedCharacterId(characterId);
    setMessage(
      `${CHARACTERS.find((character) => character.id === characterId)?.name} selected!`
    );
  }

  return (
    <main className="garage-page">
      <header className="garage-header">
        <Link href="/" className="brand">
          <span className="brand-icon">B</span>
          <span>
            <span className="brand-name">BIBLE TYPE</span>
            <span className="brand-subtitle">SCRIPTURE RACING</span>
          </span>
        </Link>

        <Link href="/" className="back-link">
          ← BACK TO RACING
        </Link>
      </header>

      <section className="garage-hero">
        <div className="section-kicker">YOUR COLLECTION</div>
        <h1>Character Garage</h1>
        <p>
          Unlock biblical figures, build your collection, and choose who
          represents you on the track.
        </p>

        <div className="coin-display">
          <span>YOUR COINS</span>
          <strong>
            {loading
              ? "..."
              : coins === null
                ? "—"
                : coins.toLocaleString()}
          </strong>
        </div>
      </section>

      {message && (
        <p className="garage-message" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <div className="loading-message">LOADING YOUR COLLECTION...</div>
      ) : (
        <section className="character-grid">
          {CHARACTERS.map((character) => {
            const owned = ownedCharacters.includes(character.id);
            const selected = selectedCharacterId === character.id;

            return (
              <article
                className={`character-card ${selected ? "selected" : ""}`}
                key={character.id}
              >
                <div
                  className="character-avatar"
                  style={{
                    color: character.color,
                    borderColor: character.color,
                    background: `${character.color}15`,
                  }}
                >
                  {character.initials}
                </div>

                <div className="rarity" style={{ color: character.color }}>
                  {character.rarity}
                </div>

                <h2>{character.name}</h2>
                <p className="character-title">{character.title}</p>
                <p className="character-description">
                  {character.description}
                </p>

                {selected ? (
                  <div className="selected-label">✓ CURRENTLY SELECTED</div>
                ) : owned ? (
                  <button
                    className="select-button"
                    onClick={() => selectCharacter(character.id)}
                  >
                    SELECT CHARACTER
                  </button>
                ) : (
                  <button
                    className="buy-button"
                    onClick={() => buyCharacter(character.id)}
                    disabled={coins !== null && coins < character.price}
                  >
                    UNLOCK · {character.price.toLocaleString()} COINS
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}

      <footer className="garage-footer">
        BIBLE TYPE · LEARN · TYPE · RACE
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

        .garage-page {
          min-height: 100vh;
          padding: 24px clamp(14px, 4vw, 55px);
          background:
            radial-gradient(ellipse at 50% 0%, rgba(30, 92, 140, 0.2), transparent 40%),
            #08111f;
        }

        .garage-header {
          max-width: 1350px;
          margin: 0 auto;
          padding-bottom: 22px;
          border-bottom: 1px solid #24344a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .brand {
          display: flex;
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

        .back-link {
          padding: 11px 14px;
          border: 1px solid #34465c;
          border-radius: 7px;
          color: #f4bd4f;
          text-decoration: none;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .garage-hero {
          max-width: 1350px;
          margin: 0 auto;
          padding: 45px 0 30px;
          position: relative;
        }

        .section-kicker {
          color: #eab84e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .garage-hero h1 {
          margin: 12px 0;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 950;
          letter-spacing: -1.8px;
        }

        .garage-hero p {
          max-width: 620px;
          color: #93a6bd;
          font-size: 14px;
          line-height: 1.7;
        }

        .coin-display {
          display: inline-flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 15px;
          padding: 13px 18px;
          border: 1px solid #5b4a29;
          border-radius: 8px;
          background: rgba(244, 189, 79, 0.08);
        }

        .coin-display span {
          color: #a9956d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .coin-display strong {
          color: #f4bd4f;
          font-size: 22px;
          font-weight: 950;
        }

        .garage-message {
          max-width: 1350px;
          margin: 0 auto 20px;
          color: #65dfa7;
          font-size: 12px;
          font-weight: 800;
        }

        .loading-message {
          padding: 50px;
          color: #91a5bc;
          text-align: center;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .character-grid {
          max-width: 1350px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 17px;
        }

        .character-card {
          min-width: 0;
          padding: 22px;
          border: 1px solid #29394e;
          border-radius: 12px;
          background: linear-gradient(145deg, #111e30, #0e1929);
          text-align: center;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }

        .character-card:hover {
          transform: translateY(-3px);
          border-color: #536981;
        }

        .character-card.selected {
          border-color: #d9a83f;
          background: linear-gradient(145deg, #29251c, #111e30);
        }

        .character-avatar {
          width: 78px;
          height: 78px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border: 2px solid;
          border-radius: 50%;
          font-size: 23px;
          font-weight: 950;
        }

        .rarity {
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .character-card h2 {
          margin: 10px 0 5px;
          color: #f0f5fc;
          font-size: 19px;
          font-weight: 900;
        }

        .character-title {
          margin: 0;
          color: #e1b955;
          font-size: 11px;
          font-weight: 800;
        }

        .character-description {
          min-height: 55px;
          margin: 13px 0 18px;
          color: #8fa3b9;
          font-size: 11px;
          line-height: 1.6;
        }

        .select-button,
        .buy-button {
          width: 100%;
          min-height: 42px;
          padding: 10px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.7px;
          cursor: pointer;
        }

        .select-button {
          color: #c4d4e6;
          border: 1px solid #43566d;
          background: #17263a;
        }

        .buy-button {
          color: #171a20;
          border: 1px solid #f4bd4f;
          background: linear-gradient(180deg, #ffd36d, #edb343);
        }

        .buy-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .selected-label {
          min-height: 42px;
          display: grid;
          place-items: center;
          color: #65dfa7;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.7px;
        }

        .garage-footer {
          max-width: 1350px;
          margin: 35px auto 0;
          padding-top: 18px;
          border-top: 1px solid #24344a;
          color: #637991;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        @media (max-width: 600px) {
          .garage-header {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .garage-hero {
            padding-top: 30px;
          }

          .character-grid {
            grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
            gap: 10px;
          }

          .character-card {
            padding: 15px 11px;
          }

          .character-avatar {
            width: 62px;
            height: 62px;
            font-size: 19px;
          }

          .character-card h2 {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}