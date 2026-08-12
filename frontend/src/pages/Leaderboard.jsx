import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Flame,
  Target,
  Sparkles,
  TrendingUp,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

const DEMO_LEADERBOARD = [
  {
    rank: 1,
    user_id: 101,
    name: "Dr. Ananya Sharma",
    role: "Doctor",
    accuracy: 96.8,
    correct_reps: 1240,
    sessions_count: 34,
    points: 13950,
    badge: "🥇 Posture Master",
    tier: "Gold",
  },
  {
    rank: 2,
    user_id: 102,
    name: "Shreyansh Verma",
    role: "Worker",
    accuracy: 94.2,
    correct_reps: 1105,
    sessions_count: 29,
    points: 12100,
    badge: "🥈 Biomechanics Pro",
    tier: "Silver",
  },
  {
    rank: 3,
    user_id: 103,
    name: "Sunny Kumar",
    role: "Worker",
    accuracy: 91.5,
    correct_reps: 980,
    sessions_count: 25,
    points: 10755,
    badge: "🥉 Consistency Sentinel",
    tier: "Bronze",
  },
  {
    rank: 4,
    user_id: 104,
    name: "Priya Patel",
    role: "Worker",
    accuracy: 89.0,
    correct_reps: 840,
    sessions_count: 21,
    points: 9265,
    badge: "🌟 Elite Tracker",
    tier: "Elite",
  },
  {
    rank: 5,
    user_id: 105,
    name: "Rajesh Gupta",
    role: "Doctor",
    accuracy: 87.4,
    correct_reps: 790,
    sessions_count: 19,
    points: 8717,
    badge: "🌟 Elite Tracker",
    tier: "Elite",
  },
  {
    rank: 6,
    user_id: 106,
    name: "Kavita Singh",
    role: "Worker",
    accuracy: 85.2,
    correct_reps: 650,
    sessions_count: 16,
    points: 7246,
    badge: "🏅 Active Scholar",
    tier: "Scholar",
  },
];

