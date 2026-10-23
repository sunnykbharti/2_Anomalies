import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Dumbbell,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
  KeyRound,
  RotateCcw,
  AlertCircle,
  Clock,
} from "lucide-react";

import api from "../api/Api";

const Login = () => {
  const [authMode, setAuthMode] = useState("otp"); // 'otp' | 'password'
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Handle resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ============================================================
  // SEND OTP
  // ============================================================
  const handleSendOtp = async (data) => {
    setLoading(true);
    setStatusMessage({ type: "", text: "" });
    try {
      const response = await api.post("/login", {
        identifier: data.identifier,
        mobile: data.identifier,
      });

      setIdentifier(data.identifier);
      setMaskedEmail(response.data.email_masked || "your registered email");
      setShowOtpInput(true);
      setAttemptsLeft(null);
      setIsLocked(false);
      setResendCooldown(60); // 60s cooldown
      setStatusMessage({
        type: "success",
        text: response.data.message || "OTP generated and sent to your email successfully!",
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP.";
      setStatusMessage({ type: "error", text: msg });
      if (error.response?.status === 429) {
        setIsLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setStatusMessage({ type: "", text: "" });
    try {
      const response = await api.post("/login/resend-otp", {
        identifier: identifier,
        mobile: identifier,
      });
      setResendCooldown(60);
      setStatusMessage({
        type: "success",
        text: `Fresh verification code sent to ${response.data.email_masked || maskedEmail}!`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to resend verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================
  const handleVerifyOtp = async (data) => {
    setLoading(true);
    setStatusMessage({ type: "", text: "" });
    try {
      const response = await api.post("/login", {
        identifier: identifier,
        mobile: identifier,
        otp: data.otp,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setStatusMessage({ type: "success", text: "Verification successful! Redirecting..." });

      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (error) {
      const respData = error.response?.data || {};
      const msg = respData.message || "Invalid OTP code.";
      setStatusMessage({ type: "error", text: msg });

      if (respData.attempts_left !== undefined) {
        setAttemptsLeft(respData.attempts_left);
      }
      if (error.response?.status === 429 || respData.locked) {
        setIsLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASSWORD LOGIN
  // ============================================================
  const handlePasswordLogin = async (data) => {
    setLoading(true);
    setStatusMessage({ type: "", text: "" });
    try {
      const response = await api.post("/login/password", {
        identifier: data.passwordIdentifier,
        password: data.password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setStatusMessage({ type: "success", text: "Login successful! Redirecting..." });

      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (error) {
      const respData = error.response?.data || {};
      const msg = respData.message || "Authentication failed.";
      setStatusMessage({ type: "error", text: msg });

      if (respData.attempts_left !== undefined) {
        setAttemptsLeft(respData.attempts_left);
      }
      if (error.response?.status === 429 || respData.locked) {
        setIsLocked(true);
      }
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
          <div className="relative hidden overflow-hidden p-10 lg:flex lg:min-h-[720px] lg:flex-col lg:justify-between xl:p-14">
            {/* Decorative rings */}
            <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400/10 animate-[spin_25s_linear_infinite]" />
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10 animate-[spin_18s_linear_infinite_reverse]" />
            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[70px]" />

            {/* BRAND */}
            <div className="anim-fade-down relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:scale-110 hover:rotate-3">
                <Activity size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">PoseCare</h1>
                <p className="text-xs text-slate-500">Production AI Posture & Movement Coach</p>
              </div>
            </div>

            {/* HERO CONTENT */}
            <div className="anim-fade-up relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                <Sparkles size={14} />
                Hardened Security & Live OTP
              </div>

              <h2 className="max-w-xl text-5xl font-black leading-[1.05] xl:text-6xl">
                Move Better.
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Move Smarter.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 xl:text-base">
                Real-time posture intelligence with cryptographic authentication, rate-limiting
                defense, and direct email OTP delivery.
              </p>

              {/* FEATURES */}
              <div className="mt-8 space-y-3">
                <Feature
                  icon={<Camera size={18} />}
                  title="Camera-Based Analysis"
                  text="Real-time joint tracking and motion trajectory"
                />
                <Feature
                  icon={<ShieldCheck size={18} />}
                  title="Brute-Force Lockout Defense"
                  text="Automatic account protection against password attacks"
                />
                <Feature
                  icon={<Mail size={18} />}
                  title="Live Email OTP Verification"
                  text="Real-time one-time password dispatched to your inbox"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={16} className="text-cyan-400" />
              Production hardened with Flask-Limiter & SMTP Mail
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE FORM
          ===================================================== */}
          <div className="relative flex min-h-[680px] flex-col justify-center bg-slate-950/60 p-6 sm:p-10 md:p-12">
            {/* MOBILE LOGO */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                <Activity size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black">PoseCare</h1>
                <p className="text-[10px] text-slate-500">AI Posture & Movement Coach</p>
              </div>
            </div>

            {/* MODE SWITCHER TABS */}
            <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setShowOtpInput(false);
                  setStatusMessage({ type: "", text: "" });
                  setAttemptsLeft(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition duration-200 ${
                  authMode === "otp"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail size={14} />
                OTP via Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setShowOtpInput(false);
                  setStatusMessage({ type: "", text: "" });
                  setAttemptsLeft(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition duration-200 ${
                  authMode === "password"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <KeyRound size={14} />
                Password Login
              </button>
            </div>

            {/* STATUS / ERROR BANNER */}
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
                <div className="flex-1">
                  <p>{statusMessage.text}</p>
                  {attemptsLeft !== null && attemptsLeft > 0 && (
                    <p className="mt-1 font-semibold text-yellow-300">
                      ⚠️ Caution: {attemptsLeft} attempts remaining before 15-minute account lockout.
                    </p>
                  )}
                  {isLocked && (
                    <p className="mt-1 font-semibold text-red-400">
                      🔒 Account locked. Try again later or reset password.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                TAB 1: OTP AUTHENTICATION
            ================================================= */}
            {authMode === "otp" && !showOtpInput && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Sign in with OTP
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
                    Enter your registered mobile number or email. A live 6-digit OTP will be
                    generated and sent to your email.
                  </p>
                </div>

                <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Mobile Number or Email
                    </label>
                    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                      <div className="flex items-center gap-1.5 border-r border-white/10 px-3.5 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210 or arjun@postretrek.io"
                        {...register("identifier", {
                          required: "Mobile number or email is required",
                        })}
                        className="w-full bg-transparent px-4 py-4 text-sm text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="mt-2 text-xs text-red-400">{errors.identifier.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:shadow-cyan-500/40 disabled:opacity-50"
                  >
                    {loading ? (
                      "Generating & Sending Code..."
                    ) : (
                      <>
                        Send Live OTP Code <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-[11px] text-slate-500">
                    💡 Demo accounts: <span className="font-mono text-cyan-400">9876543210</span> (Arjun) or <span className="font-mono text-cyan-400">9876543211</span> (Priya)
                  </div>
                </form>
              </div>
            )}

            {/* OTP VERIFICATION STEP */}
            {authMode === "otp" && showOtpInput && (
              <div className="anim-scale-in">
                <div className="mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Verify Your Code
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
                    Enter the 6-digit one-time password dispatched to{" "}
                    <span className="font-semibold text-cyan-300">{maskedEmail}</span>.
                  </p>
                </div>

                <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-5">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-center">
                    <p className="text-[11px] text-slate-400">Target Identifier</p>
                    <p className="mt-1 font-mono text-base font-bold text-cyan-300">{identifier}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="••••••"
                      {...register("otp", {
                        required: "6-digit OTP is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "OTP must be exactly 6 digits",
                        },
                      })}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 text-center text-3xl font-bold tracking-[0.6em] text-cyan-300 placeholder-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    {errors.otp && (
                      <p className="mt-2 text-xs text-red-400">{errors.otp.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:shadow-cyan-500/40 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Access Account"}
                  </button>

                  {/* RESEND & BACK */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowOtpInput(false)}
                      className="text-slate-500 hover:text-slate-300 transition"
                    >
                      ← Change Identifier
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className={`inline-flex items-center gap-1.5 font-semibold transition ${
                        resendCooldown > 0
                          ? "cursor-not-allowed text-slate-600"
                          : "text-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      <RotateCcw size={13} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP Code"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =================================================
                TAB 2: PASSWORD AUTHENTICATION (Brute-Force Protected)
            ================================================= */}
            {authMode === "password" && (
              <div>
                <div className="mb-6">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                    <LockKeyhole size={12} />
                    5-Attempt Lockout Defense Active
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Password Access
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
                    Enter your registered credentials. Multiple failed attempts will lock your account for 15 minutes.
                  </p>
                </div>

                <form onSubmit={handleSubmit(handlePasswordLogin)} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Mobile Number or Email
                    </label>
                    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                      <div className="flex items-center gap-1.5 border-r border-white/10 px-3.5 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210 or arjun@postretrek.io"
                        {...register("passwordIdentifier", {
                          required: "Identifier is required",
                        })}
                        className="w-full bg-transparent px-4 py-4 text-sm text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                    {errors.passwordIdentifier && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.passwordIdentifier.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Account Password
                    </label>
                    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                      <div className="flex items-center gap-1.5 border-r border-white/10 px-3.5 text-slate-400">
                        <LockKeyhole size={16} />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        {...register("password", {
                          required: "Password is required",
                        })}
                        className="w-full bg-transparent px-4 py-4 text-sm text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:shadow-cyan-500/40 disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Sign In with Password"}
                  </button>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-[11px] text-slate-500">
                    💡 Demo password: <span className="font-mono text-cyan-400">PostureTrek@2026</span>
                  </div>
                </form>
              </div>
            )}

            {/* SWITCH TO REGISTER */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                Create Account
              </Link>
            </div>

            {/* SECURITY BADGE */}
            <div className="mt-8 border-t border-white/5 pt-5 text-center">
              <div className="inline-flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-cyan-400" />
                Protected by Flask-Limiter, PBKDF2/SHA-256 Hashing & SMTP TLS
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================
// FEATURE COMPONENT
// ============================================================
const Feature = ({ icon, title, text }) => {
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

export default Login;