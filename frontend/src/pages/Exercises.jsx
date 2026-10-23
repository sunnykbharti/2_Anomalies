import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Play,
  Search,
  Sparkles,
  Target,
  Wind,
  X,
  Zap,
} from "lucide-react";

const exercises = [
  {
    id: 0,
    name: "Study & Interview Posture Guard",
    category: "Ergonomics",
    difficulty: "All Levels",
    duration: "Continuous",
    calories: "Focus Mode",
    description:
      "Monitors text neck, slouching, shoulder tilt, and proximity during study sessions and remote interviews.",
    video: "https://www.youtube.com/watch?v=RqcOCb4IAL8",
    tags: ["Ergonomics", "Study", "Interview", "Text Neck"],
  },
  {
    id: 1,
    name: "Squats",
    category: "Strength",
    difficulty: "Beginner",
    duration: "10 min",
    calories: "80 kcal",
    description:
      "A fundamental lower-body exercise that strengthens the legs and improves overall stability.",
    video: "https://www.youtube.com/watch?v=aclHkVaku9U",
    tags: ["Legs", "Strength", "Lower Body"],
  },
  {
    id: 2,
    name: "Push Ups",
    category: "Strength",
    difficulty: "Beginner",
    duration: "8 min",
    calories: "70 kcal",
    description:
      "A classic bodyweight exercise targeting the chest, shoulders, arms and core.",
    video: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    tags: ["Chest", "Arms", "Core"],
  },
  {
    id: 3,
    name: "Surya Namaskar",
    category: "Yoga",
    difficulty: "Beginner",
    duration: "15 min",
    calories: "100 kcal",
    description:
      "A flowing sequence of yoga postures designed to improve flexibility, mobility and body awareness.",
    video: "https://www.youtube.com/watch?v=6IUy8rFfB9E",
    tags: ["Yoga", "Flexibility", "Mobility"],
  },
  {
    id: 4,
    name: "Plank",
    category: "Core",
    difficulty: "Beginner",
    duration: "5 min",
    calories: "45 kcal",
    description:
      "An isometric exercise that develops core stability and improves body control.",
    video: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    tags: ["Core", "Stability", "Balance"],
  },
  {
    id: 5,
    name: "Lunges",
    category: "Strength",
    difficulty: "Beginner",
    duration: "10 min",
    calories: "85 kcal",
    description:
      "A lower-body movement that helps develop leg strength, balance and coordination.",
    video: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    tags: ["Legs", "Balance", "Strength"],
  },
  {
    id: 6,
    name: "Mountain Pose",
    category: "Yoga",
    difficulty: "Beginner",
    duration: "5 min",
    calories: "25 kcal",
    description:
      "A foundational yoga posture that encourages posture awareness and controlled breathing.",
    video: "https://www.youtube.com/watch?v=NYhH8Gr35cI",
    tags: ["Yoga", "Posture", "Breathing"],
  },
  {
    id: 7,
    name: "Warrior II",
    category: "Yoga",
    difficulty: "Intermediate",
    duration: "8 min",
    calories: "50 kcal",
    description:
      "A standing yoga posture focused on leg strength, balance and controlled positioning.",
    video: "https://www.youtube.com/watch?v=Mn6RSIRCV3w",
    tags: ["Yoga", "Balance", "Legs"],
  },
  {
    id: 8,
    name: "Jumping Jacks",
    category: "Cardio",
    difficulty: "Beginner",
    duration: "7 min",
    calories: "90 kcal",
    description:
      "A simple cardio movement that increases heart rate and warms up the whole body.",
    video: "https://www.youtube.com/watch?v=c4DAnQ6DtF8",
    tags: ["Cardio", "Warm Up", "Full Body"],
  },
  {
    id: 9,
    name: "Glute Bridge",
    category: "Strength",
    difficulty: "Beginner",
    duration: "8 min",
    calories: "60 kcal",
    description:
      "A controlled movement that targets the glutes and posterior chain while developing hip stability.",
    video: "https://www.youtube.com/watch?v=wPM8icPu6H8",
    tags: ["Glutes", "Hips", "Strength"],
  },
  {
    id: 10,
    name: "Child's Pose",
    category: "Yoga",
    difficulty: "Beginner",
    duration: "5 min",
    calories: "20 kcal",
    description:
      "A gentle yoga posture commonly used for relaxation and stretching.",
    video: "https://www.youtube.com/watch?v=2MJGg-dUKh0",
    tags: ["Yoga", "Stretching", "Relaxation"],
  },
  {
    id: 11,
    name: "High Knees",
    category: "Cardio",
    difficulty: "Intermediate",
    duration: "6 min",
    calories: "95 kcal",
    description:
      "A dynamic cardio movement that challenges coordination and lower-body endurance.",
    video: "https://www.youtube.com/watch?v=8opcQdC-V-U",
    tags: ["Cardio", "Endurance", "Full Body"],
  },
  {
    id: 12,
    name: "Cat Cow Stretch",
    category: "Mobility",
    difficulty: "Beginner",
    duration: "6 min",
    calories: "30 kcal",
    description:
      "A gentle mobility exercise that moves the spine through controlled flexion and extension.",
    video: "https://www.youtube.com/watch?v=y39PrKY_4JM",
    tags: ["Mobility", "Stretching", "Spine"],
  },
];

