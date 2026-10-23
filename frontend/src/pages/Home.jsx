import { useNavigate } from "react-router-dom";
import {
  Activity,
  Brain,
  Camera,
  BarChart2,
  ArrowRight,
  Play,
  Zap,
  Smile,
  Sparkles,
} from "lucide-react";


/* ================================================================
   FEATURE DATA
================================================================ */

const FEATURES = [
  {
    icon: Camera,
    title: "Pose Detection",
    desc: "YOLO11 detects 17 body keypoints in real time.",
    accent: "cyan",
  },
  {
    icon: Activity,
    title: "Form Analysis",
    desc: "Joint angles and alignment checked against biomechanical thresholds.",
    accent: "blue",
  },
  {
    icon: Zap,
    title: "Rep Counting",
    desc: "Automatic rep counting with per-rep correctness scoring.",
    accent: "violet",
  },
  {
    icon: Brain,
    title: "AI Coaching",
    desc: "Hinglish voice coaching via Ollama, Gemini, or local fallback.",
    accent: "cyan",
  },
  {
    icon: BarChart2,
    title: "Session Analytics",
    desc: "Dashboard tracks accuracy and progress across sessions.",
    accent: "blue",
  },
  {
    icon: Smile,
    title: "Emotion Detection",
    desc: "DeepFace reads facial expressions in real time.",
    accent: "violet",
  },
];

const ACCENT_MAP = {
  cyan:   { bg: "bg-cyan-400/10",   text: "text-cyan-400",   border: "border-cyan-400/20"   },
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20"   },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
};

const EXERCISES = ["Squat", "Push-up", "Plank", "Lunges", "Tree Pose", "Desk Posture"];

/* stagger delay classes for the 6 feature cards */
const CARD_DELAYS = ["d-1", "d-2", "d-3", "d-4", "d-5", "d-6"];
const CHIP_DELAYS = ["d-1", "d-2", "d-3", "d-4", "d-5", "d-6"];


/* ================================================================
   HOME
================================================================ */

const Home = () => {
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/pose-analysis");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ---- ambient glows ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[480px] w-[480px] rounded-full bg-cyan-500/15 blur-[130px] anim-float" />
        <div className="absolute right-[-5%] top-[15%] h-[560px] w-[560px] rounded-full bg-blue-600/15 blur-[150px]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-[-15%] left-[20%] h-[460px] w-[460px] rounded-full bg-violet-600/10 blur-[140px] anim-float" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>


      {/* ================================================================
          HERO
      ================================================================ */}

      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-24 text-center">

        {/* badge */}
        <div className="anim-fade-down d-1 mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-cyan-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </span>
          AI-Powered Fitness Coach
          <Sparkles size={12} />
        </div>

        {/* headline */}
        <h1 className="anim-fade-up d-2 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
          Analyze.{" "}
          <span className="anim-gradient-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-500 bg-clip-text text-transparent">
            Correct.
          </span>{" "}
          Excel.
        </h1>

        {/* sub-headline */}
        <p className="anim-fade-up d-3 mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Real-time AI pose detection turns your camera into a personal
          movement coach.
          <br className="hidden sm:block" />
          Get instant feedback on form, reps, and posture — in Hinglish.
        </p>

        {/* CTA buttons */}
        <div className="anim-fade-up d-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
          >
            <Play size={18} fill="currentColor" />
            Start Analysis
            <ArrowRight size={18} className="transition group-hover:translate-x-1.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/exercises")}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20 active:scale-95"
          >
            View Exercises
          </button>
        </div>

      </section>


      {/* ================================================================
          STATS STRIP
      ================================================================ */}

      <section className="relative mx-auto max-w-3xl px-6 pb-16">
        <div className="anim-scale-in d-5 flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-6 sm:flex-row sm:gap-0 sm:divide-x sm:divide-white/[0.08]">
          <StatPill value="8+" label="Exercise Modes" delay="d-5" />
          <StatPill value="Real-Time" label="AI Feedback" delay="d-6" />
          <StatPill value="Hinglish" label="Voice Coaching" delay="d-7" />
        </div>
      </section>


      {/* ================================================================
          FEATURES GRID
      ================================================================ */}

      <section className="relative mx-auto max-w-7xl px-6 pb-24">

        <div className="mb-12 text-center">
          <p className="anim-fade-up d-1 mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-400">
            <Sparkles size={12} />
            Platform Capabilities
          </p>
          <h2 className="anim-fade-up d-2 text-3xl font-black md:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              move better
            </span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => {
            const a = ACCENT_MAP[accent];
            return (
              <div
                key={title}
                className={`anim-fade-up ${CARD_DELAYS[i]} group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20`}
              >
                <div className={`mb-4 inline-flex rounded-xl border p-3 transition duration-300 group-hover:scale-110 ${a.bg} ${a.border}`}>
                  <Icon size={22} className={a.text} />
                </div>
                <h3 className="mb-1.5 font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            );
          })}
        </div>

      </section>


      {/* ================================================================
          EXERCISE PREVIEW
      ================================================================ */}

      <section className="relative mx-auto max-w-7xl px-6 pb-24">

        <div className="anim-fade-up d-1 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Supported Exercises</h2>
          <button
            type="button"
            onClick={() => navigate("/exercises")}
            className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition hover:text-cyan-300 hover:gap-2.5"
          >
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {EXERCISES.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => navigate("/exercises")}
              className={`anim-fade-right ${CHIP_DELAYS[i]} shrink-0 rounded-full border border-white/[0.10] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition duration-200 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 hover:-translate-y-0.5 active:scale-95`}
            >
              {name}
            </button>
          ))}
        </div>

      </section>


      {/* ================================================================
          BOTTOM CTA
      ================================================================ */}

      <section className="relative mx-6 mb-20 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">

        {/* glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[90px] anim-float" />

        <div className="relative anim-scale-in d-1">
          <h2 className="text-3xl font-black md:text-4xl">
            Ready to start?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400">
            Let AI analyze your posture, count your reps, and coach you to better form — in real time.
          </p>
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-cyan-500/40 active:scale-95"
          >
            Start Analysis
          </button>
        </div>

      </section>

    </div>
  );
};


/* ================================================================
   STAT PILL
================================================================ */

const StatPill = ({ value, label, delay }) => (
  <div className={`anim-count ${delay} flex flex-1 flex-col items-center gap-0.5 px-6 py-1`}>
    <span className="text-2xl font-black text-white">{value}</span>
    <span className="text-xs text-slate-500">{label}</span>
  </div>
);


export default Home;
