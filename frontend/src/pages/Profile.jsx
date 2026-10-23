import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  CalendarDays,
  Ruler,
  Weight,
  Target,
  Activity,
  Dumbbell,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

import api from "../api/Api";

const Profile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    activityLevel: "",
    experience: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await api.get("/profile");
        console.log("Profile from backend:", response.data);
        const user = response.data.user || response.data;
        setFormData({
          name: user.name || "",
          age: user.age || "",
          gender: user.gender || "",
          height: user.height || "",
          weight: user.weight || "",
          fitnessGoal: user.fitnessGoal || "",
          activityLevel: user.activityLevel || "",
          experience: user.experience || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.age) {
      newErrors.age = "Please enter your age";
    } else if (Number(formData.age) < 10 || Number(formData.age) > 100) {
      newErrors.age = "Enter a valid age";
    }
    if (!formData.gender) newErrors.gender = "Please select your gender";
    if (!formData.height) newErrors.height = "Please enter your height";
    if (!formData.weight) newErrors.weight = "Please enter your weight";
    if (!formData.fitnessGoal) newErrors.fitnessGoal = "Please select your goal";
    if (!formData.activityLevel) newErrors.activityLevel = "Please select your activity level";
    if (!formData.experience) newErrors.experience = "Please select your experience level";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSaving(true);
      const response = await api.put("/profile", {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        fitnessGoal: formData.fitnessGoal,
        activityLevel: formData.activityLevel,
        experience: formData.experience,
      });
      console.log("Profile saved:", response.data);
      sessionStorage.setItem("profileCompleted", "true");
      alert("Profile saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile save failed:", error);
      alert(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-cyan-400" size={36} />
      </div>
    );
  }

  const avatarLetter = formData.name ? formData.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-40 top-[15%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Profile</h1>
          <p className="mt-1.5 text-sm text-slate-400">Configure your fitness preferences</p>
        </div>

        {/* ── Two-column layout ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* Left — Identity card */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
              {/* Avatar */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-black text-slate-950">
                {avatarLetter}
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">
                {formData.name || "Your Name"}
              </h2>
              {formData.weight && formData.height && (
                <p className="mt-1 text-xs text-slate-500">
                  {formData.height} cm · {formData.weight} kg
                </p>
              )}
              {/* Role badge */}
              <span className="mt-3 inline-block rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-semibold text-cyan-400">
                {formData.experience ? formData.experience.charAt(0).toUpperCase() + formData.experience.slice(1) : "Member"}
              </span>
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Info</p>
              {formData.age && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Age</span>
                  <span className="font-semibold">{formData.age}</span>
                </div>
              )}
              {formData.gender && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold">{formData.gender}</span>
                </div>
              )}
              {formData.fitnessGoal && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Goal</span>
                  <span className="font-semibold capitalize">{formData.fitnessGoal}</span>
                </div>
              )}
              {formData.activityLevel && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Activity</span>
                  <span className="font-semibold capitalize">{formData.activityLevel}</span>
                </div>
              )}
            </div>
          </aside>

          {/* Right — Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Personal Information ─────────────────────── */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <SectionHeader icon={<User size={18} />} title="Personal Information" text="Basic information about you" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  icon={<User size={16} />}
                  error={errors.name}
                />
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  icon={<CalendarDays size={16} />}
                  error={errors.age}
                />
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  icon={<User size={16} />}
                  error={errors.gender}
                  options={["Male", "Female", "Other", "Prefer not to say"]}
                />
                <InputField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  icon={<Ruler size={16} />}
                  error={errors.height}
                />
                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  icon={<Weight size={16} />}
                  error={errors.weight}
                />
              </div>
            </section>

            {/* ── Fitness Goal ─────────────────────────────── */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <SectionHeader icon={<Target size={18} />} title="Fitness Goal" text="What do you want to achieve?" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <GoalCard
                  icon={<Dumbbell size={20} />}
                  title="Build Strength"
                  selected={formData.fitnessGoal === "strength"}
                  onClick={() => setFormData((p) => ({ ...p, fitnessGoal: "strength" }))}
                />
                <GoalCard
                  icon={<Activity size={20} />}
                  title="Improve Fitness"
                  selected={formData.fitnessGoal === "fitness"}
                  onClick={() => setFormData((p) => ({ ...p, fitnessGoal: "fitness" }))}
                />
                <GoalCard
                  icon={<HeartPulse size={20} />}
                  title="Stay Healthy"
                  selected={formData.fitnessGoal === "health"}
                  onClick={() => setFormData((p) => ({ ...p, fitnessGoal: "health" }))}
                />
                <GoalCard
                  icon={<Target size={20} />}
                  title="Improve Posture"
                  selected={formData.fitnessGoal === "posture"}
                  onClick={() => setFormData((p) => ({ ...p, fitnessGoal: "posture" }))}
                />
              </div>
              {errors.fitnessGoal && <p className="mt-2 text-xs text-red-400">{errors.fitnessGoal}</p>}
            </section>

            {/* ── Activity Level ───────────────────────────── */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <SectionHeader icon={<Activity size={18} />} title="Activity Level" text="Tell us about your current routine" />
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <RadioCard
                  title="Low"
                  description="Little or no regular exercise"
                  selected={formData.activityLevel === "low"}
                  onClick={() => setFormData((p) => ({ ...p, activityLevel: "low" }))}
                />
                <RadioCard
                  title="Moderate"
                  description="Exercise 2–4 times per week"
                  selected={formData.activityLevel === "moderate"}
                  onClick={() => setFormData((p) => ({ ...p, activityLevel: "moderate" }))}
                />
                <RadioCard
                  title="High"
                  description="Exercise 5+ times per week"
                  selected={formData.activityLevel === "high"}
                  onClick={() => setFormData((p) => ({ ...p, activityLevel: "high" }))}
                />
              </div>
              {errors.activityLevel && <p className="mt-2 text-xs text-red-400">{errors.activityLevel}</p>}
            </section>

            {/* ── Experience ───────────────────────────────── */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <SectionHeader icon={<Dumbbell size={18} />} title="Exercise Experience" text="Choose the level that best describes you" />
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <RadioCard
                  title="Beginner"
                  description="I'm just getting started"
                  selected={formData.experience === "beginner"}
                  onClick={() => setFormData((p) => ({ ...p, experience: "beginner" }))}
                />
                <RadioCard
                  title="Intermediate"
                  description="I exercise regularly"
                  selected={formData.experience === "intermediate"}
                  onClick={() => setFormData((p) => ({ ...p, experience: "intermediate" }))}
                />
                <RadioCard
                  title="Advanced"
                  description="I have extensive experience"
                  selected={formData.experience === "advanced"}
                  onClick={() => setFormData((p) => ({ ...p, experience: "advanced" }))}
                />
              </div>
              {errors.experience && <p className="mt-2 text-xs text-red-400">{errors.experience}</p>}
            </section>

            {/* ── Save ─────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="shrink-0 text-cyan-400" />
                  <p className="text-xs text-slate-500">
                    Your profile is securely stored and associated with your account.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

/* ── Section Header ─────────────────────────────────────────────── */

const SectionHeader = ({ icon, title, text }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-bold text-slate-200">{title}</h2>
      <p className="text-xs text-slate-500">{text}</p>
    </div>
  </div>
);

/* ── Input Field ────────────────────────────────────────────────── */

const InputField = ({ label, name, type = "text", value, onChange, placeholder, icon, error }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
    <div
      className={`flex overflow-hidden rounded-xl border bg-white/[0.03] transition focus-within:ring-2 ${
        error
          ? "border-red-400/40 focus-within:ring-red-400/5"
          : "border-white/[0.08] focus-within:border-cyan-400/30 focus-within:ring-cyan-400/5"
      }`}
    >
      <div className="flex items-center border-r border-white/[0.06] px-3 text-slate-600">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-700"
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

/* ── Select Field ───────────────────────────────────────────────── */

const SelectField = ({ label, name, value, onChange, icon, options, error }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
    <div
      className={`relative flex overflow-hidden rounded-xl border bg-white/[0.03] transition focus-within:ring-2 ${
        error
          ? "border-red-400/40"
          : "border-white/[0.08] focus-within:border-cyan-400/30 focus-within:ring-cyan-400/5"
      }`}
    >
      <div className="flex items-center border-r border-white/[0.06] px-3 text-slate-600">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-transparent px-3 py-3 pr-8 text-sm text-white outline-none"
      >
        <option value="" className="bg-slate-900">Select</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-900">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

/* ── Goal Card ──────────────────────────────────────────────────── */

const GoalCard = ({ icon, title, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative rounded-xl border p-4 text-left transition duration-200 ${
      selected
        ? "border-cyan-400/30 bg-cyan-400/10"
        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
    }`}
  >
    {selected && <CheckCircle2 size={14} className="absolute right-3 top-3 text-cyan-400" />}
    <div
      className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
        selected ? "bg-cyan-400/15 text-cyan-300" : "bg-white/[0.04] text-slate-500"
      }`}
    >
      {icon}
    </div>
    <h3 className={`text-sm font-bold ${selected ? "text-cyan-200" : "text-slate-300"}`}>
      {title}
    </h3>
  </button>
);

/* ── Radio Card ─────────────────────────────────────────────────── */

const RadioCard = ({ title, description, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition duration-200 ${
      selected
        ? "border-cyan-400/30 bg-cyan-400/10"
        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
    }`}
  >
    <div
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-cyan-400" : "border-slate-600"
      }`}
    >
      {selected && <div className="h-2 w-2 rounded-full bg-cyan-400" />}
    </div>
    <div>
      <h3 className={`text-sm font-bold ${selected ? "text-cyan-200" : "text-slate-300"}`}>{title}</h3>
      <p className="mt-0.5 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  </button>
);

export default Profile;
