import { useNavigate } from "react-router-dom";

import {
  Activity,
  Brain,
  Camera,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Play,
  Zap,
  Target,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  // ============================================================
  // START ANALYSIS
  // ============================================================

  const handleStartAnalysis = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/pose-analysis");
    } else {
      navigate("/login");
    }
  };

  // ============================================================
  // HOME
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Cyan glow */}
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[130px]" />

        {/* Blue glow */}
        <div className="absolute right-[-10%] top-[20%] h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[150px]" />

        {/* Purple glow */}
        <div className="absolute bottom-[-20%] left-[25%] h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

      </div>


      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative mx-auto max-w-7xl px-6 pt-20">

        <div className="grid min-h-[85vh] items-center gap-16 lg:grid-cols-2">

          {/* ====================================================
              LEFT SIDE
          ==================================================== */}

          <div className="relative z-10">

            {/* Badge */}

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-xl">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              AI Powered Movement Intelligence

              <Sparkles size={15} />

            </div>


            {/* Heading */}

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl xl:text-8xl">

              Understand

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Every Move.
              </span>

            </h1>


            {/* Description */}

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400 md:text-xl">

              AI-powered pose detection that transforms your camera into an
              intelligent movement analysis system.

            </p>


            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="mt-9 flex flex-wrap gap-4">

              {/* START ANALYSIS */}

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40"
              >

                <Play
                  size={19}
                  fill="currentColor"
                />

                Start Analysis

                <ArrowRight
                  size={19}
                  className="transition group-hover:translate-x-1"
                />

              </button>


              {/* EXPLORE PLATFORM */}

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
              >

                Explore Platform

              </button>

            </div>


            {/* Trust */}

            <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">

              <CheckCircle2
                size={17}
                className="text-cyan-400"
              />

              Real-time AI movement analysis

            </div>


            {/* ==================================================
                STATS
            ================================================== */}

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">

              <Stat
                value="96%"
                label="Pose Accuracy"
              />

              <Stat
                value="24/7"
                label="AI Monitoring"
              />

              <Stat
                value="30+"
                label="Movements"
              />

            </div>

          </div>


          {/* ====================================================
              RIGHT SIDE — AI VISUAL
          ==================================================== */}

          <div className="relative flex min-h-[600px] items-center justify-center">

            {/* Main Glow */}

            <div className="absolute h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[100px]" />


            {/* Rotating Rings */}

            <div className="absolute h-[480px] w-[480px] animate-[spin_25s_linear_infinite] rounded-full border border-cyan-400/10 border-dashed" />

            <div className="absolute h-[390px] w-[390px] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-blue-400/10" />


            {/* ==================================================
                MAIN AI CARD
            ================================================== */}

            <div
              className="relative z-10 w-full max-w-[500px] rounded-[35px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-700"
              style={{
                transform:
                  "perspective(1200px) rotateY(-8deg) rotateX(5deg)",
              }}
            >

              {/* ==================================================
                  CARD HEADER
              ================================================== */}

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                    <Activity />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      LIVE ANALYSIS
                    </p>

                    <h3 className="font-bold">
                      Pose Intelligence
                    </h3>

                  </div>

                </div>


                {/* Active */}

                <div className="flex items-center gap-2 rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-400">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

                  ACTIVE

                </div>

              </div>


              {/* ==================================================
                  HUMAN POSE
              ================================================== */}

              <div className="relative mx-auto my-8 h-[320px] w-full overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-cyan-950/30 to-slate-950/80">

                {/* Scanning line */}

                <div className="absolute left-0 right-0 top-1/2 h-px animate-pulse bg-cyan-400/30 shadow-[0_0_20px_#22d3ee]" />


                {/* Outer circle */}

                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10" />


                {/* Inner circle */}

                <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />


                {/* HEAD */}

                <div className="absolute left-1/2 top-8 h-14 w-14 -translate-x-1/2 rounded-full border-[3px] border-cyan-300 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.8)]" />


                {/* BODY */}

                <div className="absolute left-1/2 top-[80px] h-[110px] w-[4px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500 shadow-[0_0_20px_#22d3ee]" />


                {/* LEFT ARM */}

                <div className="absolute left-[29%] top-[105px] h-[4px] w-[150px] rotate-[18deg] rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee]" />


                {/* RIGHT ARM */}

                <div className="absolute right-[29%] top-[105px] h-[4px] w-[150px] -rotate-[18deg] rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee]" />


                {/* LEFT LEG */}

                <div className="absolute left-[43%] top-[185px] h-[125px] w-[4px] -rotate-[14deg] rounded-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_20px_#3b82f6]" />


                {/* RIGHT LEG */}

                <div className="absolute right-[43%] top-[185px] h-[125px] w-[4px] rotate-[14deg] rounded-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_20px_#3b82f6]" />


                {/* JOINTS */}

                {[
                  "top-16 left-1/2",
                  "top-[105px] left-[30%]",
                  "top-[105px] right-[30%]",
                  "top-[185px] left-1/2",
                  "bottom-5 left-[42%]",
                  "bottom-5 right-[42%]",
                ].map((position, index) => (

                  <div
                    key={index}
                    className={`absolute ${position} h-4 w-4 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_20px_#22d3ee]`}
                  />

                ))}


                {/* AI TRACKING */}

                <div className="absolute left-5 top-5 rounded-xl border border-cyan-400/20 bg-black/40 px-3 py-2 text-xs text-cyan-300 backdrop-blur-xl">

                  AI TRACKING

                </div>


                {/* LANDMARKS */}

                <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-400 backdrop-blur-xl">

                  17 LANDMARKS

                </div>

              </div>


              {/* ==================================================
                  METRICS
              ================================================== */}

              <div className="grid grid-cols-3 gap-3">

                <Metric
                  icon={<Target size={15} />}
                  title="Accuracy"
                  value="96.8%"
                />

                <Metric
                  icon={<Activity size={15} />}
                  title="Posture"
                  value="Excellent"
                />

                <Metric
                  icon={<Zap size={15} />}
                  title="Reps"
                  value="24"
                />

              </div>

            </div>


            {/* ==================================================
                FLOATING POSTURE CARD
            ================================================== */}

            <div className="absolute -left-4 top-24 z-20 hidden animate-bounce rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl md:block">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-green-400/10 p-2 text-green-400">
                  <HeartPulse size={20} />
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    POSTURE
                  </p>

                  <p className="font-bold text-green-400">
                    Excellent
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                FLOATING CONFIDENCE CARD
            ================================================== */}

            <div className="absolute -right-5 bottom-32 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl md:block">

              <p className="text-xs text-slate-500">
                AI CONFIDENCE
              </p>

              <div className="mt-2 flex items-center gap-3">

                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">

                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />

                </div>

                <span className="text-sm font-bold">
                  94%
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          FEATURES
      ======================================================== */}

      <section className="relative mx-auto max-w-7xl px-6 py-28">

        <div className="mb-16 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-400">

            <Sparkles size={14} />

            Intelligent Platform

          </div>


          <h2 className="text-4xl font-black md:text-6xl">

            Built Around Your

            <span className="block bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">

              Movement

            </span>

          </h2>


          <p className="mx-auto mt-5 max-w-2xl text-slate-400">

            Advanced AI tools designed to understand your movement,
            analyze your performance and provide meaningful insights.

          </p>

        </div>


        {/* ======================================================
            FEATURE CARDS
        ====================================================== */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <Feature
            icon={<Camera />}
            title="Pose Detection"
            text="Real-time body landmark detection through your camera."
            onExplore={handleStartAnalysis}
          />

          <Feature
            icon={<Brain />}
            title="AI Analysis"
            text="Intelligent analysis of movement patterns and posture."
            onExplore={handleStartAnalysis}
          />

          <Feature
            icon={<Dumbbell />}
            title="Exercise Tracking"
            text="Automatically recognize exercises and count repetitions."
            onExplore={handleStartAnalysis}
          />

          <Feature
            icon={<ShieldCheck />}
            title="Smart Monitoring"
            text="Identify incorrect movements and improve your technique."
            onExplore={handleStartAnalysis}
          />

        </div>

      </section>


      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="relative mx-6 mb-20 overflow-hidden rounded-[35px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-6 py-24 text-center shadow-2xl">

        {/* Glow */}

        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />


        <div className="relative">

          {/* Icon */}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 shadow-lg shadow-cyan-500/20">

            <Brain size={30} />

          </div>


          {/* Heading */}

          <h2 className="text-4xl font-black md:text-6xl">

            Your Movement.

            <br />

            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">

              Understood by AI.

            </span>

          </h2>


          {/* Description */}

          <p className="mx-auto mt-6 max-w-xl text-slate-400">

            Start your intelligent movement analysis journey today.

          </p>


          {/* CTA BUTTON */}

          <button
            type="button"
            onClick={handleStartAnalysis}
            className="mt-9 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-9 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-1 hover:shadow-cyan-500/40"
          >

            Start Analysis

          </button>

        </div>

      </section>

    </div>
  );
};


