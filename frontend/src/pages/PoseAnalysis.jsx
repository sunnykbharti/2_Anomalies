// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   Activity,
//   ArrowLeft,
//   Camera,
//   CheckCircle2,
//   CircleStop,
//   Clock3,
//   Dumbbell,
//   Eye,
//   Gauge,
//   Info,
//   Play,
//   RotateCcw,
//   ShieldCheck,
//   Sparkles,
//   Target,
//   Video,
//   XCircle,
//   Zap,
// } from "lucide-react";

// import api from "../api/Api";

// const PoseAnalysis = () => {
//   const navigate = useNavigate();

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const [selectedExercise, setSelectedExercise] =
//     useState("squat");

//   const [cameraActive, setCameraActive] =
//     useState(false);

//   const [analysisRunning, setAnalysisRunning] =
//     useState(false);

//   const [loading, setLoading] =
//     useState(false);

//   const [elapsedTime, setElapsedTime] =
//     useState(0);

//   const [reps, setReps] =
//     useState(0);

//   const [accuracy, setAccuracy] =
//     useState(0);

//   const [feedback, setFeedback] = useState(
//     "Position yourself in front of the camera."
//   );

//   const [feedbackType, setFeedbackType] =
//     useState("info");

//   const [bodyStatus, setBodyStatus] =
//     useState("Waiting");

//   const [sessionResult, setSessionResult] =
//     useState(null);

//   // ============================================================
//   // EXERCISES
//   // ============================================================

//   const exercises = [
//     {
//       id: "squat",
//       name: "Squat",
//       category: "Gym",
//       icon: <Dumbbell size={20} />,
//       description:
//         "Analyze knee, hip and back alignment.",
//     },

//     {
//       id: "pushup",
//       name: "Push-up",
//       category: "Strength",
//       icon: <Activity size={20} />,
//       description:
//         "Analyze body alignment and elbow position.",
//     },

//     {
//       id: "suryanamaskar",
//       name: "Surya Namaskar",
//       category: "Yoga",
//       icon: <Sparkles size={20} />,
//       description:
//         "Analyze posture throughout the movement sequence.",
//     },

//     {
//       id: "tree_pose",
//       name: "Tree Pose",
//       category: "Yoga",
//       icon: <Target size={20} />,
//       description:
//         "Analyze balance and body alignment.",
//     },

//     {
//       id: "lunges",
//       name: "Lunges",
//       category: "Gym",
//       icon: <Activity size={20} />,
//       description:
//         "Analyze knee and lower-body alignment.",
//     },

//     {
//       id: "plank",
//       name: "Plank",
//       category: "Core",
//       icon: <Gauge size={20} />,
//       description:
//         "Analyze shoulder, hip and spine alignment.",
//     },
//   ];

//   // ============================================================
//   // CAMERA
//   // ============================================================

//   const startCamera = async () => {
//     try {
//       const stream =
//         await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: 1280,
//             height: 720,
//             facingMode: "user",
//           },
//           audio: false,
//         });

//       streamRef.current = stream;

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }

//       setCameraActive(true);

//       setFeedback(
//         "Camera ready. Position your full body inside the frame."
//       );

//       setFeedbackType("success");

//     } catch (error) {
//       console.error(
//         "Camera access failed:",
//         error
//       );

//       setFeedback(
//         "Camera access was denied or unavailable."
//       );

//       setFeedbackType("error");
//     }
//   };

//   // ============================================================
//   // STOP CAMERA
//   // ============================================================

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current
//         .getTracks()
//         .forEach((track) => track.stop());

//       streamRef.current = null;
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }

//     setCameraActive(false);
//   };

//   // ============================================================
//   // START ANALYSIS
//   // ============================================================

//   const startAnalysis = async () => {
//     if (!cameraActive) {
//       setFeedback(
//         "Please start the camera first."
//       );

//       setFeedbackType("error");

//       return;
//     }

//     try {
//       setLoading(true);

//       /*
//         Flask endpoint example:

//         POST /api/pose/start

//         {
//           exercise: "squat"
//         }
//       */

//       const response = await api.post(
//         "/pose/start",
//         {
//           exercise: selectedExercise,
//         }
//       );

//       console.log(
//         "Pose analysis started:",
//         response.data
//       );

//       setAnalysisRunning(true);
//       setElapsedTime(0);
//       setReps(0);
//       setAccuracy(0);

//       setBodyStatus("Detecting");

//       setFeedback(
//         "AI analysis started. Begin your movement."
//       );

//       setFeedbackType("success");

//     } catch (error) {
//       console.error(
//         "Failed to start pose analysis:",
//         error
//       );

//       /*
//         During frontend development you can temporarily
//         comment out the API error handling if your Flask
//         endpoint is not ready yet.
//       */

//       setAnalysisRunning(true);
//       setBodyStatus("Detecting");

//       setFeedback(
//         "Analysis UI started. Backend connection can be added."
//       );

//       setFeedbackType("info");

//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // STOP ANALYSIS
//   // ============================================================

//   const stopAnalysis = async () => {
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/pose/stop",
//         {
//           exercise: selectedExercise,
//           duration: elapsedTime,
//         }
//       );

//       console.log(
//         "Session result:",
//         response.data
//       );

//       setSessionResult(
//         response.data
//       );

//     } catch (error) {
//       console.error(
//         "Failed to stop analysis:",
//         error
//       );

//       /*
//         Temporary demo result.
//         Remove this when Flask returns the real data.
//       */

//       setSessionResult({
//         exercise: selectedExercise,
//         duration: elapsedTime,
//         reps: reps,
//         accuracy: accuracy || 82,
//         feedback:
//           "Good movement. Keep your back aligned.",
//       });

//     } finally {
//       setAnalysisRunning(false);
//       setBodyStatus("Completed");
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // TIMER
//   // ============================================================

//   useEffect(() => {
//     let interval;

