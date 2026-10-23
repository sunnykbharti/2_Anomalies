import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../api/Api";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const response = await api.post("/register", {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
      });

      const token = response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }

      setStatusMessage({
        type: "success",
        text: response.data.message || "Account created successfully! Redirecting to setup...",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (error) {
      console.error("Registration error:", error);
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please verify your details.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =========================================================
          BACKGROUND AMBIENCE
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px] anim-float" />
        <div
          className="absolute -right-40 top-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px] anim-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px] anim-float"
          style={{ animationDelay: "4s" }}
        />
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
          MAIN CONTAINER
      ========================================================= */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="anim-scale-in grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:grid-cols-2">
          {/* =====================================================
              LEFT SIDE HERO
          ===================================================== */}
          <div className="relative hidden overflow-hidden p-10 lg:flex lg:min-h-[760px] lg:flex-col lg:justify-between xl:p-14">
            {/* Decorative rings */}
            <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400/10 animate-[spin_25s_linear_infinite]" />
            <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10 animate-[spin_18s_linear_infinite_reverse]" />
            <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[70px]" />

            {/* BRAND */}
            <div className="anim-fade-down relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:scale-110 hover:rotate-3">
                <Activity size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">PoseCare</h1>
                <p className="text-xs text-slate-500">AI Posture & Movement Coach</p>
              </div>
            </div>

            {/* HERO CONTENT */}
            <div className="anim-fade-up relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                <Sparkles size={14} />
                Join Next-Gen Movement Intelligence
              </div>

              <h2 className="max-w-xl text-5xl font-black leading-[1.05] xl:text-6xl">
                Start Your
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Journey Today.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 xl:text-base">
                Create your account to unlock real-time biomechanics feedback, joint alignment tracking,
                and personalized posture correction.
              </p>

              {/* FEATURES */}
              <div className="mt-8 space-y-3">
                <FeatureItem
                  icon={<Camera size={18} />}
                  title="Vision Posture Engine"
                  text="No wearable sensors required — powered entirely by your device camera"
                />
                <FeatureItem
                  icon={<ShieldCheck size={18} />}
                  title="Zero-Knowledge Biometrics"
                  text="Frames are processed in real time and never permanently archived"
                />
                <FeatureItem
                  icon={<Mail size={18} />}
                  title="Instant Verification & Email Alerts"
                  text="Secure cryptographic access with live delivery to your inbox"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={16} className="text-cyan-400" />
              Production ready with rate limiting & enterprise auth
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE FORM
          ===================================================== */}
          <div className="relative flex min-h-[720px] flex-col justify-center bg-slate-950/60 p-6 sm:p-10 md:p-12">
            {/* MOBILE LOGO */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                <Activity size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black">PoseCare</h1>
                <p className="text-[10px] text-slate-500">AI Posture & Movement Coach</p>
              </div>
            </div>

            {/* HEADER */}
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Sparkles size={13} />
                Create Free Account
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Get started with PoseCare
              </h3>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Enter your details to create your personalized posture coaching profile.
              </p>
            </div>

            {/* STATUS NOTIFICATION BANNER */}
            {statusMessage.text && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-xs leading-relaxed transition ${
                  statusMessage.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                )}
                <p className="flex-1">{statusMessage.text}</p>
              </div>
            )}

            {/* REGISTRATION FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* FULL NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                  <div className="flex items-center px-3.5 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Arjun Mehta"
                    {...register("name", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                    })}
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                  <div className="flex items-center px-3.5 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. arjun@postretrek.io"
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* MOBILE */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mobile Number
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                  <div className="flex items-center gap-1 border-r border-white/10 px-3 text-xs font-semibold text-slate-400">
                    <Phone size={14} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit number"
                    {...register("mobile", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p>
                )}
              </div>

              {/* PASSWORD & CONFIRM PASSWORD GRID */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* PASSWORD */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                    <div className="flex items-center pl-3 text-slate-400">
                      <LockKeyhole size={15} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 chars"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "At least 6 characters" },
                      })}
                      className="w-full bg-transparent px-2.5 py-3.5 text-sm text-white placeholder-slate-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Confirm
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                    <div className="flex items-center pl-3 text-slate-400">
                      <LockKeyhole size={15} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      {...register("confirmPassword", {
                        required: "Please confirm password",
                        validate: (value) =>
                          value === passwordValue || "Passwords do not match",
                      })}
                      className="w-full bg-transparent px-2.5 py-3.5 text-sm text-white placeholder-slate-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="px-3 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:shadow-cyan-500/40 disabled:opacity-50"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Account <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* SWITCH TO LOGIN */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                Sign In
              </Link>
            </div>

            {/* FOOTER BADGE */}
            <div className="mt-6 border-t border-white/5 pt-4 text-center">
              <div className="inline-flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-cyan-400" />
                Live verification code dispatched to registered mail
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureItem = ({ icon, title, text }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-3.5 transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.045]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-200">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
};

export default Register;
