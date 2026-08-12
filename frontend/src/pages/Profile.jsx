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
  Sparkles,
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

  // ============================================================
  // GET USER PROFILE FROM BACKEND
  // ============================================================

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

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!formData.age) {
      newErrors.age = "Please enter your age";
    } else if (
      Number(formData.age) < 10 ||
      Number(formData.age) > 100
    ) {
      newErrors.age = "Enter a valid age";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.height) {
      newErrors.height = "Please enter your height";
    }

    if (!formData.weight) {
      newErrors.weight = "Please enter your weight";
    }

    if (!formData.fitnessGoal) {
      newErrors.fitnessGoal = "Please select your goal";
    }

    if (!formData.activityLevel) {
      newErrors.activityLevel = "Please select your activity level";
    }

    if (!formData.experience) {
      newErrors.experience = "Please select your experience level";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // SAVE PROFILE TO BACKEND
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

      // Only keep onboarding state locally.
      sessionStorage.setItem("profileCompleted", "true");

      alert("Profile saved successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Profile save failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

          <p className="text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute -right-40 top-[15%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-10">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">

            <Sparkles size={14} />

            Personal Setup

          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

            Let's build your

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">

              movement profile.

            </span>

          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">

            Tell us a little about yourself so your exercise
            experience can be tailored to your goals and
            activity level.

          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl">

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="border-b border-white/5 p-6 sm:p-8 lg:p-10">

              <SectionHeader
                icon={<User size={20} />}
                title="Personal Information"
                text="Basic information about you"
              />

              <div className="mt-8 grid gap-6 md:grid-cols-2">

                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  icon={<User size={18} />}
                  error={errors.name}
                />

                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  icon={<CalendarDays size={18} />}
                  error={errors.age}
                />

                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  icon={<User size={18} />}
                  error={errors.gender}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                    "Prefer not to say",
                  ]}
                />

                <InputField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  icon={<Ruler size={18} />}
                  error={errors.height}
                />

                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  icon={<Weight size={18} />}
                  error={errors.weight}
                />

              </div>

            </section>

            {/* ==================================================
                FITNESS GOAL
            ================================================== */}

            <section className="border-b border-white/5 p-6 sm:p-8 lg:p-10">

              <SectionHeader
                icon={<Target size={20} />}
                title="Fitness Goal"
                text="What do you want to achieve?"
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <GoalCard
                  icon={<Dumbbell size={22} />}
                  title="Build Strength"
                  selected={formData.fitnessGoal === "strength"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      fitnessGoal: "strength",
                    }))
                  }
                />

                <GoalCard
                  icon={<Activity size={22} />}
                  title="Improve Fitness"
                  selected={formData.fitnessGoal === "fitness"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      fitnessGoal: "fitness",
                    }))
                  }
                />

                <GoalCard
                  icon={<HeartPulse size={22} />}
                  title="Stay Healthy"
                  selected={formData.fitnessGoal === "health"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      fitnessGoal: "health",
                    }))
                  }
                />

                <GoalCard
                  icon={<Target size={22} />}
                  title="Improve Posture"
                  selected={formData.fitnessGoal === "posture"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      fitnessGoal: "posture",
                    }))
                  }
                />

              </div>

              {errors.fitnessGoal && (
                <p className="mt-3 text-sm text-red-400">
                  {errors.fitnessGoal}
                </p>
              )}

            </section>

            {/* ==================================================
                ACTIVITY
            ================================================== */}

            <section className="border-b border-white/5 p-6 sm:p-8 lg:p-10">

              <SectionHeader
                icon={<Activity size={20} />}
                title="Activity Level"
                text="Tell us about your current routine"
              />

              <div className="mt-8 grid gap-4 md:grid-cols-3">

                <RadioCard
                  title="Low"
                  description="Little or no regular exercise"
                  selected={formData.activityLevel === "low"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      activityLevel: "low",
                    }))
                  }
                />

                <RadioCard
                  title="Moderate"
                  description="Exercise 2–4 times per week"
                  selected={formData.activityLevel === "moderate"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      activityLevel: "moderate",
                    }))
                  }
                />

                <RadioCard
                  title="High"
                  description="Exercise 5+ times per week"
                  selected={formData.activityLevel === "high"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      activityLevel: "high",
                    }))
                  }
                />

              </div>

              {errors.activityLevel && (
                <p className="mt-3 text-sm text-red-400">
                  {errors.activityLevel}
                </p>
              )}

            </section>

            {/* ==================================================
                EXPERIENCE
            ================================================== */}

            <section className="p-6 sm:p-8 lg:p-10">

              <SectionHeader
                icon={<Dumbbell size={20} />}
                title="Exercise Experience"
                text="Choose the level that best describes you"
              />

              <div className="mt-8 grid gap-4 md:grid-cols-3">

                <RadioCard
                  title="Beginner"
                  description="I'm just getting started"
                  selected={formData.experience === "beginner"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experience: "beginner",
                    }))
                  }
                />

                <RadioCard
                  title="Intermediate"
                  description="I exercise regularly"
                  selected={formData.experience === "intermediate"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experience: "intermediate",
                    }))
                  }
                />

                <RadioCard
                  title="Advanced"
                  description="I have extensive experience"
                  selected={formData.experience === "advanced"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experience: "advanced",
                    }))
                  }
                />

              </div>

              {errors.experience && (
                <p className="mt-3 text-sm text-red-400">
                  {errors.experience}
                </p>
              )}

            </section>

            {/* ==================================================
                SAVE
            ================================================== */}

            <div className="flex flex-col gap-5 border-t border-white/5 bg-black/10 p-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-cyan-400"
                />

                <p className="max-w-md text-xs leading-5 text-slate-600">
                  Your profile is securely stored on the server
                  and associated with your authenticated account.
                </p>

              </div>

              <button
                type="submit"
                disabled={saving}
                className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? "Saving..." : "Save & Continue"}

                {!saving && (
                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />
                )}

              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
};


// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({ icon, title, text }) => {
  return (
    <div className="flex items-center gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">
        {icon}
      </div>

      <div>

        <h2 className="text-lg font-bold text-slate-200">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          {text}
        </p>

      </div>

    </div>
  );
};


// ============================================================
// INPUT FIELD
// ============================================================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
}) => {
  return (
    <div>

      <label className="mb-3 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <div
        className={`flex overflow-hidden rounded-2xl border bg-white/[0.035] transition focus-within:ring-4 ${
          error
            ? "border-red-400/40 focus-within:ring-red-400/5"
            : "border-white/10 focus-within:border-cyan-400/40 focus-within:ring-cyan-400/5"
        }`}
      >

        <div className="flex items-center border-r border-white/10 px-4 text-slate-600">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-700"
        />

      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  );
};


// ============================================================
// SELECT FIELD
// ============================================================

const SelectField = ({
  label,
  name,
  value,
  onChange,
  icon,
  options,
  error,
}) => {
  return (
    <div>

      <label className="mb-3 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <div
        className={`relative flex overflow-hidden rounded-2xl border bg-white/[0.035] transition focus-within:ring-4 ${
          error
            ? "border-red-400/40"
            : "border-white/10 focus-within:border-cyan-400/40 focus-within:ring-cyan-400/5"
        }`}
      >

        <div className="flex items-center border-r border-white/10 px-4 text-slate-600">
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none bg-transparent px-4 py-4 pr-10 text-sm text-white outline-none"
        >

          <option value="" className="bg-slate-900">
            Select
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-slate-900"
            >
              {option}
            </option>
          ))}

        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
        />

      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  );
};


// ============================================================
// GOAL CARD
// ============================================================

const GoalCard = ({
  icon,
  title,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-2xl border p-5 text-left transition duration-300 ${
        selected
          ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/5"
          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
      }`}
    >

      {selected && (
        <CheckCircle2
          size={17}
          className="absolute right-4 top-4 text-cyan-400"
        />
      )}

      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition ${
          selected
            ? "bg-cyan-400/15 text-cyan-300"
            : "bg-white/[0.04] text-slate-500 group-hover:text-cyan-400"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`font-bold ${
          selected ? "text-cyan-200" : "text-slate-300"
        }`}
      >
        {title}
      </h3>

    </button>
  );
};


// ============================================================
// RADIO CARD
// ============================================================

const RadioCard = ({
  title,
  description,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition duration-300 ${
        selected
          ? "border-cyan-400/40 bg-cyan-400/10"
          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
      }`}
    >

      <div
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-cyan-400"
            : "border-slate-600"
        }`}
      >

        {selected && (
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
        )}

      </div>

      <div>

        <h3
          className={`font-bold ${
            selected ? "text-cyan-200" : "text-slate-300"
          }`}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {description}
        </p>

      </div>

    </button>
  );
};

export default Profile;