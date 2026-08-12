import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Dumbbell,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import api from "../api/Api";

const Login = () => {
  const [showOtp, setShowOtp] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleMobileSubmit = async (data) => {
    try {
      const response = await api.post("/login", {
        mobile: data.mobile,
      });

      console.log(response.data);

      setMobileNumber(data.mobile);
      setShowOtp(true);

      alert("OTP sent successfully");
    } catch (error) {
      console.error("OTP sending failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleOtpSubmit = async (data) => {
    try {
      const response = await api.post("/login", {
        mobile: mobileNumber,
        otp: data.otp,
      });

      console.log(response.data);

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      alert("Login successful!");

      navigate("/");
    } catch (error) {
      console.error("OTP verification failed:", error);

      alert(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        {/* Cyan glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Blue glow */}
        <div className="absolute -right-40 top-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

        {/* Purple glow */}
        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:grid-cols-2">

          {/* =====================================================
              LEFT SIDE
          ===================================================== */}

          <div className="relative hidden overflow-hidden p-10 lg:flex lg:min-h-[700px] lg:flex-col lg:justify-between xl:p-14">

            {/* Decorative rings */}

            <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10 border-dashed animate-[spin_25s_linear_infinite]" />

            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10 animate-[spin_18s_linear_infinite_reverse]" />

            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[70px]" />

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="relative z-10 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
                <Activity size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  PoseCare
                </h1>

                <p className="text-xs text-slate-500">
                  AI Posture & Movement Coach
                </p>
              </div>

            </div>

            {/* =================================================
                HERO
            ================================================= */}

            <div className="relative z-10">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                <Sparkles size={14} />
                AI Movement Intelligence
              </div>

              <h2 className="max-w-xl text-5xl font-black leading-[1.05] xl:text-6xl">

                Move Better.

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Move Smarter.
                </span>

              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-500 xl:text-base">
                Analyze your exercises, understand your posture,
                and improve your movement with intelligent
                camera-based feedback.
              </p>

              {/* =================================================
                  FEATURES
              ================================================= */}

              <div className="mt-8 space-y-3">

                <Feature
                  icon={<Camera size={18} />}
                  title="Camera-Based Analysis"
                  text="Analyze body movement using your camera"
                />

                <Feature
                  icon={<Target size={18} />}
                  title="Posture Detection"
                  text="Identify incorrect body alignment"
                />

                <Feature
                  icon={<Zap size={18} />}
                  title="Real-Time Feedback"
                  text="Improve your form while exercising"
                />

              </div>

            </div>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <div className="relative z-10 flex items-center gap-2 text-xs text-slate-600">

              <CheckCircle2
                size={16}
                className="text-cyan-400"
              />

              AI-powered movement guidance

            </div>

          </div>

          {/* =====================================================
              RIGHT SIDE
          ===================================================== */}

          <div className="relative flex min-h-[650px] flex-col justify-center bg-slate-950/50 p-7 sm:p-10 md:p-14">

            {/* =================================================
                MOBILE LOGO
            ================================================= */}

            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                <Activity size={22} />
              </div>

              <div>
                <h1 className="text-xl font-black">
                  PoseCare
                </h1>

                <p className="text-[10px] text-slate-500">
                  AI Posture & Movement Coach
                </p>
              </div>

            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">

                <LockKeyhole size={14} />

                Secure Access

              </div>

              <h2 className="text-3xl font-black tracking-tight md:text-4xl">

                {showOtp
                  ? "Verify your number"
                  : "Welcome back"}

              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">

                {showOtp
                  ? "Enter the verification code sent to your mobile number."
                  : "Sign in to continue to your personalized movement dashboard."}

              </p>

            </div>

            {/* =================================================
                MOBILE FORM
            ================================================= */}

            {!showOtp ? (

              <form
                onSubmit={handleSubmit(handleMobileSubmit)}
                className="space-y-6"
              >

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-300">
                    Mobile Number
                  </label>

                  <div
                    className="
                      flex overflow-hidden rounded-2xl
                      border border-white/10
                      bg-white/[0.035]
                      transition
                      focus-within:border-cyan-400/50
                      focus-within:ring-4
                      focus-within:ring-cyan-400/5
                    "
                  >

                    {/* Country code */}

                    <div className="flex items-center gap-2 border-r border-white/10 px-4 text-slate-500">

                      <Phone size={17} />

                      <span className="text-sm font-semibold">
                        +91
                      </span>

                    </div>

                    {/* Mobile input */}

                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      {...register("mobile", {
                        required:
                          "Mobile number is required",

                        pattern: {
                          value: /^[0-9]{10}$/,

                          message:
                            "Enter a valid 10-digit mobile number",
                        },
                      })}
                      className="
                        w-full
                        bg-transparent
                        px-4
                        py-4
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-slate-700
                        [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#0b1220]
                        [&:-webkit-autofill]:[-webkit-text-fill-color:white]
                      "
                    />

                  </div>

                  {errors.mobile && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.mobile.message}
                    </p>
                  )}

                </div>

                {/* =================================================
                    CONTINUE BUTTON
                ================================================= */}

                <button
                  type="submit"
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-400
                    to-blue-500
                    py-4
                    font-bold
                    text-slate-950
                    shadow-xl
                    shadow-cyan-500/20
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-cyan-500/40
                    active:translate-y-0
                  "
                >

                  Continue

                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />

                </button>

              </form>

            ) : (

              /* =================================================
                  OTP FORM
              ================================================= */

              <form
                onSubmit={handleSubmit(handleOtpSubmit)}
                className="space-y-6"
              >

                {/* Number */}

                <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] p-5 text-center">

                  <p className="text-xs text-slate-500">
                    Verification code sent to
                  </p>

                  <p className="mt-2 font-bold text-cyan-300">
                    +91 {mobileNumber}
                  </p>

                </div>

                {/* OTP */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-300">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    {...register("otp", {
                      required: "OTP is required",

                      pattern: {
                        value: /^[0-9]{6}$/,

                        message:
                          "OTP must be 6 digits",
                      },
                    })}
                    className="
                      w-full
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.035]
                      px-4
                      py-5
                      text-center
                      text-3xl
                      font-bold
                      tracking-[0.7em]
                      text-cyan-300
                      outline-none
                      transition
                      placeholder:text-slate-700
                      focus:border-cyan-400/50
                      focus:ring-4
                      focus:ring-cyan-400/5
                    "
                  />

                  {errors.otp && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.otp.message}
                    </p>
                  )}

                </div>

                {/* Verify */}

                <button
                  type="submit"
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-400
                    to-blue-500
                    py-4
                    font-bold
                    text-slate-950
                    shadow-xl
                    shadow-cyan-500/20
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-cyan-500/40
                  "
                >

                  Start Moving

                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />

                </button>

                {/* Change number */}

                <button
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="
                    w-full
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:text-cyan-400
                  "
                >
                  ← Change Mobile Number
                </button>

              </form>

            )}

            {/* =================================================
                CAPABILITIES
            ================================================= */}

            <div className="mt-10 grid grid-cols-3 gap-2">

              <MiniFeature
                icon={<Camera size={15} />}
                text="Pose"
              />

              <MiniFeature
                icon={<Dumbbell size={15} />}
                text="Exercise"
              />

              <MiniFeature
                icon={<Activity size={15} />}
                text="Progress"
              />

            </div>

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="mt-8 border-t border-white/5 pt-6">

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">

                <ShieldCheck size={14} />

                Your information is securely protected.

              </div>

            </div>

            {/* Decorative icon */}

            <div className="absolute right-8 top-8 hidden text-cyan-400/[0.06] sm:block">

              <Activity size={80} />

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};


// ============================================================
// FEATURE
// ============================================================

const Feature = ({ icon, title, text }) => {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.045]">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400 transition group-hover:scale-110">
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {text}
        </p>

      </div>

    </div>
  );
};


// ============================================================
// MINI FEATURE
// ============================================================

const MiniFeature = ({ icon, text }) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] py-3 text-slate-600 transition hover:border-cyan-400/10 hover:text-slate-400">

      <div className="text-cyan-400">
        {icon}
      </div>

      <span className="text-[10px] font-medium">
        {text}
      </span>

    </div>
  );
};

export default Login;