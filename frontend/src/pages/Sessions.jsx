import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  Filter,
  History,
  Loader2,
  Search,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/Api";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {
  if (!date) return "Unknown date";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds || 0);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

function scoreBadgeCls(score) {
  if (score >= 85) return "bg-green-400/10 text-green-400 border border-green-400/20";
  if (score >= 60) return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
  return "bg-red-400/10 text-red-400 border border-red-400/20";
}

// ============================================================
// SESSIONS PAGE
// ============================================================

const Sessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterPose, setFilterPose] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/sessions");
        if (cancelled) return;
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.sessions || [];
        setSessions(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch sessions:", err);
        setError(err.response?.data?.message || "Unable to load your sessions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tick]);

  // fetchSessions exposed for external retry calls
  const fetchSessions = () => setTick((t) => t + 1);

  // ---- Delete ----
  const deleteSession = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this session?");
    if (!confirmed) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Unable to delete session.");
    }
  };

  // ---- Normalize ----
  const normalizedSessions = useMemo(() => sessions.map((session) => ({
    ...session,
    pose: session.pose || session.exercise || session.pose_name || "Unknown",
    score: session.score ?? session.accuracy ?? session.form_score ?? 0,
    repetitions: session.repetitions ?? session.reps ?? session.rep_count ?? 0,
    duration: session.duration ?? session.duration_seconds ?? 0,
    status: session.status || "Completed",
    date: session.date || session.created_at || session.createdAt || null,
  })), [sessions]);

  // ---- Filter ----
  const filteredSessions = useMemo(() => normalizedSessions.filter((session) => {
    const matchesSearch = session.pose.toLowerCase().includes(search.toLowerCase());
    const matchesPose   = filterPose === "All" || session.pose === filterPose;
    const matchesStatus = filterStatus === "All" || session.status === filterStatus;
    return matchesSearch && matchesPose && matchesStatus;
  }), [normalizedSessions, search, filterPose, filterStatus]);

  // ---- Stats (from ALL sessions, not filtered) ----
  const totalSessions = normalizedSessions.length;
  const totalReps     = normalizedSessions.reduce((t, s) => t + Number(s.repetitions || 0), 0);
  const avgScore      = totalSessions > 0
    ? Math.round(normalizedSessions.reduce((t, s) => t + Number(s.score || 0), 0) / totalSessions)
    : 0;
  const bestScore     = totalSessions > 0
    ? Math.max(...normalizedSessions.map((s) => Number(s.score || 0)))
    : 0;

  // ---- Pose list for filter ----
  const poses = ["All", ...new Set(normalizedSessions.map((s) => s.pose))];

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Sessions</h1>
            <p className="mt-1 text-slate-400">Review your movement analysis history</p>
          </div>
          <button
            onClick={() => navigate("/pose-analysis")}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            New Analysis
            <ArrowRight size={16} />
          </button>
        </div>

        {/* STAT STRIP */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: History,  title: "Total Sessions", value: totalSessions,    sub: "All time" },
            { icon: Target,   title: "Avg Score",      value: `${avgScore}%`,  sub: "Movement accuracy" },
            { icon: Zap,      title: "Best Score",     value: `${bestScore}%`, sub: "Personal best" },
            { icon: Dumbbell, title: "Total Reps",     value: totalReps,        sub: "Reps completed" },
          ].map(({ icon: Icon, title, value, sub }) => (
            <div key={title} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-400">
                  <Icon size={20} />
                </div>
                <TrendingUp size={16} className="text-slate-600" />
              </div>
              <p className="text-sm text-slate-400">{title}</p>
              <p className="mt-1 text-3xl font-black">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="mt-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Exercise filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-500" />
              <select
                value={filterPose}
                onChange={(e) => setFilterPose(e.target.value)}
                className="rounded-xl border border-white/[0.08] bg-[#0b1220] px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >
                {poses.map((pose) => (
                  <option key={pose} value={pose}>{pose}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#0b1220] px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>

          </div>
        </div>

        {/* SESSION LIST */}
        <div className="mt-6">

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <div className="text-center">
                <Loader2 size={32} className="mx-auto animate-spin text-cyan-400" />
                <p className="mt-3 text-sm text-slate-500">Loading your sessions...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.04] p-10 text-center">
              <XCircle size={36} className="mx-auto text-red-400" />
              <h3 className="mt-4 text-lg font-bold">Unable to load sessions</h3>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                onClick={fetchSessions}
                className="mt-5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredSessions.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">
                <Activity size={26} />
              </div>
              <h3 className="mt-5 text-xl font-bold">No sessions found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {sessions.length === 0
                  ? "Start your first pose analysis session and your results will appear here."
                  : "Try changing your search or filters."}
              </p>
              {sessions.length === 0 && (
                <button
                  onClick={() => navigate("/pose-analysis")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Start your first session →
                </button>
              )}
            </div>
          )}

          {/* Session cards */}
          {!loading && !error && filteredSessions.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredSessions.map((session, index) => (
                <SessionCard
                  key={session.id || index}
                  session={session}
                  onDelete={session.id ? deleteSession : null}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


// ============================================================
// SESSION CARD
// ============================================================

const SessionCard = ({ session, onDelete }) => {
  const score = Number(session.score || 0);

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Left: name + date */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="font-semibold">{session.pose}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays size={11} />
              {formatDate(session.date)}
            </div>
          </div>
        </div>

        {/* Middle: metrics */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Dumbbell size={14} />
            <span>{session.repetitions} reps</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock3 size={14} />
            <span>{formatDuration(session.duration)}</span>
          </div>
        </div>

        {/* Right: accuracy badge + delete */}
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${scoreBadgeCls(score)}`}>
            {score}%
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/5 text-red-400 transition hover:bg-red-400/10"
              title="Delete session"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


export default Sessions;