//     if (analysisRunning) {
//       interval = setInterval(() => {
//         setElapsedTime(
//           (previous) => previous + 1
//         );
//       }, 1000);
//     }

//     return () => clearInterval(interval);
//   }, [analysisRunning]);

//   // ============================================================
//   // CLEAN CAMERA ON PAGE EXIT
//   // ============================================================

//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current
//           .getTracks()
//           .forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   // ============================================================
//   // FORMAT TIME
//   // ============================================================

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(
//       seconds / 60
//     );

//     const remainingSeconds =
//       seconds % 60;

//     return `${String(minutes).padStart(
//       2,
//       "0"
//     )}:${String(remainingSeconds).padStart(
//       2,
//       "0"
//     )}`;
//   };

//   // ============================================================
//   // RESET
//   // ============================================================

//   const resetSession = () => {
//     setAnalysisRunning(false);
//     setElapsedTime(0);
//     setReps(0);
//     setAccuracy(0);
//     setBodyStatus("Waiting");

//     setFeedback(
//       "Position yourself in front of the camera."
//     );

//     setFeedbackType("info");

//     setSessionResult(null);
//   };

//   // ============================================================
//   // CHANGE EXERCISE
//   // ============================================================

//   const changeExercise = (exercise) => {
//     if (analysisRunning) return;

//     setSelectedExercise(exercise);

//     setSessionResult(null);

//     setFeedback(
//       "Ready for " +
//         exercises.find(
//           (item) => item.id === exercise
//         )?.name
//     );

//     setFeedbackType("info");
//   };

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

//       {/* ======================================================
//           BACKGROUND
//       ====================================================== */}

//       <div className="pointer-events-none fixed inset-0">

//         <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

//         <div className="absolute -right-40 top-[15%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

//         <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

//         <div
//           className="absolute inset-0 opacity-[0.035]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
//             backgroundSize: "60px 60px",
//           }}
//         />

//       </div>


//       {/* ======================================================
//           MAIN
//       ====================================================== */}

//       <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10">

//         {/* ====================================================
//             HEADER
//         ==================================================== */}

//         <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//           <div>

//             <button
//               onClick={() =>
//                 navigate("/dashboard")
//               }
//               className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-400"
//             >
//               <ArrowLeft size={16} />

//               Back to Dashboard
//             </button>


//             <div className="flex items-center gap-4">

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">

//                 <Activity size={24} />

//               </div>

//               <div>

//                 <h1 className="text-3xl font-black tracking-tight sm:text-4xl">

//                   Pose Analysis

//                 </h1>

//                 <p className="mt-1 text-sm text-slate-500">

//                   AI-powered posture & movement analysis

//                 </p>

//               </div>

//             </div>

//           </div>


//           {/* Status */}

//           <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3">

//             <div
//               className={`h-2.5 w-2.5 rounded-full ${
//                 analysisRunning
//                   ? "animate-pulse bg-emerald-400"
//                   : "bg-slate-600"
//               }`}
//             />

//             <div>

//               <p className="text-xs uppercase tracking-wider text-slate-600">

//                 System

//               </p>

//               <p className="text-sm font-bold text-slate-300">

//                 {analysisRunning
//                   ? "AI Analysis Active"
//                   : "Ready"}

//               </p>

//             </div>

//           </div>

//         </header>


//         {/* ====================================================
//             EXERCISE SELECTOR
//         ==================================================== */}

//         <section className="mb-6">

//           <div className="mb-4 flex items-center justify-between">

//             <div>

//               <h2 className="font-bold text-slate-200">

//                 Select Movement

//               </h2>

//               <p className="mt-1 text-xs text-slate-600">

//                 Choose the movement you want to analyze.

//               </p>

//             </div>

//             <Sparkles
//               size={18}
//               className="text-cyan-400"
//             />

//           </div>


//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

//             {exercises.map((exercise) => (

//               <button
//                 key={exercise.id}
//                 type="button"
//                 disabled={analysisRunning}
//                 onClick={() =>
//                   changeExercise(
//                     exercise.id
//                   )
//                 }
//                 className={`group rounded-2xl border p-4 text-left transition duration-300 ${
//                   selectedExercise ===
//                   exercise.id
//                     ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/5"
//                     : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
//                 } ${
//                   analysisRunning
//                     ? "cursor-not-allowed opacity-60"
//                     : ""
//                 }`}
//               >

//                 <div className="mb-3 flex items-center justify-between">

//                   <div
//                     className={`flex h-9 w-9 items-center justify-center rounded-xl ${
//                       selectedExercise ===
//                       exercise.id
//                         ? "bg-cyan-400/15 text-cyan-300"
//                         : "bg-white/[0.04] text-slate-500 group-hover:text-cyan-400"
//                     }`}
//                   >
//                     {exercise.icon}
//                   </div>

//                   {selectedExercise ===
//                     exercise.id && (
//                     <CheckCircle2
//                       size={16}
//                       className="text-cyan-400"
//                     />
//                   )}

//                 </div>

//                 <p className="text-sm font-bold text-slate-200">

//                   {exercise.name}

//                 </p>

//                 <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">

//                   {exercise.category}

//                 </p>

//               </button>

//             ))}

//           </div>

//         </section>


//         {/* ====================================================
//             ANALYSIS AREA
//         ==================================================== */}

//         <div className="grid gap-6 xl:grid-cols-[1fr_350px]">


//           {/* ==================================================
//               CAMERA
//           ================================================== */}

//           <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl">

//             {/* Camera header */}

//             <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">

//               <div>

//                 <div className="flex items-center gap-2">

//                   <Video
//                     size={18}
//                     className="text-cyan-400"
//                   />

//                   <h2 className="font-bold">

//                     Live Camera

//                   </h2>

//                 </div>

//                 <p className="mt-1 text-xs text-slate-600">

//                   {exercises.find(
//                     (item) =>
//                       item.id ===
//                       selectedExercise
//                   )?.name}

//                 </p>

//               </div>


//               <div className="flex items-center gap-2">

//                 <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">

//                   <Clock3
//                     size={15}
//                     className="text-slate-500"
//                   />

//                   <span className="font-mono text-sm text-slate-300">

//                     {formatTime(
//                       elapsedTime
//                     )}

//                   </span>

//                 </div>

//                 <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">

//                   <Activity
//                     size={15}
//                     className="text-cyan-400"
//                   />

//                   <span className="text-sm font-bold text-slate-300">

//                     {reps} reps

//                   </span>

//                 </div>

//               </div>

//             </div>


//             {/* Camera viewport */}

//             <div className="relative aspect-video min-h-[400px] overflow-hidden bg-black">

//               {/* Actual camera */}

//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className={`h-full w-full object-cover ${
//                   cameraActive
//                     ? "block"
//                     : "hidden"
//                 }`}
//               />


//               {/* Camera overlay */}

//               {cameraActive && (
//                 <>

//                   {/* Top status */}

//                   <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs backdrop-blur-md">

//                     <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

//                     LIVE

//                   </div>


//                   {/* Pose bounding guide */}

//                   <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

//                     <div className="relative h-[75%] w-[35%] min-w-[170px] max-w-[280px] rounded-[40%] border border-cyan-400/30">

//                       <div className="absolute -left-1 -top-1 h-5 w-5 border-l-2 border-t-2 border-cyan-400" />

//                       <div className="absolute -right-1 -top-1 h-5 w-5 border-r-2 border-t-2 border-cyan-400" />

//                       <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />

//                       <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />

//                     </div>

//                   </div>


//                   {/* AI indicator */}

//                   {analysisRunning && (

//                     <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 backdrop-blur-md">

//                       <Sparkles size={13} />

//                       AI ANALYZING

//                     </div>

//                   )}

//                 </>
//               )}


//               {/* Camera not active */}

//               {!cameraActive && (

//                 <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

//                   <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">

//                     <Camera size={34} />

//                   </div>

//                   <h3 className="text-xl font-bold text-slate-200">

//                     Camera is ready

//                   </h3>

//                   <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">

//                     Start your camera and stand far enough
//                     away so your complete body is visible.

//                   </p>

//                 </div>

//               )}


//               {/* Body status */}

//               {cameraActive && (

//                 <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">

//                   <p className="text-[10px] uppercase tracking-wider text-slate-500">

//                     Pose Status

//                   </p>

//                   <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-200">

//                     <span
//                       className={`h-2 w-2 rounded-full ${
//                         bodyStatus ===
//                         "Detecting"
//                           ? "bg-emerald-400"
//                           : "bg-slate-500"
//                       }`}
//                     />

//                     {bodyStatus}

//                   </p>

//                 </div>

//               )}

//             </div>


//             {/* Camera controls */}

//             <div className="flex flex-col gap-3 border-t border-white/5 p-5 sm:flex-row">

//               {!cameraActive ? (

//                 <button
//                   onClick={startCamera}
//                   className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:shadow-cyan-500/25"
//                 >

//                   <Camera size={19} />

//                   Enable Camera

//                 </button>

//               ) : !analysisRunning ? (

//                 <button
//                   onClick={startAnalysis}
//                   disabled={loading}
//                   className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 disabled:opacity-50"
//                 >

//                   <Play size={19} />

//                   {loading
//                     ? "Starting..."
//                     : "Start AI Analysis"}

//                 </button>

//               ) : (

//                 <button
//                   onClick={stopAnalysis}
//                   disabled={loading}
//                   className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-500/10 py-4 font-bold text-red-300 ring-1 ring-red-400/20 transition hover:bg-red-500/15 disabled:opacity-50"
//                 >

//                   <CircleStop size={19} />

//                   {loading
//                     ? "Finishing..."
//                     : "Stop Analysis"}

//                 </button>

//               )}


//               {cameraActive && (

//                 <button
//                   onClick={stopCamera}
//                   disabled={analysisRunning}
//                   className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-slate-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
//                 >

//                   <XCircle size={17} />

//                   Camera Off

//                 </button>

//               )}

//               <button
//                 onClick={resetSession}
//                 className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-slate-500 transition hover:text-white"
//               >

//                 <RotateCcw size={17} />

//                 Reset

//               </button>

//             </div>

//           </section>


//           {/* ==================================================
//               RIGHT PANEL
//           ================================================== */}

//           <aside className="space-y-5">


//             {/* =================================================
//                 LIVE FEEDBACK
//             ================================================= */}

//             <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

//               <div className="mb-5 flex items-center justify-between">

//                 <div className="flex items-center gap-3">

//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">

//                     <Eye size={19} />

//                   </div>

//                   <div>

//                     <h3 className="font-bold">

//                       Live Feedback

//                     </h3>

//                     <p className="text-[10px] uppercase tracking-wider text-slate-600">

//                       Posture Analysis

//                     </p>

//                   </div>

//                 </div>

//                 <Zap
//                   size={17}
//                   className="text-cyan-400"
//                 />

//               </div>


//               <div
//                 className={`rounded-2xl border p-4 ${
//                   feedbackType ===
//                   "success"
//                     ? "border-emerald-400/20 bg-emerald-400/5"
//                     : feedbackType ===
//                       "error"
//                     ? "border-red-400/20 bg-red-400/5"
//                     : "border-cyan-400/10 bg-cyan-400/5"
//                 }`}
//               >

//                 <div className="flex gap-3">

//                   {feedbackType ===
//                   "success" ? (
//                     <CheckCircle2
//                       size={18}
//                       className="mt-0.5 shrink-0 text-emerald-400"
//                     />
//                   ) : feedbackType ===
//                     "error" ? (
//                     <XCircle
//                       size={18}
//                       className="mt-0.5 shrink-0 text-red-400"
//                     />
//                   ) : (
//                     <Info
//                       size={18}
//                       className="mt-0.5 shrink-0 text-cyan-400"
//                     />
//                   )}

//                   <p className="text-sm leading-6 text-slate-300">

//                     {feedback}

//                   </p>

//                 </div>

//               </div>

//             </div>


//             {/* =================================================
//                 LIVE METRICS
//             ================================================= */}

//             <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

//               <div className="mb-5 flex items-center gap-3">

//                 <Gauge
//                   size={19}
//                   className="text-cyan-400"
//                 />

//                 <h3 className="font-bold">

//                   Session Metrics

//                 </h3>

//               </div>


//               <div className="space-y-4">

//                 <Metric
//                   label="Posture Accuracy"
//                   value={`${accuracy}%`}
//                   percentage={accuracy}
//                 />

//                 <Metric
//                   label="Repetitions"
//                   value={reps}
//                   percentage={Math.min(
//                     reps * 10,
//                     100
//                   )}
//                 />

//                 <Metric
//                   label="Session Time"
//                   value={formatTime(
//                     elapsedTime
//                   )}
//                   percentage={Math.min(
//                     elapsedTime,
//                     100
//                   )}
//                 />

//               </div>

//             </div>


//             {/* =================================================
//                 AI ANALYSIS PIPELINE
//             ================================================= */}

//             <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

//               <div className="mb-5 flex items-center gap-3">

//                 <Sparkles
//                   size={19}
//                   className="text-cyan-400"
//                 />

//                 <h3 className="font-bold">

//                   Analysis Pipeline

//                 </h3>

//               </div>


//               <PipelineItem
//                 number="01"
//                 title="Pose Detection"
//                 text="Identify body joints"
//                 active={analysisRunning}
//               />

//               <PipelineItem
//                 number="02"
//                 title="Posture Analysis"
//                 text="Check joint alignment"
//                 active={analysisRunning}
//               />

//               <PipelineItem
//                 number="03"
//                 title="Movement Tracking"
//                 text="Track exercise motion"
//                 active={analysisRunning}
//               />

//               <PipelineItem
//                 number="04"
//                 title="Feedback"
//                 text="Generate correction"
//                 active={analysisRunning}
//                 last
//               />

//             </div>


//             {/* =================================================
//                 SAFETY
//             ================================================= */}

//             <div className="rounded-[26px] border border-white/5 bg-black/10 p-5">

//               <div className="flex gap-3">

//                 <ShieldCheck
//                   size={18}
//                   className="mt-0.5 shrink-0 text-cyan-400"
//                 />

//                 <div>

//                   <p className="text-xs font-bold text-slate-400">

//                     Movement Guidance

//                   </p>

//                   <p className="mt-1 text-[11px] leading-5 text-slate-600">

//                     This system provides fitness and movement
//                     guidance. It does not diagnose medical
//                     conditions or replace a qualified
//                     physiotherapist or doctor.

//                   </p>

//                 </div>

//               </div>

//             </div>

//           </aside>

//         </div>


//         {/* ====================================================
//             SESSION SUMMARY
//         ==================================================== */}

//         {sessionResult && (

//           <section className="mt-6 overflow-hidden rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.035] p-6 backdrop-blur-xl">

//             <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

//               <div>

//                 <div className="mb-2 flex items-center gap-2 text-cyan-400">

//                   <CheckCircle2 size={19} />

//                   <span className="text-xs font-bold uppercase tracking-wider">

//                     Session Complete

//                   </span>

//                 </div>

//                 <h2 className="text-2xl font-black">

//                   {exercises.find(
//                     (item) =>
//                       item.id ===
//                       sessionResult.exercise
//                   )?.name ||
//                     "Exercise"}{" "}

//                   Analysis

//                 </h2>

//                 <p className="mt-2 text-sm text-slate-500">

//                   Your movement analysis session has
//                   been completed.

//                 </p>

//               </div>


//               <div className="grid grid-cols-3 gap-3">

//                 <SummaryStat
//                   label="Accuracy"
//                   value={`${sessionResult.accuracy || 0}%`}
//                 />

//                 <SummaryStat
//                   label="Reps"
//                   value={
//                     sessionResult.reps ||
//                     0
//                   }
//                 />

//                 <SummaryStat
//                   label="Duration"
//                   value={formatTime(
//                     sessionResult.duration ||
//                       0
//                   )}
//                 />

//               </div>

//             </div>


//             {sessionResult.feedback && (

//               <div className="mt-6 rounded-2xl border border-white/5 bg-black/10 p-4">

//                 <p className="text-xs font-bold uppercase tracking-wider text-slate-600">

//                   AI Feedback

//                 </p>

//                 <p className="mt-2 text-sm text-slate-300">

//                   {sessionResult.feedback}

//                 </p>

//               </div>

//             )}

//           </section>

//         )}


//         {/* ====================================================
//             HOW IT WORKS
//         ==================================================== */}

//         <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">

//           <div className="mb-6">

//             <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">

//               How it works

//             </p>

//             <h2 className="mt-2 text-2xl font-black">

//               From camera to correction

//             </h2>

//           </div>


//           <div className="grid gap-4 md:grid-cols-4">

//             <Step
//               number="01"
//               icon={<Camera size={20} />}
//               title="Camera"
//               text="Capture your movement in real time."
//             />

//             <Step
//               number="02"
//               icon={<Target size={20} />}
//               title="Pose Detection"
//               text="Detect joints and body key points."
//             />

//             <Step
//               number="03"
//               icon={<Activity size={20} />}
//               title="Analysis"
//               text="Compare posture and movement."
//             />

//             <Step
//               number="04"
//               icon={<Zap size={20} />}
//               title="Correction"
//               text="Receive simple real-time guidance."
//             />

//           </div>

//         </section>

//       </main>

//     </div>
//   );
// };


// // ================================================================
// // METRIC
// // ================================================================

// const Metric = ({
//   label,
//   value,
//   percentage,
// }) => {
//   return (
//     <div>

//       <div className="mb-2 flex items-center justify-between">

//         <span className="text-xs text-slate-500">

//           {label}

//         </span>

//         <span className="text-sm font-bold text-slate-200">

//           {value}

//         </span>

//       </div>

//       <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

//         <div
//           className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
//           style={{
//             width: `${percentage}%`,
//           }}
//         />

//       </div>

//     </div>
//   );
// };


// // ================================================================
// // PIPELINE ITEM
// // ================================================================

// const PipelineItem = ({
//   number,
//   title,
//   text,
//   active,
//   last,
// }) => {
//   return (
//     <div className="flex gap-3">

//       <div className="flex flex-col items-center">

//         <div
//           className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
//             active
//               ? "bg-cyan-400/10 text-cyan-400"
//               : "bg-white/[0.04] text-slate-600"
//           }`}
//         >
//           {number}
//         </div>

//         {!last && (
//           <div className="my-1 h-7 w-px bg-white/5" />
//         )}

//       </div>

//       <div className="pb-3">

//         <p className="text-xs font-bold text-slate-300">

//           {title}

//         </p>

//         <p className="mt-1 text-[10px] text-slate-600">

//           {text}

//         </p>

//       </div>

//     </div>
//   );
// };


// // ================================================================
// // SUMMARY STAT
// // ================================================================

// const SummaryStat = ({
//   label,
//   value,
// }) => {
//   return (
//     <div className="min-w-[80px] rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-center">

//       <p className="text-[9px] uppercase tracking-wider text-slate-600">

//         {label}

//       </p>

//       <p className="mt-1 text-lg font-black text-cyan-300">

//         {value}

//       </p>

//     </div>
//   );
// };


// // ================================================================
// // STEP
// // ================================================================

// const Step = ({
//   number,
//   icon,
//   title,
//   text,
// }) => {
//   return (
//     <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">

//       <div className="mb-5 flex items-center justify-between">

//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">

//           {icon}

//         </div>

//         <span className="text-xs font-bold text-slate-700">

//           {number}

//         </span>

//       </div>

//       <h3 className="font-bold text-slate-200">

//         {title}

//       </h3>

//       <p className="mt-2 text-xs leading-5 text-slate-600">

//         {text}

//       </p>

//     </div>
//   );
// };


// export default PoseAnalysis;

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  Camera,
  CheckCircle2,
  CircleStop,
  Clock3,
  Dumbbell,
  Eye,
  Gauge,
  Info,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  XCircle,
  Zap,
} from "lucide-react";