const Leaderboard = () => {
  const [period, setPeriod] = useState("all_time");
  const [leaderboard, setLeaderboard] = useState(DEMO_LEADERBOARD);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  const fetchLeaderboard = async (selectedPeriod) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `http://localhost:5000/api/pose/leaderboard?period=${selectedPeriod}`,
        { headers }
      );
      if (res.data && res.data.leaderboard && res.data.leaderboard.length > 0) {
        setLeaderboard(res.data.leaderboard);
        setCurrentUserRank(res.data.current_user_rank || null);
      } else {
        setLeaderboard(DEMO_LEADERBOARD);
      }
    } catch (err) {
      console.warn("Leaderboard API error, using default data:", err);
      setLeaderboard(DEMO_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remainingList = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* ================= HERO HEADER ================= */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-950 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-3">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                Gamified Correctness & Ergonomics
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-100 flex items-center gap-3">
                Posture & Movement <span className="text-cyan-400">Leaderboard</span>
                <Trophy className="text-amber-400 animate-bounce" size={32} />
              </h1>

              <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
                Earn biomechanics training points for holding correct desk postures during study/work and maintaining high movement accuracy across workouts.
              </p>
            </div>

            {/* Time period filter tabs */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-md self-start md:self-auto">
              {[
                { key: "daily", label: "Daily" },
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
                { key: "all_time", label: "All-Time" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPeriod(tab.key)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                    period === tab.key
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CURRENT USER RANK BANNER ================= */}
        {currentUserRank && (
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900 p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 font-extrabold text-lg ring-1 ring-cyan-400/40">
                #{currentUserRank.rank}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  Your Current Standing
                  <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] text-cyan-300 font-bold">
                    {currentUserRank.badge}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Accuracy: <strong className="text-cyan-300">{currentUserRank.accuracy}%</strong> | Points: <strong className="text-amber-300">{currentUserRank.points.toLocaleString()} pts</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/20">
              <Flame size={16} className="text-amber-400" />
              Keep practicing to level up your rank tier!
            </div>
          </div>
        )}

        {/* ================= TOP 3 PODIUM ================= */}
        {topThree.length >= 3 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 relative rounded-3xl border border-slate-400/30 bg-gradient-to-b from-slate-800/60 to-slate-900 p-6 backdrop-blur-xl text-center shadow-xl flex flex-col justify-between transform hover:-translate-y-1 transition duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-bold shadow-lg ring-4 ring-slate-950">
                2
              </div>
              <div className="pt-4">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-300/10 text-slate-300 border border-slate-300/30">
                  <Medal size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{topThree[1]?.name}</h3>
                <span className="inline-block mt-1 rounded-full bg-slate-300/15 px-3 py-0.5 text-xs font-semibold text-slate-300">
                  {topThree[1]?.badge}
                </span>
              </div>
              <div className="mt-6 rounded-2xl bg-black/40 p-4 space-y-2 border border-white/5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Accuracy</span>
                  <span className="font-bold text-cyan-300">{topThree[1]?.accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Correct</span>
                  <span className="font-bold text-slate-200">{topThree[1]?.correct_reps}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-bold text-amber-300">
                  <span>Score Points</span>
                  <span>{topThree[1]?.points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>

            {/* 1st Place (Gold Podium) */}
            <div className="order-1 md:order-2 relative rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-6 backdrop-blur-xl text-center shadow-2xl flex flex-col justify-between transform md:-translate-y-4 hover:-translate-y-5 transition duration-300 ring-2 ring-amber-400/30">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-extrabold shadow-xl ring-4 ring-slate-950 text-lg">
                <Crown size={22} />
              </div>
              <div className="pt-6">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-lg shadow-amber-500/20 animate-pulse">
                  <Trophy size={40} />
                </div>
                <h3 className="text-xl font-extrabold text-amber-200">{topThree[0]?.name}</h3>
                <span className="inline-block mt-1 rounded-full bg-amber-400/20 px-3.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                  {topThree[0]?.badge}
                </span>
              </div>
              <div className="mt-6 rounded-2xl bg-black/60 p-4 space-y-2 border border-amber-400/20">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Accuracy</span>
                  <span className="font-extrabold text-emerald-400">{topThree[0]?.accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Total Correct</span>
                  <span className="font-bold text-slate-100">{topThree[0]?.correct_reps}</span>
                </div>
                <div className="border-t border-amber-400/20 pt-2 flex justify-between text-sm font-extrabold text-amber-300">
                  <span>Score Points</span>
                  <span>{topThree[0]?.points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 relative rounded-3xl border border-amber-700/30 bg-gradient-to-b from-amber-950/20 to-slate-900 p-6 backdrop-blur-xl text-center shadow-xl flex flex-col justify-between transform hover:-translate-y-1 transition duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-slate-100 font-bold shadow-lg ring-4 ring-slate-950">
                3
              </div>
              <div className="pt-4">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-700/20 text-amber-400 border border-amber-700/30">
                  <Award size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{topThree[2]?.name}</h3>
                <span className="inline-block mt-1 rounded-full bg-amber-700/20 px-3 py-0.5 text-xs font-semibold text-amber-400">
                  {topThree[2]?.badge}
                </span>
              </div>
              <div className="mt-6 rounded-2xl bg-black/40 p-4 space-y-2 border border-white/5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Accuracy</span>
                  <span className="font-bold text-cyan-300">{topThree[2]?.accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Correct</span>
                  <span className="font-bold text-slate-200">{topThree[2]?.correct_reps}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-bold text-amber-300">
                  <span>Score Points</span>
                  <span>{topThree[2]?.points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= LEADERBOARD TABLE ================= */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 p-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" />
              Full Rank Standing
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Updated Real-Time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Badge & Tier</th>
                  <th className="px-6 py-4 text-center">Accuracy %</th>
                  <th className="px-6 py-4 text-center">Correct Reps / Frames</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((item) => (
                  <tr
                    key={item.rank}
                    className={`transition hover:bg-white/[0.03] ${
                      item.rank <= 3 ? "bg-cyan-500/[0.02]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-200">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs ${
                        item.rank === 1 ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40 font-extrabold" :
                        item.rank === 2 ? "bg-slate-300/20 text-slate-200 ring-1 ring-slate-300/40" :
                        item.rank === 3 ? "bg-amber-700/20 text-amber-400 ring-1 ring-amber-700/40" :
                        "bg-white/5 text-slate-400"
                      }`}>
                        #{item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-xs">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{item.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {item.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-emerald-400">{item.accuracy}%</span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-200">
                      {item.correct_reps}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-amber-300">
                      {item.points.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Leaderboard;
