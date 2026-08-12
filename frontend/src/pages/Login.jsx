import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Brain,
  Camera,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import api from "../api/Api";

const Login = () => {
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  // =========================
  // SEND OTP
  // =========================

  const handleMobileSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await api.post("/login", {
        mobile: data.mobile,
      });

      console.log(response.data);

      setShowOtp(true);

      alert("OTP sent successfully");
    } catch (error) {
      console.error("OTP sending failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleOtpSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await api.post("/login", {
        mobile: getValues("mobile"),
        otp: data.otp,
      });

      console.log(response.data);

      // JWT
      const token = response.data.access_token;

      // Store JWT
      localStorage.setItem("token", token);

      alert("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("OTP verification failed:", error);

      alert(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* ================================================= */}
      {/* BACKGROUND GLOW */}
      {/* ================================================= */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-[-10%] top-[10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="absolute bottom-[-20%] left-[35%] h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />

      </div>


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">


          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="hidden lg:block">

            {/* Badge */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur-xl">

              <Sparkles size={16} />

              AI Powered Movement Intelligence

            </div>


            {/* Heading */}

            <h1 className="text-6xl font-black leading-tight">

              Train Smarter.

              <br />

              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Move Better.
              </span>

            </h1>


            {/* Description */}

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

              Use AI-powered pose detection to analyze your movements,
              track exercises and improve your performance in real time.

            </p>


            {/* Features */}

            <div className="mt-10 grid grid-cols-2 gap-4">

              <Feature
                icon={<Camera size={20} />}
                title="Pose Detection"
                text="AI analyzes your body movement."
              />

              <Feature
                icon={<Brain size={20} />}
                title="Smart Analysis"
                text="Get intelligent movement feedback."
              />

              <Feature
                icon={<Activity size={20} />}
                title="Live Tracking"
                text="Monitor your exercises in real time."
              />

              <Feature
                icon={<ShieldCheck size={20} />}
                title="Private & Secure"
                text="Your fitness data stays protected."
              />

            </div>


            {/* AI Orb */}

            <div className="relative mt-12 flex h-32 w-32 items-center justify-center">

              <div className="absolute h-32 w-32 animate-pulse rounded-full bg-cyan-400/10 blur-2xl" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-white/10 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl">

                <Brain
                  size={34}
                  className="text-cyan-400"
                />

              </div>

              {/* orbit */}

              <div className="absolute h-28 w-28 rounded-full border border-cyan-400/20" />

              <div className="absolute h-36 w-36 rounded-full border border-blue-400/10" />

            </div>

          </div>


          {/* ================================================= */}
          {/* LOGIN CARD */}
          {/* ================================================= */}

          <div className="relative mx-auto w-full max-w-md">

            {/* Card Glow */}

            <div className="absolute inset-0 rounded-[32px] bg-cyan-500/10 blur-3xl" />


            {/* 3D Card */}

            <div
              className="
                relative
                rounded-[32px]
                border border-white/10
                bg-white/[0.07]
                p-8
                shadow-2xl
                shadow-cyan-500/10
                backdrop-blur-2xl
                transition
                duration-500
                hover:-translate-y-1
                hover:border-cyan-400/20
              "
            >

              {/* Top Icon */}

              <div className="mb-8 flex justify-center">

                <div className="relative">

                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 blur-xl" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">

                    {showOtp ? (
                      <ShieldCheck
                        size={30}
                        className="text-cyan-400"
                      />
                    ) : (
                      <Zap
                        size={30}
                        className="text-cyan-400"
                      />
                    )}

                  </div>

                </div>

              </div>


              {/* Heading */}

              <div className="mb-8 text-center">

                <h2 className="text-3xl font-bold">

                  {showOtp
                    ? "Verify Your Identity"
                    : "Welcome Back"}

                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">

                  {showOtp
                    ? "Enter the verification code sent to your mobile."
                    : "Sign in to unlock your AI movement experience."}

                </p>

              </div>


              {/* ================================================= */}
              {/* MOBILE FORM */}
              {/* ================================================= */}

              {!showOtp ? (

                <form
                  onSubmit={handleSubmit(handleMobileSubmit)}
                  className="space-y-5"
                >

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Mobile Number
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5 transition focus-within:border-cyan-400/50">

                      <div className="flex items-center border-r border-white/10 px-4 text-sm text-slate-400">
                        +91
                      </div>

                      <input
                        type="tel"
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
                          py-3.5
                          text-white
                          outline-none
                          placeholder:text-slate-600
                        "
                      />

                    </div>

                    {errors.mobile && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.mobile.message}
                      </p>
                    )}

                  </div>


                  {/* Button */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-400
                      to-blue-500
                      py-3.5
                      font-bold
                      text-slate-950
                      shadow-lg
                      shadow-cyan-500/20
                      transition
                      hover:scale-[1.02]
                      hover:shadow-cyan-500/40
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading
                      ? "Sending..."
                      : "Continue"}

                    {!loading && (
                      <ArrowRight
                        size={19}
                        className="transition group-hover:translate-x-1"
                      />
                    )}

                  </button>

                </form>

              ) : (

                /* ================================================= */
                /* OTP FORM */
                /* ================================================= */

                <form
                  onSubmit={handleSubmit(handleOtpSubmit)}
                  className="space-y-5"
                >

                  {/* Mobile */}

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Verification code sent to
                    </p>

                    <p className="mt-1 font-semibold text-cyan-400">
                      +91 {getValues("mobile")}
                    </p>

                  </div>


                  {/* OTP */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Enter OTP
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      {...register("otp", {
                        required:
                          "OTP is required",

                        pattern: {
                          value: /^[0-9]{6}$/,

                          message:
                            "OTP must be exactly 6 digits",
                        },
                      })}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-4
                        py-4
                        text-center
                        text-2xl
                        font-bold
                        tracking-[0.6em]
                        text-cyan-400
                        outline-none
                        transition
                        placeholder:text-slate-700
                        focus:border-cyan-400/50
                        focus:ring-2
                        focus:ring-cyan-400/10
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
                    disabled={loading}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-400
                      to-blue-500
                      py-3.5
                      font-bold
                      text-slate-950
                      shadow-lg
                      shadow-cyan-500/20
                      transition
                      hover:scale-[1.02]
                      hover:shadow-cyan-500/40
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading
                      ? "Verifying..."
                      : "Verify & Enter"}

                    {!loading && (
                      <ArrowRight
                        size={19}
                        className="transition group-hover:translate-x-1"
                      />
                    )}

                  </button>


                  {/* Change Number */}

                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="
                      w-full
                      text-sm
                      text-slate-500
                      transition
                      hover:text-cyan-400
                    "
                  >
                    ← Change mobile number
                  </button>

                </form>

              )}


              {/* Footer */}

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

                <ShieldCheck size={14} />

                Secure JWT Authentication

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


/* ================================================= */
/* FEATURE CARD */
/* ================================================= */

const Feature = ({ icon, title, text }) => {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        p-4
        backdrop-blur-xl
        transition
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/30
        hover:bg-white/[0.07]
      "
    >

      <div className="mb-3 inline-flex rounded-xl bg-cyan-400/10 p-2.5 text-cyan-400 transition group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
};


export default Login;