/* ==============================================================
   STAT COMPONENT
================================================================ */

const Stat = ({ value, label }) => {
  return (
    <div className="border-l border-white/10 pl-4">

      <p className="text-2xl font-black md:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>

    </div>
  );
};


/* ==============================================================
   METRIC COMPONENT
================================================================ */

const Metric = ({ icon, title, value }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-3">

      <div className="flex items-center gap-2 text-slate-500">

        {icon}

        <span className="text-xs">
          {title}
        </span>

      </div>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>

    </div>
  );
};


/* ==============================================================
   FEATURE COMPONENT
================================================================ */

const Feature = ({
  icon,
  title,
  text,
  onExplore,
}) => {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-7
        backdrop-blur-xl
        transition-all
        duration-500
        hover:-translate-y-3
        hover:border-cyan-400/30
        hover:bg-white/[0.07]
        hover:shadow-2xl
        hover:shadow-cyan-500/10
      "
    >

      {/* Hover glow */}

      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />


      <div className="relative">

        {/* Icon */}

        <div className="mb-6 inline-flex rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4 text-cyan-400 transition duration-500 group-hover:scale-110 group-hover:rotate-6">

          {icon}

        </div>


        {/* Title */}

        <h3 className="text-xl font-bold">
          {title}
        </h3>


        {/* Description */}

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {text}
        </p>


        {/* Explore */}

        <button
          type="button"
          onClick={onExplore}
          className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400"
        >

          Explore

          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-1"
          />

        </button>

      </div>

    </div>
  );
};


export default Home;