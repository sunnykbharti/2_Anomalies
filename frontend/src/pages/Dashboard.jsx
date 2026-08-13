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
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDashboardSummary, fetchRecentPatients } from "../api/Api.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchDashboardSummary().then(data => setSummary(data));
    fetchRecentPatients().then(data => setRecentPatients(data));
  }, []);

  const stats = summary ? [
    {
      title: "Total Patients",
      value: String(summary.total_patients),
      subtitle: "All time",
      icon: Activity,
      color: "cyan",
    },
    {
      title: "Low Risk",
      value: String(summary.risk_counts.low || 0),
      subtitle: "Patients",
      icon: Target,
      color: "green",
    },
    {
      title: "Medium Risk",
      value: String(summary.risk_counts.medium || 0),
      subtitle: "Patients",
      icon: Target,
      color: "yellow",
    },
    {
      title: "High Risk",
      value: String(summary.risk_counts.high || 0),
      subtitle: "Patients",
      icon: Target,
      color: "red",
    },
  ] : [];


  const exercises = [
    {
      name: "Squats",
      reps: "3 × 15",
      progress: 85,
      difficulty: "Beginner",
    },
    {
      name: "Push Ups",
      reps: "3 × 12",
      progress: 65,
      difficulty: "Intermediate",
    },
    {
      name: "Lunges",
      reps: "3 × 10",
      progress: 45,
      difficulty: "Beginner",
    },
  ];

  const goals = [
    {
      title: "Complete 30 workouts",
      current: 18,
      total: 30,
      icon: Dumbbell,
    },
    {
      title: "Reach 5,000 reps",
      current: 3820,
      total: 5000,
      icon: Activity,
    },
    {
      title: "Improve pose accuracy",
      current: 94,
      total: 100,
      icon: Target,
    },
  ];

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
            <p className="text-sm font-medium text-cyan-400">
              AI FITNESS DASHBOARD
            </p>

            <h1 className="mt-2 text-4xl font-black md:text-5xl">
              Good morning, <span className="text-cyan-400">User</span> 👋
            </h1>

            <p className="mt-3 text-slate-400">
              Keep moving. You're making great progress.
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

                    <TrendingUp
                      size={18}
                      className="text-green-400"
                    />

                  </div>

                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>

                  <h2 className="mt-1 text-3xl font-black">
                    {stat.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.subtitle}
                  </p>

                </div>
              </div>
            );
          })}

        </div>


        {/* ================= MAIN GRID ================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* ================= TODAY'S EXERCISES ================= */}

          <div className="lg:col-span-2">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-sm text-cyan-400">
                    TODAY'S WORKOUT
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Exercise Summary
                  </h2>
                </div>

                <Dumbbell className="text-cyan-400" />

              </div>


              <div className="space-y-4">

                {exercises.map((exercise, index) => (

                  <div
                    key={index}
                    className="
                      group rounded-2xl border border-white/10
                      bg-black/20 p-5
                      transition
                      hover:border-cyan-400/30
                      hover:bg-white/[0.05]
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                          <Activity size={22} />
                        </div>

                        <div>
                          <h3 className="font-bold">
                            {exercise.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {exercise.reps} • {exercise.difficulty}
                          </p>
                        </div>

                      </div>

                      <CheckCircle
                        size={22}
                        className={
                          exercise.progress >= 80
                            ? "text-green-400"
                            : "text-slate-600"
                        }
                      />

                    </div>


                    {/* Progress */}

                    <div className="mt-5">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="text-slate-500">
                          Progress
                        </span>

                        <span className="text-cyan-400">
                          {exercise.progress}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                          style={{
                            width: `${exercise.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* ================= GOALS ================= */}

          <div>

            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

              <div className="mb-7">

                <p className="text-sm text-purple-400">
                  YOUR TARGETS
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Goals
                </h2>

              </div>


              <div className="space-y-7">

                {goals.map((goal, index) => {

                  const Icon = goal.icon;

                  const percentage =
                    (goal.current / goal.total) * 100;

                  return (
                    <div key={index}>

                      <div className="mb-3 flex items-center gap-3">

                        <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                          <Icon size={18} />
                        </div>

                        <p className="text-sm font-medium">
                          {goal.title}
                        </p>

                      </div>


                      <div className="flex justify-between text-xs text-slate-500">

                        <span>
                          {goal.current.toLocaleString()}
                        </span>

                        <span>
                          {goal.total.toLocaleString()}
                        </span>

                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
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

                    <p className="font-bold">
                      Keep Going!
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      You're 72% closer to your monthly goals.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================= WEEKLY ACTIVITY ================= */}

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <p className="text-sm text-cyan-400">
                ACTIVITY
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Weekly Performance
              </h2>

            </div>

            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp size={18} />
              +18% from last week
            </div>

          </div>


          {/* Fake activity chart */}

          <div className="mt-8 flex h-48 items-end justify-between gap-3">

            {[
              ["Mon", 45],
              ["Tue", 70],
              ["Wed", 55],
              ["Thu", 90],
              ["Fri", 65],
              ["Sat", 82],
              ["Sun", 40],
            ].map(([day, value]) => (

              <div
                key={day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-3"
              >

                <div
                  className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-400 opacity-80 transition hover:opacity-100"
                  style={{
                    height: `${value}%`,
                  }}
                />

                <span className="text-xs text-slate-500">
                  {day}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* ================= RECENT SESSION ================= */}

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <p className="text-sm text-cyan-400">
                RECENT ACTIVITY
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Last Session
              </h2>

            </div>

            <Clock className="text-slate-500" />

          </div>


            <div className="grid gap-5 md:grid-cols-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="space-y-1">
                  <p className="text-xs text-slate-500">Patient</p>
                  <p className="mt-1 font-bold">{patient.name}</p>
                  <p className="text-xs text-slate-500">Age: {patient.age}</p>
                  <p className="text-xs text-slate-500">Gender: {patient.gender}</p>
                  <p className="text-xs text-slate-500">Village: {patient.village}</p>
                </div>
              ))}
            </div>

        </div>


        {/* ================= FOOTER CTA ================= */}

        <div className="my-10 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8">

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            <div>

              <h2 className="text-2xl font-black">
                Ready for your next session?
              </h2>

              <p className="mt-2 text-slate-400">
                Let AI analyze your movements in real time.
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