import api from "../api/Api";

// How often we send a frame to the backend for analysis (ms).
// 200ms = 5fps, a good balance of "live" feel vs backend load on CPU inference.
const ANALYSIS_INTERVAL_MS = 200;

const PoseAnalysis = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null); // hidden canvas used only to grab frames
  const captureIntervalRef = useRef(null);

  const [selectedExercise, setSelectedExercise] =
    useState("squat");

  const [cameraActive, setCameraActive] =
    useState(false);

  const [analysisRunning, setAnalysisRunning] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [elapsedTime, setElapsedTime] =
    useState(0);

  const [reps, setReps] =
    useState(0);

  const [accuracy, setAccuracy] =
    useState(0);

  const [feedback, setFeedback] = useState(
    "Position yourself in front of the camera."
  );

  const [feedbackType, setFeedbackType] =
    useState("info");

  const [bodyStatus, setBodyStatus] =
    useState("Waiting");

  const [sessionResult, setSessionResult] =
    useState(null);

  // The skeleton-annotated JPEG returned by the backend each frame.
  const [annotatedFrame, setAnnotatedFrame] =
    useState(null);

  // ============================================================
  // EXERCISES
  // ============================================================

  const exercises = [
    {
      id: "squat",
      name: "Squat",
      category: "Gym",
      icon: <Dumbbell size={20} />,
      description:
        "Analyze knee, hip and back alignment.",
    },

    {
      id: "pushup",
      name: "Push-up",
      category: "Strength",
      icon: <Activity size={20} />,
      description:
        "Analyze body alignment and elbow position.",
    },

    {
      id: "suryanamaskar",
      name: "Surya Namaskar",
      category: "Yoga",
      icon: <Sparkles size={20} />,
      description:
        "Analyze posture throughout the movement sequence.",
    },

    {
      id: "tree_pose",
      name: "Tree Pose",
      category: "Yoga",
      icon: <Target size={20} />,
      description:
        "Analyze balance and body alignment.",
    },

    {
      id: "lunges",
      name: "Lunges",
      category: "Gym",
      icon: <Activity size={20} />,
      description:
        "Analyze knee and lower-body alignment.",
    },

    {
      id: "plank",
      name: "Plank",
      category: "Core",
      icon: <Gauge size={20} />,
      description:
        "Analyze shoulder, hip and spine alignment.",
    },
  ];

  // ============================================================
  // CAMERA
  // ============================================================

  const startCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);

      setFeedback(
        "Camera ready. Position your full body inside the frame."
      );

      setFeedbackType("success");

    } catch (error) {
      console.error(
        "Camera access failed:",
        error
      );

      setFeedback(
        "Camera access was denied or unavailable."
      );

      setFeedbackType("error");
    }
  };

  // ============================================================
  // STOP CAMERA
  // ============================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // ============================================================
  // FRAME CAPTURE + ANALYSIS LOOP
  // ============================================================

  const captureAndAnalyzeFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      return;
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const response = await api.post("/pose/analyze_frame", {
        image: imageData,
        exercise: selectedExercise,
      });

      const { annotated_image, metrics } = response.data;

      setAnnotatedFrame(annotated_image);

      const totalReps = metrics.total_reps ?? 0;
      const correctReps = metrics.correct_reps ?? 0;

      setReps(totalReps);
      setAccuracy(
        totalReps > 0
          ? Math.round((correctReps / totalReps) * 100)
          : 0
      );

      if (metrics.feedback) {
        setFeedback(metrics.feedback);

        const lower = metrics.feedback.toLowerCase();
        if (lower.includes("good") || lower.includes("correct")) {
          setFeedbackType("success");
        } else if (lower.includes("move into") || lower.includes("no person")) {
          setFeedbackType("error");
        } else {
          setFeedbackType("info");
        }
      }

      setBodyStatus(
        metrics.stage
          ? metrics.stage.charAt(0).toUpperCase() + metrics.stage.slice(1)
          : "Detecting"
      );

    } catch (error) {
      console.error("Frame analysis failed:", error);
    }
  };

  // ============================================================
  // START ANALYSIS
  // ============================================================

  const startAnalysis = async () => {
    if (!cameraActive) {
      setFeedback(
        "Please start the camera first."
      );

      setFeedbackType("error");

      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/pose/analyze_frame",
        {
          exercise: selectedExercise,
        }
      );

      console.log(
        "Pose analysis started:",
        response.data
      );

      setAnalysisRunning(true);
      setElapsedTime(0);
      setReps(0);
      setAccuracy(0);

      setBodyStatus("Detecting");

      setFeedback(
        "AI analysis started. Begin your movement."
      );

      setFeedbackType("success");

      // Kick off the live capture -> analyze -> overlay loop
      captureIntervalRef.current = setInterval(
        captureAndAnalyzeFrame,
        ANALYSIS_INTERVAL_MS
      );

    } catch (error) {
      console.error(
        "Failed to start pose analysis:",
        error
      );

      /*
        During frontend development you can temporarily
        comment out the API error handling if your Flask
        endpoint is not ready yet.
      */

      setAnalysisRunning(true);
      setBodyStatus("Detecting");
      setFeedback("AI Pose Analysis active.");
      setFeedbackType("success");
      captureIntervalRef.current = setInterval(
        captureAndAnalyzeFrame,
        ANALYSIS_INTERVAL_MS
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STOP ANALYSIS
  // ============================================================

  const stopAnalysis = async () => {
    // Stop sending frames immediately, before the network round trip.
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/pose/stop",
        {
          exercise: selectedExercise,
          duration: elapsedTime,
        }
      );

      console.log(
        "Session result:",
        response.data
      );

      setSessionResult(
        response.data
      );

    } catch (error) {
      console.error(
        "Failed to stop analysis:",
        error
      );

      /*
        Temporary demo result.
        Remove this when Flask returns the real data.
      */

      setSessionResult({
        exercise: selectedExercise,
        duration: elapsedTime,
        reps: reps,
        accuracy: accuracy || 82,
        feedback:
          "Good movement. Keep your back aligned.",
      });

    } finally {
      setAnalysisRunning(false);
      setBodyStatus("Completed");
      setLoading(false);
      setAnnotatedFrame(null); // fall back to showing the raw camera again
    }
  };

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    let interval;

    if (analysisRunning) {
      interval = setInterval(() => {
        setElapsedTime(
          (previous) => previous + 1
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [analysisRunning]);

  // ============================================================
  // CLEAN CAMERA + CAPTURE LOOP ON PAGE EXIT
  // ============================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (seconds) => {
    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetSession = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    setAnalysisRunning(false);
    setElapsedTime(0);
    setReps(0);
    setAccuracy(0);
    setBodyStatus("Waiting");
    setAnnotatedFrame(null);

    setFeedback(
      "Position yourself in front of the camera."
    );

    setFeedbackType("info");

    setSessionResult(null);
  };

  // ============================================================
  // CHANGE EXERCISE
  // ============================================================

  const changeExercise = (exercise) => {
    if (analysisRunning) return;

    setSelectedExercise(exercise);

    setSessionResult(null);

    setFeedback(
      "Ready for " +
        exercises.find(
          (item) => item.id === exercise
        )?.name
    );

    setFeedbackType("info");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0">

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


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-400"
            >
              <ArrowLeft size={16} />

              Back to Dashboard
            </button>


            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">

                <Activity size={24} />

              </div>

              <div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">

                  Pose Analysis

                </h1>

                <p className="mt-1 text-sm text-slate-500">

                  AI-powered posture & movement analysis

                </p>

              </div>

            </div>

          </div>


          {/* Status */}

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3">

            <div
              className={`h-2.5 w-2.5 rounded-full ${
                analysisRunning
                  ? "animate-pulse bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />

            <div>

              <p className="text-xs uppercase tracking-wider text-slate-600">

                System

              </p>

              <p className="text-sm font-bold text-slate-300">

                {analysisRunning
                  ? "AI Analysis Active"
                  : "Ready"}

              </p>

            </div>

          </div>

        </header>


        {/* ====================================================
            EXERCISE SELECTOR
        ==================================================== */}

        <section className="mb-6">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="font-bold text-slate-200">

                Select Movement

              </h2>

              <p className="mt-1 text-xs text-slate-600">

                Choose the movement you want to analyze.

              </p>

            </div>

            <Sparkles
              size={18}
              className="text-cyan-400"
            />

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {exercises.map((exercise) => (

              <button
                key={exercise.id}
                type="button"
                disabled={analysisRunning}
                onClick={() =>
                  changeExercise(
                    exercise.id
                  )
                }
                className={`group rounded-2xl border p-4 text-left transition duration-300 ${
                  selectedExercise ===
                  exercise.id
                    ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/5"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
                } ${
                  analysisRunning
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      selectedExercise ===
                      exercise.id
                        ? "bg-cyan-400/15 text-cyan-300"
                        : "bg-white/[0.04] text-slate-500 group-hover:text-cyan-400"
                    }`}
                  >
                    {exercise.icon}
                  </div>

                  {selectedExercise ===
                    exercise.id && (
                    <CheckCircle2
                      size={16}
                      className="text-cyan-400"
                    />
                  )}

                </div>

                <p className="text-sm font-bold text-slate-200">

                  {exercise.name}

                </p>

                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">

                  {exercise.category}

                </p>

              </button>

            ))}

          </div>

        </section>


        {/* ====================================================
            ANALYSIS AREA
        ==================================================== */}

        <div className="grid gap-6 xl:grid-cols-[1fr_350px]">


          {/* ==================================================
              CAMERA
          ================================================== */}

          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl">

            {/* Camera header */}

            <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Video
                    size={18}
                    className="text-cyan-400"
                  />

                  <h2 className="font-bold">

                    Live Camera

                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-600">

                  {exercises.find(
                    (item) =>
                      item.id ===
                      selectedExercise
                  )?.name}

                </p>

              </div>


              <div className="flex items-center gap-2">

                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">

                  <Clock3
                    size={15}
                    className="text-slate-500"
                  />

                  <span className="font-mono text-sm text-slate-300">

                    {formatTime(
                      elapsedTime
                    )}

                  </span>

                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">

                  <Activity
                    size={15}
                    className="text-cyan-400"
                  />

                  <span className="text-sm font-bold text-slate-300">

                    {reps} reps

                  </span>

                </div>

              </div>

            </div>


            {/* Camera viewport */}

            <div className="relative aspect-video min-h-[400px] overflow-hidden bg-black">

              {/* Actual camera (kept running so frames can be captured from it) */}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  cameraActive
                    ? "block"
                    : "hidden"
                }`}
              />

              {/* Hidden capture canvas — never shown, just used to grab frames */}

              <canvas
                ref={canvasRef}
                style={{ display: "none" }}
              />

              {/* Skeleton-annotated frame from the backend, layered over the raw video */}

              {analysisRunning && annotatedFrame && (
                <img
                  src={annotatedFrame}
                  alt="AI pose analysis"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}


              {/* Camera overlay */}

              {cameraActive && (
                <>

                  {/* Top status */}

                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs backdrop-blur-md">

                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                    LIVE

                  </div>


                  {/* Pose bounding guide — only show before analysis starts,
                      since the backend's own skeleton overlay replaces it */}

                  {!analysisRunning && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                      <div className="relative h-[75%] w-[35%] min-w-[170px] max-w-[280px] rounded-[40%] border border-cyan-400/30">

                        <div className="absolute -left-1 -top-1 h-5 w-5 border-l-2 border-t-2 border-cyan-400" />

                        <div className="absolute -right-1 -top-1 h-5 w-5 border-r-2 border-t-2 border-cyan-400" />

                        <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />

                        <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />

                      </div>

                    </div>
                  )}


                  {/* AI indicator */}

                  {analysisRunning && (

                    <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 backdrop-blur-md">

                      <Sparkles size={13} />

                      AI ANALYZING

                    </div>

                  )}

                </>
              )}


              {/* Camera not active */}

              {!cameraActive && (

                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">

                    <Camera size={34} />

                  </div>

                  <h3 className="text-xl font-bold text-slate-200">

                    Camera is ready

                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">

                    Start your camera and stand far enough
                    away so your complete body is visible.

                  </p>

                </div>

              )}


              {/* Body status */}

              {cameraActive && (

                <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">

                    Pose Status

                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-200">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        bodyStatus ===
                        "Detecting"
                          ? "bg-emerald-400"
                          : "bg-slate-500"
                      }`}
                    />

                    {bodyStatus}

                  </p>

                </div>

              )}

            </div>


            {/* Camera controls */}

            <div className="flex flex-col gap-3 border-t border-white/5 p-5 sm:flex-row">

              {!cameraActive ? (

                <button
                  onClick={startCamera}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:shadow-cyan-500/25"
                >

                  <Camera size={19} />

                  Enable Camera

                </button>

              ) : !analysisRunning ? (

                <button
                  onClick={startAnalysis}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 disabled:opacity-50"
                >

                  <Play size={19} />

                  {loading
                    ? "Starting..."
                    : "Start AI Analysis"}

                </button>

              ) : (

                <button
                  onClick={stopAnalysis}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-500/10 py-4 font-bold text-red-300 ring-1 ring-red-400/20 transition hover:bg-red-500/15 disabled:opacity-50"
                >

                  <CircleStop size={19} />

                  {loading
                    ? "Finishing..."
                    : "Stop Analysis"}

                </button>

              )}


              {cameraActive && (

                <button
                  onClick={stopCamera}
                  disabled={analysisRunning}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-slate-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                >

                  <XCircle size={17} />

                  Camera Off

                </button>

              )}

              <button
                onClick={resetSession}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-slate-500 transition hover:text-white"
              >

                <RotateCcw size={17} />

                Reset

              </button>

            </div>

          </section>


          {/* ==================================================
              RIGHT PANEL
          ================================================== */}

          <aside className="space-y-5">


            {/* =================================================
                LIVE FEEDBACK
            ================================================= */}

            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">

                    <Eye size={19} />

                  </div>

                  <div>

                    <h3 className="font-bold">

                      Live Feedback

                    </h3>

                    <p className="text-[10px] uppercase tracking-wider text-slate-600">

                      Posture Analysis

                    </p>

                  </div>

                </div>

                <Zap
                  size={17}
                  className="text-cyan-400"
                />

              </div>


              <div
                className={`rounded-2xl border p-4 ${
                  feedbackType ===
                  "success"
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : feedbackType ===
                      "error"
                    ? "border-red-400/20 bg-red-400/5"
                    : "border-cyan-400/10 bg-cyan-400/5"
                }`}
              >

                <div className="flex gap-3">

                  {feedbackType ===
                  "success" ? (
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                  ) : feedbackType ===
                    "error" ? (
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-400"
                    />
                  ) : (
                    <Info
                      size={18}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />
                  )}

                  <p className="text-sm leading-6 text-slate-300">

                    {feedback}

                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                LIVE METRICS
            ================================================= */}

            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

              <div className="mb-5 flex items-center gap-3">

                <Gauge
                  size={19}
                  className="text-cyan-400"
                />

                <h3 className="font-bold">

                  Session Metrics

                </h3>

              </div>


              <div className="space-y-4">

                <Metric
                  label="Posture Accuracy"
                  value={`${accuracy}%`}
                  percentage={accuracy}
                />

                <Metric
                  label="Repetitions"
                  value={reps}
                  percentage={Math.min(
                    reps * 10,
                    100
                  )}
                />

                <Metric
                  label="Session Time"
                  value={formatTime(
                    elapsedTime
                  )}
                  percentage={Math.min(
                    elapsedTime,
                    100
                  )}
                />

              </div>

            </div>


            {/* =================================================
                AI ANALYSIS PIPELINE
            ================================================= */}

            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

              <div className="mb-5 flex items-center gap-3">

                <Sparkles
                  size={19}
                  className="text-cyan-400"
                />

                <h3 className="font-bold">

                  Analysis Pipeline

                </h3>

              </div>


              <PipelineItem
                number="01"
                title="Pose Detection"
                text="Identify body joints"
                active={analysisRunning}
              />

              <PipelineItem
                number="02"
                title="Posture Analysis"
                text="Check joint alignment"
                active={analysisRunning}
              />

              <PipelineItem
                number="03"
                title="Movement Tracking"
                text="Track exercise motion"
                active={analysisRunning}
              />

              <PipelineItem
                number="04"
                title="Feedback"
                text="Generate correction"
                active={analysisRunning}
                last
              />

            </div>


            {/* =================================================
                SAFETY
            ================================================= */}

            <div className="rounded-[26px] border border-white/5 bg-black/10 p-5">

              <div className="flex gap-3">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-cyan-400"
                />

                <div>

                  <p className="text-xs font-bold text-slate-400">

                    Movement Guidance

                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-600">

                    This system provides fitness and movement
                    guidance. It does not diagnose medical
                    conditions or replace a qualified
                    physiotherapist or doctor.

                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* ====================================================
            SESSION SUMMARY
        ==================================================== */}

        {sessionResult && (

          <section className="mt-6 overflow-hidden rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.035] p-6 backdrop-blur-xl">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2 text-cyan-400">

                  <CheckCircle2 size={19} />

                  <span className="text-xs font-bold uppercase tracking-wider">

                    Session Complete

                  </span>

                </div>

                <h2 className="text-2xl font-black">

                  {exercises.find(
                    (item) =>
                      item.id ===
                      sessionResult.exercise
                  )?.name ||
                    "Exercise"}{" "}

                  Analysis

                </h2>

                <p className="mt-2 text-sm text-slate-500">

                  Your movement analysis session has
                  been completed.

                </p>

              </div>


              <div className="grid grid-cols-3 gap-3">

                <SummaryStat
                  label="Accuracy"
                  value={`${sessionResult.accuracy || 0}%`}
                />

                <SummaryStat
                  label="Reps"
                  value={
                    sessionResult.reps ||
                    0
                  }
                />

                <SummaryStat
                  label="Duration"
                  value={formatTime(
                    sessionResult.duration ||
                      0
                  )}
                />

              </div>

            </div>


            {sessionResult.feedback && (

              <div className="mt-6 rounded-2xl border border-white/5 bg-black/10 p-4">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">

                  AI Feedback

                </p>

                <p className="mt-2 text-sm text-slate-300">

                  {sessionResult.feedback}

                </p>

              </div>

            )}

          </section>

        )}


        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">

          <div className="mb-6">

            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">

              How it works

            </p>

            <h2 className="mt-2 text-2xl font-black">

              From camera to correction

            </h2>

          </div>


          <div className="grid gap-4 md:grid-cols-4">

            <Step
              number="01"
              icon={<Camera size={20} />}
              title="Camera"
              text="Capture your movement in real time."
            />

            <Step
              number="02"
              icon={<Target size={20} />}
              title="Pose Detection"
              text="Detect joints and body key points."
            />

            <Step
              number="03"
              icon={<Activity size={20} />}
              title="Analysis"
              text="Compare posture and movement."
            />

            <Step
              number="04"
              icon={<Zap size={20} />}
              title="Correction"
              text="Receive simple real-time guidance."
            />

          </div>

        </section>

      </main>

    </div>
  );
};


// ================================================================
// METRIC
// ================================================================

const Metric = ({
  label,
  value,
  percentage,
}) => {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs text-slate-500">

          {label}

        </span>

        <span className="text-sm font-bold text-slate-200">

          {value}

        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
};


// ================================================================
// PIPELINE ITEM
// ================================================================

const PipelineItem = ({
  number,
  title,
  text,
  active,
  last,
}) => {
  return (
    <div className="flex gap-3">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
            active
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-white/[0.04] text-slate-600"
          }`}
        >
          {number}
        </div>

        {!last && (
          <div className="my-1 h-7 w-px bg-white/5" />
        )}

      </div>

      <div className="pb-3">

        <p className="text-xs font-bold text-slate-300">

          {title}

        </p>

        <p className="mt-1 text-[10px] text-slate-600">

          {text}

        </p>

      </div>

    </div>
  );
};


// ================================================================
// SUMMARY STAT
// ================================================================

const SummaryStat = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-[80px] rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-center">

      <p className="text-[9px] uppercase tracking-wider text-slate-600">

        {label}

      </p>

      <p className="mt-1 text-lg font-black text-cyan-300">

        {value}

      </p>

    </div>
  );
};


// ================================================================
// STEP
// ================================================================

const Step = ({
  number,
  icon,
  title,
  text,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">

      <div className="mb-5 flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">

          {icon}

        </div>

        <span className="text-xs font-bold text-slate-700">

          {number}

        </span>

      </div>

      <h3 className="font-bold text-slate-200">

        {title}

      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-600">

        {text}

      </p>

    </div>
  );
};


export default PoseAnalysis;