import { useNavigate } from "react-router-dom";
import {
  Activity,
  Target,
  Dumbbell,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDashboardSummary, fetchRecentSessions, fetchWeeklyActivity } from "../api/Api.jsx";

const EXERCISE_LABELS = {
  squat:          "Squats",
  push_up:        "Push Ups",
  lunge:          "Lunges",
  plank:          "Plank",
  bicep_curl:     "Bicep Curls",
  shoulder_press: "Shoulder Press",
};

function accuracyBadgeCls(acc) {
  if (acc >= 85) return "bg-green-400/10 text-green-400 border-green-400/20";
  if (acc >= 60) return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
  return "bg-red-400/10 text-red-400 border-red-400/20";
}

/* stagger delay classes */
const STAT_DELAYS  = ["d-1", "d-2", "d-3", "d-4"];
const BAR_DELAYS   = ["d-1", "d-2", "d-3", "d-4", "d-5", "d-6", "d-7"];
const SESSION_DELAYS = ["d-1", "d-2", "d-3", "d-4", "d-5"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary]       = useState(null);
  const [recentSessions, setRecent] = useState([]);
  const [weeklyData, setWeekly]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [tick, setTick]             = useState(0);

  const retry = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const [s, r, w] = await Promise.all([
        fetchDashboardSummary().catch(() => null),
        fetchRecentSessions().catch(() => []),
        fetchWeeklyActivity().catch(() => []),
      ]);
      if (cancelled) return;
      if (!s && !r?.length && !w?.length) setError("Could not load dashboard data.");
      setSummary(s);
      setRecent(r || []);
      setWeekly(w || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tick]);

  const stats = summary
    ? [
        { title: "Total Sessions", value: String(summary.total_sessions), icon: Dumbbell },
        { title: "Total Reps",     value: summary.total_reps.toLocaleString(), icon: Activity },
        { title: "Correct Reps",   value: summary.correct_reps.toLocaleString(), icon: CheckCircle },
        { title: "Avg Accuracy",   value: `${summary.avg_accuracy}%`, icon: Target },
      ]
    : [];

  const exerciseBreakdown = summary?.exercise_breakdown
    ? Object.entries(summary.exercise_breakdown).map(([key, cnt]) => {
        const max = Math.max(...Object.values(summary.exercise_breakdown), 1);
        return {
          name: EXERCISE_LABELS[key] || key,
          sessions: cnt,
          pct: Math.round((cnt / max) * 100),
        };
      })
    : [];

  const maxReps = weeklyData.length ? Math.max(...weeklyData.map(d => d.reps), 1) : 1;
  const chartDays = weeklyData.length
    ? weeklyData
    : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, reps: 0 }));

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="anim-fade-down mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Dashboard</h1>
            <p className="mt-1 text-slate-400">Your fitness overview</p>
          </div>
          <button
            onClick={() => navigate("/pose-analysis")}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition duration-200 hover:bg-cyan-400 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
          >
            Start Workout
            <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* LOADING — shimmer skeleton */}
        {loading && (
          <div className="space-y-6">
            {/* stat card skeletons */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0,1,2,3].map((i) => (
                <div key={i} className="anim-shimmer rounded-2xl border border-white/[0.08] h-32" />
              ))}
            </div>
            {/* chart skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="anim-shimmer rounded-2xl border border-white/[0.08] h-48" />
                <div className="anim-shimmer rounded-2xl border border-white/[0.08] h-52" />
              </div>
              <div className="anim-shimmer rounded-2xl border border-white/[0.08] h-80" />
            </div>
            {/* centered spinner on top */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="anim-scale-in mb-8 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
            <p className="text-slate-400">{error}</p>
            <button
              onClick={retry}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15 hover:scale-105 active:scale-95"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* STAT CARDS — staggered fade-up */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className={`anim-fade-up ${STAT_DELAYS[i]} group bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-1`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-400 transition duration-300 group-hover:scale-110">
                        <Icon size={20} />
                      </div>
                      <TrendingUp size={16} className="text-slate-600 transition duration-300 group-hover:text-cyan-600" />
                    </div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="anim-count mt-1 text-3xl font-black">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* MAIN TWO-COLUMN GRID */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* LEFT: Exercise Breakdown + Weekly Chart */}
              <div className="flex flex-col gap-6 lg:col-span-2">

                {/* Exercise Breakdown */}
                <div className="anim-fade-left d-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Workout History</p>
                      <h2 className="mt-1 text-lg font-bold">Exercise Breakdown</h2>
                    </div>
                    <Dumbbell size={18} className="text-cyan-400" />
                  </div>

                  {exerciseBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-500">No sessions logged yet.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {exerciseBreakdown.map((ex, i) => (
                        <div key={ex.name} className={`anim-fade-up d-${i + 1}`}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-slate-400">{ex.sessions} session{ex.sessions !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-700"
                              style={{ width: `${ex.pct}%`, animationDelay: `${i * 0.1 + 0.3}s` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weekly Activity Chart */}
                <div className="anim-fade-left d-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Reps by Day</p>
                      <h2 className="mt-1 text-lg font-bold">Weekly Activity</h2>
                    </div>
                    <TrendingUp size={18} className="text-slate-500" />
                  </div>

                  {weeklyData.length === 0 && (
                    <p className="mb-4 text-xs text-slate-500">No workout data this week yet.</p>
                  )}

                  <div className="flex h-40 items-end gap-2">
                    {chartDays.map(({ day, reps }, i) => (
                      <div key={day} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={`anim-bar ${BAR_DELAYS[i]} w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-cyan-400 opacity-80 transition duration-200 hover:opacity-100 hover:from-cyan-400 hover:to-cyan-300 cursor-default`}
                          style={{
                            height: `${Math.max((reps / maxReps) * 100, 4)}%`,
                            animationDelay: `${i * 0.07}s`,
                          }}
                          title={`${reps} reps`}
                        />
                        <span className="text-[10px] text-slate-500">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT: Recent Sessions */}
              <div className="anim-fade-right d-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Recent Activity</p>
                    <h2 className="mt-1 text-lg font-bold">Recent Sessions</h2>
                  </div>
                  <Clock size={18} className="text-slate-500" />
                </div>

                {recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Activity size={28} className="text-slate-600" />
                    <p className="text-sm text-slate-500">No sessions yet.</p>
                    <button
                      onClick={() => navigate("/pose-analysis")}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition hover:underline"
                    >
                      Start your first →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentSessions.slice(0, 5).map((s, i) => (
                      <div
                        key={s.id}
                        className={`anim-fade-up ${SESSION_DELAYS[i]} flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]`}
                        style={{ animationDelay: `${i * 0.08 + 0.3}s` }}
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {EXERCISE_LABELS[s.exercise_type] || s.exercise_type}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {s.started_at ? new Date(s.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold transition duration-200 hover:scale-105 ${accuracyBadgeCls(s.accuracy)}`}>
                          {s.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