const categories = ["All", "Strength", "Yoga", "Cardio", "Core", "Ergonomics"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

// Returns a small icon node based on category
const categoryIcon = (cat) => {
  switch (cat) {
    case "Strength":   return <Dumbbell size={16} />;
    case "Yoga":       return <Wind size={16} />;
    case "Cardio":     return <Activity size={16} />;
    case "Core":       return <Target size={16} />;
    case "Ergonomics": return <Zap size={16} />;
    default:           return <Sparkles size={16} />;
  }
};

const Exercises = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(search.toLowerCase()) ||
        exercise.description.toLowerCase().includes(search.toLowerCase()) ||
        exercise.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );
      const matchesCategory = category === "All" || exercise.category === category;
      const matchesDifficulty = difficulty === "All" || exercise.difficulty === difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, category, difficulty]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-40 top-[20%] h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Sparkles size={13} />
            MOVEMENT LIBRARY
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Exercise Library</h1>
          <p className="mt-1.5 text-sm text-slate-400">13 exercises across 5 categories</p>
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="relative mb-6 max-w-xl">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises, yoga, tags..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30 focus:ring-2 focus:ring-cyan-400/5"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className="mb-8 space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
                  {item}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((item) => (
                <FilterChip key={item} active={difficulty === item} onClick={() => setDifficulty(item)}>
                  {item}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results count ──────────────────────────────────── */}
        <p className="mb-5 text-sm text-slate-500">
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""} found
        </p>

        {/* ── Grid ───────────────────────────────────────────── */}
        {filteredExercises.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onOpen={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            onReset={() => {
              setSearch("");
              setCategory("All");
              setDifficulty("All");
            }}
          />
        )}
      </main>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

/* ── Exercise Card ──────────────────────────────────────────────── */

const ExerciseCard = ({ exercise, onOpen }) => (
  <article className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.05]">
    {/* Icon + category */}
    <div className="mb-4 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
        {categoryIcon(exercise.category)}
      </div>
      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
        {exercise.category}
      </span>
    </div>

    {/* Title */}
    <h3 className="text-base font-bold text-white transition group-hover:text-cyan-300">
      {exercise.name}
    </h3>

    {/* Description */}
    <p className="mt-2 flex-1 line-clamp-2 text-sm leading-6 text-slate-500">
      {exercise.description}
    </p>

    {/* Meta */}
    <div className="mt-4 flex items-center gap-4 border-t border-white/[0.05] pt-4 text-xs text-slate-500">
      <span className="flex items-center gap-1.5">
        <Clock3 size={13} className="text-cyan-400" />
        {exercise.duration}
      </span>
      <span className="flex items-center gap-1.5">
        <Activity size={13} className="text-cyan-400" />
        {exercise.calories}
      </span>
      <span className="ml-auto rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
        {exercise.difficulty}
      </span>
    </div>

    {/* Button */}
    <button
      onClick={onOpen}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
    >
      View Details
      <ArrowRight size={15} />
    </button>
  </article>
);

/* ── Exercise Modal ─────────────────────────────────────────────── */

const ExerciseModal = ({ exercise, onClose }) => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#07101f] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-slate-400 transition hover:text-white"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="border-b border-white/[0.06] p-6">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
              {categoryIcon(exercise.category)}
            </div>
            <span className="text-xs font-semibold text-cyan-400">{exercise.category}</span>
          </div>
          <h2 className="text-2xl font-black">{exercise.name}</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm leading-7 text-slate-400">{exercise.description}</p>

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">Duration</p>
              <p className="mt-1 text-sm font-bold">{exercise.duration}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">Calories</p>
              <p className="mt-1 text-sm font-bold">{exercise.calories}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">Difficulty</p>
              <p className="mt-1 text-sm font-bold">{exercise.difficulty}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">Focus Areas</p>
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1 text-[11px] text-cyan-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/pose-analysis")}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Sparkles size={16} />
              Start AI Analysis →
            </button>
            <a
              href={exercise.video}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]"
            >
              <Play size={16} fill="currentColor" />
              Watch Demo
            </a>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-400" />
            <p className="text-xs leading-5 text-slate-600">
              Perform movements at a comfortable pace and stop if you experience pain or discomfort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Small components ───────────────────────────────────────────── */

const FilterChip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
      active
        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
        : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300"
    }`}
  >
    {children}
  </button>
);

const EmptyState = ({ onReset }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] py-20 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
      <Search size={24} />
    </div>
    <h3 className="mt-4 text-lg font-bold">No exercises found</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
      Try a different search term or adjust your filters.
    </p>
    <button
      onClick={onReset}
      className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
    >
      Reset Filters
    </button>
  </div>
);

export default Exercises;
