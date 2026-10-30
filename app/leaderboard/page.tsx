
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type LeaderboardEntry = {
  rank_position: number;
  username: string;
  xp: number;
  is_current_user: boolean;
};

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: leaderboardError } = await supabase.rpc(
        "get_xp_leaderboard"
      );

      if (leaderboardError) throw leaderboardError;

      setPlayers((data ?? []) as LeaderboardEntry[]);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.error("Leaderboard error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading the leaderboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  const topPlayers = players.filter(
    (player) => Number(player.rank_position) <= 100
  );

  const currentPlayer = players.find(
    (player) => player.is_current_user
  );

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to Race
          </Link>

          <button
            onClick={() => void loadLeaderboard()}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <section className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
            Bible Type
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Global Leaderboard
          </h1>

          <p className="mt-4 text-slate-400">
            The world's top Bible Type players, ranked by total XP.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            XP Rankings
          </div>
        </section>

        {currentPlayer && (
          <section className="mb-8 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-300">
              Your Position
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xl font-black">
                  #{Number(currentPlayer.rank_position).toLocaleString()}{" "}
                  {currentPlayer.username}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Keep racing to climb the rankings!
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-blue-300">
                  {Number(currentPlayer.xp).toLocaleString()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  XP
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827] shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-xl font-black">Top 100 Players</h2>
              <p className="mt-1 text-sm text-slate-400">
                Highest total XP
              </p>
            </div>

            <span className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
              {topPlayers.length} PLAYERS
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              <p className="text-slate-400">Loading players...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="font-bold text-red-400">
                Could not load the leaderboard.
              </p>

              <p className="mt-2 break-words text-sm text-slate-400">
                {error}
              </p>

              <button
                onClick={() => void loadLeaderboard()}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2 font-bold hover:bg-blue-500"
              >
                Try Again
              </button>
            </div>
          ) : topPlayers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold">No players yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Complete a race to start the leaderboard!
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-[55px_minmax(0,1fr)_100px] gap-3 border-b border-white/5 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid-cols-[75px_minmax(0,1fr)_130px] sm:px-7">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Total XP</span>
              </div>

              {topPlayers.map((player) => {
                const rank = Number(player.rank_position);
                const isCurrentUser = player.is_current_user;

                return (
                  <div
                    key={`${rank}-${player.username}`}
                    className={`grid grid-cols-[55px_minmax(0,1fr)_100px] items-center gap-3 border-b border-white/5 px-5 py-4 transition last:border-0 sm:grid-cols-[75px_minmax(0,1fr)_130px] sm:px-7 ${
                      isCurrentUser
                        ? "bg-blue-500/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div>
                      <span
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-black ${
                          rank === 1
                            ? "bg-yellow-400/15 text-yellow-300"
                            : rank === 2
                              ? "bg-slate-300/15 text-slate-300"
                              : rank === 3
                                ? "bg-orange-400/15 text-orange-300"
                                : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {rank}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {player.username}
                      </p>

                      {isCurrentUser && (
                        <span className="text-xs font-bold text-blue-300">
                          YOU
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-black tabular-nums text-blue-300">
                        {Number(player.xp).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>Rankings are based on total XP earned.</p>
          {lastUpdated && <p>Last updated: {lastUpdated}</p>}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-blue-600 px-7 py-3 font-bold transition hover:bg-blue-500"
          >
            Start Racing
          </Link>
        </div>
      </div>
    </main>
  );
}
