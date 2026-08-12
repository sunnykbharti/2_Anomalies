import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Filter,
  Flame,
  History,
  Loader2,
  Play,
  Search,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

import api from "../api/Api";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterPose, setFilterPose] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // ============================================================
  // FETCH SESSIONS
  // ============================================================

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sessions");

      /*
        Expected backend example:

        [
          {
            id: 1,
            pose: "Squat",
            score: 94,
            repetitions: 24,
            duration: 320,
            status: "Completed",
            date: "2026-08-12T10:30:00"
          }
        ]

        The UI also handles slightly different field names.
      */

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.sessions || [];

      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE SESSION
  // ============================================================

  const deleteSession = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/sessions/${id}`);

      setSessions((previous) =>
        previous.filter((session) => session.id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete session."
      );
    }
  };

  // ============================================================
  // NORMALIZE DATA
  // ============================================================

  const normalizedSessions = useMemo(() => {
    return sessions.map((session) => ({
      ...session,

      pose:
        session.pose ||
        session.exercise ||
        session.pose_name ||
        "Unknown",

      score:
        session.score ??
        session.accuracy ??
        session.form_score ??
        0,

      repetitions:
        session.repetitions ??
        session.reps ??
        session.rep_count ??
        0,

      duration:
        session.duration ??
        session.duration_seconds ??
        0,

      status:
        session.status ||
        "Completed",

      date:
        session.date ||
        session.created_at ||
        session.createdAt ||
        null,
    }));
  }, [sessions]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredSessions = useMemo(() => {
    return normalizedSessions.filter((session) => {
      const matchesSearch =
        session.pose
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesPose =
        filterPose === "All" ||
        session.pose === filterPose;

      const matchesStatus =
        filterStatus === "All" ||
        session.status === filterStatus;

      return (
        matchesSearch &&
        matchesPose &&
        matchesStatus
      );
    });
  }, [
    normalizedSessions,
    search,
    filterPose,
    filterStatus,
  ]);

  // ============================================================
  // STATS
  // ============================================================

  const totalSessions = normalizedSessions.length;

  const totalReps = normalizedSessions.reduce(
    (total, session) =>
      total + Number(session.repetitions || 0),
    0
  );

  const averageScore =
    totalSessions > 0
      ? Math.round(
          normalizedSessions.reduce(
            (total, session) =>
              total + Number(session.score || 0),
            0
          ) / totalSessions
        )
      : 0;

  const totalMinutes = Math.round(
    normalizedSessions.reduce(
      (total, session) =>
        total + Number(session.duration || 0),
      0
    ) / 60
  );

  // ============================================================
  // POSE LIST
  // ============================================================

  const poses = [
    "All",
    ...new Set(
      normalizedSessions.map(
        (session) => session.pose
      )
    ),
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[-15%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute right-[-15%] top-[20%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute bottom-[-20%] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

      </div>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">

              <History size={14} />

              SESSION HISTORY

            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">

              Your Sessions

            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">

              Review your previous movement analysis sessions,
              performance scores, repetitions and progress.

            </p>

          </div>

          <button
            onClick={() => {
              window.location.href = "/pose-analysis";
            }}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1 hover:shadow-cyan-500/40"
          >

            <Play
              size={17}
              fill="currentColor"
            />

            New Analysis

            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-1"
            />

          </button>

        </div>


        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<History size={20} />}
            title="Total Sessions"
            value={totalSessions}
            description="Analysis sessions"
          />

          <StatCard
            icon={<Target size={20} />}
            title="Average Score"
            value={`${averageScore}%`}
            description="Movement accuracy"
          />

          <StatCard
            icon={<Dumbbell size={20} />}
            title="Total Reps"
            value={totalReps}
            description="Repetitions completed"
          />

          <StatCard
            icon={<Clock3 size={20} />}
            title="Training Time"
            value={`${totalMinutes}m`}
            description="Total analysis time"
          />

        </div>


        {/* ======================================================
            FILTER BAR
        ====================================================== */}

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
              />

            </div>


            {/* Pose filter */}

            <div className="flex items-center gap-2">

              <Filter
                size={17}
                className="text-slate-500"
              />

              <select
                value={filterPose}
                onChange={(e) =>
                  setFilterPose(e.target.value)
                }
                className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >

                {poses.map((pose) => (
                  <option
                    key={pose}
                    value={pose}
                  >
                    {pose}
                  </option>
                ))}

              </select>

            </div>


            {/* Status */}

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >

              <option value="All">
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Failed">
                Failed
              </option>

            </select>

          </div>

        </div>


        {/* ======================================================
            SESSION CONTENT
        ====================================================== */}

        <div className="mt-8">

          {/* LOADING */}

          {loading && (

            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">

              <div className="text-center">

                <Loader2
                  size={35}
                  className="mx-auto animate-spin text-cyan-400"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Loading your sessions...
                </p>

              </div>

            </div>

          )}


          {/* ERROR */}

          {!loading && error && (

            <div className="rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-10 text-center">

              <XCircle
                size={40}
                className="mx-auto text-red-400"
              />

              <h3 className="mt-4 text-lg font-bold">
                Unable to load sessions
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={fetchSessions}
                className="mt-6 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
              >
                Try Again
              </button>

            </div>

          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredSessions.length === 0 && (

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">

                  <Activity size={28} />

                </div>

                <h3 className="mt-6 text-xl font-bold">
                  No sessions found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                  {sessions.length === 0
                    ? "Start your first pose analysis session and your results will appear here."
                    : "Try changing your search or filters."}

                </p>

                {sessions.length === 0 && (

                  <button
                    onClick={() => {
                      window.location.href =
                        "/pose-analysis";
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-bold text-slate-950"
                  >

                    Start Analysis

                    <ArrowRight size={16} />

                  </button>

                )}

              </div>

            )}


          {/* SESSION GRID */}

          {!loading &&
            !error &&
            filteredSessions.length > 0 && (

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredSessions.map(
                  (session, index) => (

                    <SessionCard
                      key={session.id || index}
                      session={session}
                      onDelete={
                        session.id
                          ? deleteSession
                          : null
                      }
                    />

                  )
                )}

              </div>

            )}

        </div>

      </main>

    </div>
  );
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon,
  title,
  value,
  description,
}) => {

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20">

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">

            {icon}

          </div>

          <TrendingUp
            size={16}
            className="text-slate-700"
          />

        </div>

        <p className="mt-5 text-3xl font-black">
          {value}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
};


// ============================================================
// SESSION CARD
// ============================================================

const SessionCard = ({
  session,
  onDelete,
}) => {

  const score = Number(session.score || 0);

  const scoreLabel =
    score >= 90
      ? "Excellent"
      : score >= 75
      ? "Good"
      : score >= 50
      ? "Needs Improvement"
      : "Poor";

  const scoreIcon =
    score >= 75 ? (
      <CheckCircle2 size={16} />
    ) : (
      <Zap size={16} />
    );

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]">

      {/* Glow */}

      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />


      <div className="relative">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">

              <Activity size={22} />

            </div>

            <div>

              <h3 className="font-bold text-white">
                {session.pose}
              </h3>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">

                <CalendarDays size={12} />

                {formatDate(session.date)}

              </div>

            </div>

          </div>


          {/* Status */}

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              session.status
                .toLowerCase()
                .includes("complete")
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {session.status}
          </span>

        </div>


        {/* Score */}

        <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider text-slate-600">
                Form Score
              </p>

              <p className="mt-1 text-3xl font-black">
                {score}%
              </p>

            </div>

            <div className="text-right">

              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  score >= 75
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {scoreIcon}
                {scoreLabel}
              </div>

            </div>

          </div>


          {/* Progress */}

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
              style={{
                width: `${Math.min(
                  Math.max(score, 0),
                  100
                )}%`,
              }}
            />

          </div>

        </div>


        {/* Metrics */}

        <div className="mt-4 grid grid-cols-3 gap-2">

          <SessionMetric
            icon={<Dumbbell size={14} />}
            label="Reps"
            value={session.repetitions}
          />

          <SessionMetric
            icon={<Clock3 size={14} />}
            label="Time"
            value={formatDuration(
              session.duration
            )}
          />

          <SessionMetric
            icon={<Flame size={14} />}
            label="Type"
            value="AI"
          />

        </div>


        {/* Bottom */}

        <div className="mt-5 flex items-center gap-2">

          <button
            onClick={() => {
              window.location.href =
                `/sessions/${session.id}`;
            }}
            className="group/button flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
          >

            View Details

            <ArrowRight
              size={14}
              className="transition group-hover/button:translate-x-1"
            />

          </button>


          {onDelete && (

            <button
              onClick={() =>
                onDelete(session.id)
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.04] text-red-400 transition hover:bg-red-400/10"
              title="Delete session"
            >

              <Trash2 size={16} />

            </button>

          )}

        </div>

      </div>

    </div>
  );
};


// ============================================================
// SESSION METRIC
// ============================================================

const SessionMetric = ({
  icon,
  label,
  value,
}) => {

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">

      <div className="flex items-center gap-1.5 text-slate-600">

        {icon}

        <span className="text-[10px]">
          {label}
        </span>

      </div>

      <p className="mt-1 text-sm font-bold text-slate-300">
        {value}
      </p>

    </div>
  );
};


// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {

  if (!date) return "Unknown date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


// ============================================================
// FORMAT DURATION
// ============================================================

const formatDuration = (seconds) => {

  const totalSeconds = Number(seconds || 0);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return remainingSeconds
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
};


export default Sessions;