import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  TrendingUp,
  Dumbbell,
  ArrowRight,
} from "lucide-react";

const PERIODS = [
  { key: "daily",    label: "Daily" },
  { key: "weekly",   label: "Weekly" },
  { key: "monthly",  label: "Monthly" },
  { key: "all_time", label: "All-Time" },
];

function rankBorder(rank) {
  if (rank === 1) return "border-l-4 border-l-amber-400";
  if (rank === 2) return "border-l-4 border-l-slate-400";
  if (rank === 3) return "border-l-4 border-l-amber-700";
  return "";
}

function rankBadgeCls(rank) {
  if (rank === 1) return "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40";
  if (rank === 2) return "bg-slate-300/20 text-slate-200 ring-1 ring-slate-300/40";
  if (rank === 3) return "bg-amber-700/20 text-amber-400 ring-1 ring-amber-700/40";
  return "bg-white/5 text-slate-400";
}

const Leaderboard = () => {
  const [period, setPeriod]                   = useState("all_time");
  const [leaderboard, setLeaderboard]         = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `http://localhost:5000/api/pose/leaderboard?period=${period}`,
          { headers }
        );
        if (cancelled) return;
        if (res.data?.leaderboard && Array.isArray(res.data.leaderboard)) {
          setLeaderboard(res.data.leaderboard);
          setCurrentUserRank(res.data.current_user_rank || null);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Leaderboard fetch error:", err);
          setLeaderboard([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Leaderboard</h1>
            <p className="mt-1 text-slate-400">Community rankings based on real movement sessions</p>
          </div>

          {/* Period filter tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            {PERIODS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  period === tab.key
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* USER RANK BANNER */}
        {currentUserRank && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 font-extrabold ring-1 ring-cyan-400/30">
                #{currentUserRank.rank}
              </div>
              <div>
                <p className="font-bold">Your Rank: #{currentUserRank.rank}</p>
                <p className="text-sm text-slate-400">
                  <span className="text-cyan-300 font-semibold">{currentUserRank.points?.toLocaleString()} points</span>
                  {" · "}
                  <span className="text-slate-300">{currentUserRank.accuracy}% accuracy</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Flame size={15} className="text-amber-400" />
              Keep practicing to climb the ranks!
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && leaderboard.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 mb-4 ring-1 ring-cyan-400/20">
              <Trophy size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">No Rankings Logged Yet</h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Be the first to claim the top spot! Complete any posture or exercise workout to establish your community rank.
            </p>
            <Link
              to="/exercises"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40"
            >
              <Dumbbell size={16} />
              Start Workout <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* LEADERBOARD DATA */}
        {!loading && leaderboard.length > 0 && (
          <>
            {/* TOP 3 PODIUM */}
            {topThree.length >= 3 && (
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">

                {/* 2nd Place */}
                <div className="order-2 md:order-1 relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center flex flex-col items-center gap-4">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-900 text-sm font-extrabold">
                    2
                  </div>
                  <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-300/10 text-slate-300 border border-slate-300/20">
                    <Medal size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{topThree[1]?.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{topThree[1]?.badge || "Athlete"}</p>
                  </div>
                  <div className="w-full rounded-xl bg-black/20 border border-white/[0.05] p-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="font-bold text-cyan-300">{topThree[1]?.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points</span>
                      <span className="font-bold text-amber-300">{topThree[1]?.points?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 relative bg-gradient-to-b from-amber-400/10 to-white/[0.02] border border-amber-400/30 rounded-2xl p-6 text-center flex flex-col items-center gap-4 shadow-xl shadow-amber-400/5">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-sm font-extrabold shadow-md">
                    1
                  </div>
                  <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{topThree[0]?.name}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-300">{topThree[0]?.badge || "Champion"}</p>
                  </div>
                  <div className="w-full rounded-xl bg-black/30 border border-amber-400/20 p-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="font-bold text-emerald-400">{topThree[0]?.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points</span>
                      <span className="font-extrabold text-amber-300">{topThree[0]?.points?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center flex flex-col items-center gap-4">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-slate-100 text-sm font-extrabold">
                    3
                  </div>
                  <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-700/15 text-amber-500 border border-amber-700/25">
                    <Award size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{topThree[2]?.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{topThree[2]?.badge || "Athlete"}</p>
                  </div>
                  <div className="w-full rounded-xl bg-black/20 border border-white/[0.05] p-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="font-bold text-cyan-300">{topThree[2]?.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points</span>
                      <span className="font-bold text-amber-300">{topThree[2]?.points?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* FULL TABLE */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-cyan-400" />
                  <h2 className="font-bold">Standings</h2>
                </div>
                <span className="text-xs text-slate-500">Live rankings</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/[0.06] bg-black/20 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Badge</th>
                      <th className="px-6 py-3 text-center">Accuracy</th>
                      <th className="px-6 py-3 text-center">Reps</th>
                      <th className="px-6 py-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {leaderboard.map((item) => (
                      <tr
                        key={item.rank}
                        className={`transition hover:bg-white/[0.025] ${rankBorder(item.rank)}`}
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${rankBadgeCls(item.rank)}`}>
                            #{item.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 text-xs font-bold">
                              {item.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{item.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase">{item.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
                            {item.badge}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-400">
                          {item.accuracy}%
                        </td>
                        <td className="px-6 py-4 text-center text-slate-300">
                          {item.correct_reps}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-amber-300">
                          {item.points?.toLocaleString()} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;
