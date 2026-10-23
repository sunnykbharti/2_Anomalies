import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Camera,
  CircleStop,
  Play,
} from "lucide-react";

import api from "../api/Api";

// ── constants ────────────────────────────────────────────────────────────────
const CAPTURE_INTERVAL_MS = 200; // ~5 fps

const EMOTION_META = {
  happy:    { emoji: "😊", label: "Happy",    color: "text-yellow-400",  bar: "bg-yellow-400" },
  neutral:  { emoji: "😐", label: "Neutral",  color: "text-slate-300",   bar: "bg-slate-400"  },
  surprise: { emoji: "😲", label: "Surprise", color: "text-cyan-400",    bar: "bg-cyan-400"   },
  sad:      { emoji: "😢", label: "Sad",      color: "text-blue-400",    bar: "bg-blue-400"   },
  angry:    { emoji: "😠", label: "Angry",    color: "text-red-400",     bar: "bg-red-400"    },
  fear:     { emoji: "😨", label: "Fear",     color: "text-purple-400",  bar: "bg-purple-400" },
  disgust:  { emoji: "🤢", label: "Disgust",  color: "text-green-400",   bar: "bg-green-400"  },
};

// Ordered display list for the score bars
const EMOTION_ORDER = ["happy", "neutral", "surprise", "sad", "angry", "fear", "disgust"];

// ── component ────────────────────────────────────────────────────────────────
const EmotionDetection = () => {
  const navigate = useNavigate();

  const videoRef           = useRef(null);
  const streamRef          = useRef(null);
  const canvasRef          = useRef(null);
  const captureIntervalRef = useRef(null);

  const [cameraActive,   setCameraActive]   = useState(false);
  const [isRunning,      setIsRunning]      = useState(false);
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [emotion,        setEmotion]        = useState("neutral");
  const [scores,         setScores]         = useState({});
  const [faceDetected,   setFaceDetected]   = useState(false);

  // ── camera ─────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Camera access was denied or unavailable.");
    }
  };

  const stopCamera = () => {
    stopDetection();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setAnnotatedFrame(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── detection loop ──────────────────────────────────────────────────────────
  const captureAndSend = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const { data } = await api.post("/emotion/analyze_frame", { image: imageData });
      setAnnotatedFrame(data.annotated_image);
      setFaceDetected(data.face_detected);
      if (data.face_detected) {
        setEmotion(data.emotion || "neutral");
        setScores(data.scores || {});
      }
    } catch {
      // silently skip failed frames
    }
  };

  const startDetection = () => {
    if (!cameraActive) { alert("Please start the camera first."); return; }
    setIsRunning(true);
    captureIntervalRef.current = setInterval(captureAndSend, CAPTURE_INTERVAL_MS);
  };

  const stopDetection = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setIsRunning(false);
  };

  // ── derived UI values ───────────────────────────────────────────────────────
  const dominantMeta = EMOTION_META[emotion] || EMOTION_META.neutral;
  const topScore     = scores[emotion] != null ? scores[emotion].toFixed(1) : "—";

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ── background glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute -right-40 top-[20%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">

        {/* ── header ── */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
          >
            <Activity size={20} className="text-cyan-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              😊 Emotion <span className="text-cyan-400">Detection</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Real-time facial expression analysis using DeepFace
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── left: camera feed ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Video / annotated frame */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl aspect-video flex items-center justify-center">
              {annotatedFrame && isRunning ? (
                <img
                  src={annotatedFrame}
                  alt="Annotated webcam feed"
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Camera size={48} />
                  <p className="text-sm">Start the camera to begin</p>
                </div>
              )}

              {/* No-face overlay */}
              {isRunning && !faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-6 py-3 text-center">
                    <p className="text-lg font-semibold text-yellow-400">No face detected</p>
                    <p className="text-xs text-yellow-400/70">Position your face in the centre of the frame</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Camera size={18} /> Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-400/20"
                >
                  <CircleStop size={18} /> Stop Camera
                </button>
              )}

              {cameraActive && !isRunning && (
                <button
                  onClick={startDetection}
                  className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-400"
                >
                  <Play size={18} /> Start Detection
                </button>
              )}

              {isRunning && (
                <button
                  onClick={stopDetection}
                  className="flex items-center gap-2 rounded-xl border border-slate-400/30 bg-slate-800 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  <CircleStop size={18} /> Stop Detection
                </button>
              )}
            </div>

          </div>

          {/* ── right: emotion panel ── */}
          <div className="space-y-4">

            {/* Dominant emotion badge */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center backdrop-blur-xl">
              <div className="text-7xl mb-3" role="img" aria-label={dominantMeta.label}>
                {dominantMeta.emoji}
              </div>
              <p className={`text-2xl font-bold ${dominantMeta.color}`}>
                {dominantMeta.label}
              </p>
              {faceDetected && (
                <p className="mt-1 text-sm text-slate-400">
                  Confidence: <span className="font-semibold text-white">{topScore}%</span>
                </p>
              )}
              {!faceDetected && isRunning && (
                <p className="mt-2 text-xs text-yellow-400/80">Waiting for face…</p>
              )}
              {!isRunning && (
                <p className="mt-2 text-xs text-slate-500">Detection not running</p>
              )}
            </div>

            {/* Score bars */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Expression Scores
              </p>
              <div className="space-y-3">
                {EMOTION_ORDER.map((em) => {
                  const meta  = EMOTION_META[em];
                  const score = scores[em] ?? 0;
                  return (
                    <div key={em}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${meta.bar}`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
              <p className="text-xs leading-relaxed text-yellow-400/80">
                ⚠️ These scores are estimates of visible facial-expression patterns.
                They cannot reliably determine a person's internal emotional state
                and should not be used for clinical or diagnostic purposes.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetection;
