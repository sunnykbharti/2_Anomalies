import { useNavigate } from "react-router-dom";
import {
  Activity,
  Target,
  Dumbbell,
  Flame,
  TrendingUp,
  Play,
  CheckCircle,
  Clock,
  Trophy,
  ArrowUpRight,
  Zap,
  BarChart2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDashboardSummary, fetchRecentSessions, fetchWeeklyActivity } from "../api/Api.jsx";

// Friendly display names for exercise types
const EXERCISE_LABELS = {
  squat:          "Squats",
  push_up:        "Push Ups",
  lunge:          "Lunges",
  plank:          "Plank",
  bicep_curl:     "Bicep Curls",
  shoulder_press: "Shoulder Press",
};

// Risk / accuracy colour helper
function accuracyColor(acc) {
  if (acc >= 85) return "text-green-400";
  if (acc >= 60) return "text-yellow-400";
  return "text-red-400";
}

function accuracyBg(acc) {
  if (acc >= 85) return "from-green-400 to-emerald-500";
  if (acc >= 60) return "from-yellow-400 to-amber-500";
  return "from-red-400 to-rose-500";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary]             = useState(null);
  const [recentSessions, setRecent]       = useState([]);
  const [weeklyData, setWeekly]           = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardSummary().catch(() => null),
      fetchRecentSessions().catch(() => []),
      fetchWeeklyActivity().catch(() => []),
    ]).then(([s, r, w]) => {
      setSummary(s);
      setRecent(r || []);
      setWeekly(w || []);
      setLoading(false);
    });
  }, []);

  // ---------- Stat cards (derived from real DB data) ----------
  const stats = summary
    ? [
        {
          title: "Total Sessions",
          value: String(summary.total_sessions),
          subtitle: "All time workouts",
          icon: Dumbbell,
          color: "cyan",
        },
        {
          title: "Total Reps",
          value: summary.total_reps.toLocaleString(),
          subtitle: "Across all exercises",
          icon: Activity,
          color: "blue",
        },
        {
          title: "Correct Reps",
          value: summary.correct_reps.toLocaleString(),
          subtitle: "Good form reps",
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "Avg Accuracy",
          value: `${summary.avg_accuracy}%`,
          subtitle: "Pose precision",
          icon: Target,
          color: "purple",
        },
      ]
    : [];

  // ---------- Exercise breakdown for the "Today's Workout" panel ----------
  const exerciseBreakdown = summary?.exercise_breakdown
    ? Object.entries(summary.exercise_breakdown).map(([key, cnt]) => ({
        name: EXERCISE_LABELS[key] || key,
        sessions: cnt,
        // derive a pseudo-progress from sessions (max 10 = 100%)
        progress: Math.min(Math.round((cnt / 10) * 100), 100),
      }))
    : [];

  // ---------- Max reps in weekly data (for bar chart scaling) ----------
  const maxReps = weeklyData.length
    ? Math.max(...weeklyData.map(d => d.reps), 1)
    : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 md:px-8">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-10 top-80 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium tracking-widest text-cyan-400">
              POSTURE TREK · AI FITNESS DASHBOARD
            </p>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">
              Good morning, <span className="text-cyan-400">Trekker</span> 👋
            </h1>
            <p className="mt-3 text-slate-400">
              Your posture. Your progress. Keep moving forward.
            </p>
          </div>

          <button
            onClick={() => navigate("/pose-analysis")}
            className="group flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1 hover:bg-cyan-400"
          >
            <Play size={18} fill="currentColor" />
            Start Workout
            <ArrowUpRight
              size={18}
              className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>


        {/* ================= STATS ================= */}
        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-500">
            Loading your stats…
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="
                    group relative overflow-hidden
                    rounded-2xl border border-white/10
                    bg-white/[0.04]
                    p-6
                    backdrop-blur-xl
                    shadow-xl
                    transition duration-500
                    hover:-translate-y-2
                    hover:border-cyan-400/30
                    hover:bg-white/[0.07]
                  "
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:bg-cyan-400/20" />
                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                        <Icon size={22} />
                      </div>
                      <TrendingUp size={18} className="text-green-400" />
                    </div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <h2 className="mt-1 text-3xl font-black">{stat.value}</h2>
                    <p className="mt-2 text-xs text-slate-500">{stat.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* ================= MAIN GRID ================= */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* ================= EXERCISE BREAKDOWN ================= */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-400">WORKOUT HISTORY</p>
                  <h2 className="mt-1 text-2xl font-bold">Exercise Breakdown</h2>
                </div>
                <Dumbbell className="text-cyan-400" />
              </div>

              {exerciseBreakdown.length === 0 ? (
                <p className="text-slate-500">No sessions logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {exerciseBreakdown.map((ex, index) => (
                    <div
                      key={index}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                            <Activity size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold">{ex.name}</h3>
                            <p className="text-sm text-slate-500">{ex.sessions} session{ex.sessions !== 1 ? "s" : ""} completed</p>
                          </div>
                        </div>
                        <CheckCircle
                          size={22}
                          className={ex.progress >= 80 ? "text-green-400" : "text-slate-600"}
                        />
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-slate-500">Volume</span>
                          <span className="text-cyan-400">{ex.progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                            style={{ width: `${ex.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* ================= POSTURE GOALS ================= */}
          <div>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-7">
                <p className="text-sm text-purple-400">YOUR TARGETS</p>
                <h2 className="mt-1 text-2xl font-bold">Posture Goals</h2>
              </div>

              <div className="space-y-7">
                {[
                  {
                    title: "Complete 30 sessions",
                    current: summary?.total_sessions ?? 0,
                    total: 30,
                    icon: Dumbbell,
                  },
                  {
                    title: "Reach 5,000 reps",
                    current: summary?.total_reps ?? 0,
                    total: 5000,
                    icon: Activity,
                  },
                  {
                    title: "90% average accuracy",
                    current: summary?.avg_accuracy ?? 0,
                    total: 90,
                    icon: Target,
                  },
                ].map((goal, index) => {
                  const Icon = goal.icon;
                  const pct = Math.min((goal.current / goal.total) * 100, 100);
                  return (
                    <div key={index}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                          <Icon size={18} />
                        </div>
                        <p className="text-sm font-medium">{goal.title}</p>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{typeof goal.current === "number" && goal.current > 100 ? goal.current.toLocaleString() : goal.current}</span>
                        <span>{goal.total.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trophy */}
              <div className="mt-10 rounded-2xl border border-yellow-400/10 bg-yellow-400/5 p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-yellow-400/10 p-3 text-yellow-400">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Keep Going!</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {summary
                        ? `${Math.min(Math.round((summary.total_sessions / 30) * 100), 100)}% closer to your session goal.`
                        : "Track your first workout!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>


        {/* ================= WEEKLY ACTIVITY (REAL DATA) ================= */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-cyan-400">REPS BY DAY</p>
              <h2 className="mt-1 text-2xl font-bold">Weekly Activity</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp size={18} />
              Live from your workout data
            </div>
          </div>

          <div className="mt-8 flex h-48 items-end justify-between gap-3">
            {(weeklyData.length
              ? weeklyData
              : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, reps: 0 }))
            ).map(({ day, reps }) => (
              <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100">
                  {reps}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-400 opacity-80 transition hover:opacity-100"
                  style={{ height: `${Math.max((reps / maxReps) * 100, 4)}%` }}
                  title={`${reps} reps`}
                />
                <span className="text-xs text-slate-500">{day}</span>
              </div>
            ))}
          </div>
        </div>


        {/* ================= RECENT SESSIONS ================= */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-400">RECENT ACTIVITY</p>
              <h2 className="mt-1 text-2xl font-bold">Last Sessions</h2>
            </div>
            <Clock className="text-slate-500" />
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-slate-500">No recent sessions yet. Start your first workout!</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-400">
                      <Zap size={14} />
                    </div>
                    <p className="text-sm font-bold">
                      {EXERCISE_LABELS[s.exercise_type] || s.exercise_type}
                    </p>
                  </div>
                  <p className={`text-2xl font-black ${accuracyColor(s.accuracy)}`}>
                    {s.accuracy}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Accuracy</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${accuracyBg(s.accuracy)}`}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {s.correct_reps}/{s.total_reps} correct reps
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {s.started_at ? new Date(s.started_at).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* ================= FOOTER CTA ================= */}
        <div className="my-10 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h2 className="text-2xl font-black">Ready for your next trek?</h2>
              <p className="mt-2 text-slate-400">
                Let AI analyze your posture movements in real time.
              </p>
            </div>
            <button
              onClick={() => navigate("/pose-analysis")}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-cyan-400"
            >
              <Play size={18} fill="currentColor" />
              Start Pose Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;