import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Award,
  CheckCircle2,
  Dumbbell,
  Loader2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import api from "../api/Api";

// Map exercise_type keys to display labels
const EXERCISE_LABELS = {
  squat: "Squats", pushup: "Push Ups", lunges: "Lunges",
  plank: "Plank", suryanamaskar: "Surya Namaskar",
  tree_pose: "Tree Pose", tadasana: "Tadasana",
  warrior_two: "Warrior II", triangle: "Triangle",
  downward_dog: "Downward Dog", cobra: "Cobra",
  posture: "Posture Check", desk_posture: "Desk Posture",
};

const Progress = () => {
  const navigate = useNavigate();

  const [weeklyData, setWeeklyData] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [weeklyResp, sessionsResp, summaryResp] = await Promise.all([
          api.get("/dashboard/weekly"),
          api.get("/sessions"),
          api.get("/dashboard/summary"),
        ]);

        setWeeklyData(
          (weeklyResp.data || []).map((r) => ({ day: r.day, value: r.reps || 0 }))
        );

        const rawSessions = (sessionsResp.data || []).slice(0, 5).map((s) => ({
          exercise: EXERCISE_LABELS[s.exercise_type] || s.pose || s.exercise_type,
          date: s.date ? new Date(s.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—",
          duration: s.duration ? `${Math.round(s.duration / 60)} min` : "—",
          score: s.score ?? 0,
          reps: s.repetitions ?? 0,
        }));
        setRecentSessions(rawSessions);

        setSummary(summaryResp.data);
      } catch (err) {
        console.error("[Progress] fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalReps   = summary?.total_reps    ?? 0;
  const totalSess   = summary?.total_sessions ?? 0;
  const avgAccuracy = summary?.avg_accuracy   ?? 0;
  const bestScore   = recentSessions.reduce((max, s) => Math.max(max, s.score), 0);

  const achievements = [
    {
      title: "100 Reps",
      description: "Completed more than 100 exercise reps",
      icon: <Target size={20} />,
      unlocked: totalReps >= 100,
    },
    {
      title: "Perfect Form",
      description: "Achieved a 95%+ posture score",
      icon: <Award size={20} />,
      unlocked: avgAccuracy >= 95,
    },
    {
      title: "10 Sessions",
      description: "Complete 10 workout sessions",
      icon: <Zap size={20} />,
      unlocked: totalSess >= 10,
    },
    {
      title: "Consistency Pro",
      description: "Complete 30 sessions",
      icon: <Trophy size={20} />,
      unlocked: totalSess >= 30,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-cyan-400" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] text-white">
        <p className="text-slate-400">Failed to load progress data.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxReps = Math.max(...weeklyData.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[20%] h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold text-cyan-400">
            <TrendingUp size={13} />
            PERFORMANCE OVERVIEW
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Progress</h1>
          <p className="mt-1.5 text-sm text-slate-400">Track your improvement over time</p>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Activity size={18} />}
            label="Total Sessions"
            value={totalSess}
          />
          <StatCard
            icon={<Dumbbell size={18} />}
            label="Total Reps"
            value={totalReps}
          />
          <StatCard
            icon={<Target size={18} />}
            label="Avg Accuracy"
            value={`${Math.round(avgAccuracy)}%`}
          />
          <StatCard
            icon={<Trophy size={18} />}
            label="Best Score"
            value={`${bestScore}%`}
            accent
          />
        </div>

        {/* ── Weekly Chart ───────────────────────────────────── */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Activity</p>
          <h2 className="mt-1 text-lg font-bold">Reps per Day</h2>

          {weeklyData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No weekly data yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {weeklyData.map((item) => {
                const pct = Math.round((item.value / maxReps) * 100);
                return (
                  <div key={item.day} className="flex items-center gap-4">
                    <span className="w-8 shrink-0 text-right text-xs font-medium text-slate-400">{item.day}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-white/[0.05] h-2.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-slate-500">{item.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Recent Sessions ────────────────────────────────── */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity</p>
          <h2 className="mt-1 text-lg font-bold">Recent Sessions</h2>

          {recentSessions.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No sessions recorded yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {recentSessions.map((session, i) => (
                <div
                  key={`${session.exercise}-${i}`}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-cyan-400/15 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                      <Activity size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{session.exercise}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 pl-13 sm:pl-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">Reps</p>
                      <p className="mt-0.5 text-sm font-bold">{session.reps}</p>
                    </div>
                    <div
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        session.score >= 90
                          ? "bg-green-400/10 text-green-400"
                          : session.score >= 70
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-slate-400/10 text-slate-400"
                      }`}
                    >
                      {session.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Achievements ───────────────────────────────────── */}
        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Milestones</p>
          <h2 className="mt-1 mb-4 text-lg font-bold">Achievements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((a) => (
              <div
                key={a.title}
                className={`relative rounded-2xl border p-5 transition duration-300 ${
                  a.unlocked
                    ? "border-cyan-400/20 bg-white/[0.04] hover:-translate-y-0.5"
                    : "border-white/[0.08] bg-white/[0.03] opacity-50"
                }`}
              >
                {a.unlocked && (
                  <CheckCircle2 size={15} className="absolute right-4 top-4 text-cyan-400" />
                )}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    a.unlocked ? "bg-cyan-400/10 text-cyan-400" : "bg-white/5 text-slate-600"
                  }`}
                >
                  {a.icon}
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-200">{a.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{a.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Keep going!</p>
              <p className="mt-0.5 text-xs text-slate-500">Every session improves your form and consistency.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/pose-analysis")}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Start Workout
          </button>
        </div>

      </main>
    </div>
  );
};

/* ── Stat Card ──────────────────────────────────────────────────── */

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-violet-500/10 text-violet-400" : "bg-cyan-400/10 text-cyan-400"}`}>
      {icon}
    </div>
    <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
  </div>
);

export default Progress;
