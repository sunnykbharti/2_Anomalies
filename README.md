# PoseCare AI Fitness — Real-Time Pose, Posture & Emotion Analysis Platform

> AI-powered exercise form correction, posture monitoring, and facial emotion detection using YOLO pose estimation and DeepFace, with real-time Hinglish voice coaching and session analytics.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-black)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![YOLO](https://img.shields.io/badge/Ultralytics-YOLO11--Pose-purple)](https://docs.ultralytics.com/)
[![DeepFace](https://img.shields.io/badge/DeepFace-Emotion--Detection-orange)](https://github.com/serengil/deepface)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Supported Exercises & Poses](#supported-exercises--poses)
- [Emotion Detection](#emotion-detection)
- [API Reference](#api-reference)
- [AI Insight Engine](#ai-insight-engine)
- [Demo Accounts](#demo-accounts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**PoseCare** is a full-stack web application that turns any webcam into a real-time exercise coach, posture monitor, and emotion detector.

- **Pose & Exercise Analysis** — Uses **YOLO11-Pose** to extract 17 body keypoints frame-by-frame, runs them through exercise-specific biomechanical rule engines (angle thresholds, alignment checks, state machines), and returns live rep counts, form scores, and corrective feedback — spoken aloud in **Hinglish** via the Web Speech API.

- **Facial Emotion Detection** — Uses **DeepFace** with an OpenCV Haar-cascade face detector to recognise the 7 basic facial expressions (happy, sad, angry, surprise, fear, disgust, neutral) from a live webcam feed, with confidence scores and 5-frame smoothing to prevent flickering.

A three-tier AI insight layer (local Ollama LLM → Gemini API → deterministic rule-based fallback) generates natural-language coaching tips and post-session reports, so the app degrades gracefully even with no internet connection or API key.

---

## Features

- 🎥 **Live webcam pose analysis** — frames captured client-side and streamed to the backend at ~5 fps
- 🏋️ **8 exercise / posture modes** — Squat, Push-up, Lunges, Plank, Surya Namaskar, Yoga Poses (Tree, Tadasana, Warrior II, Triangle, Downward Dog, Cobra), Desk Posture, General Posture
- 🔁 **Automatic rep counting** with per-rep correctness tracking and error tagging (e.g. `knee_valgus`, `sagging_hips`, `shallow_depth`)
- 😊 **Real-time facial emotion detection** — 7 basic emotions with confidence scores, emoji indicators, and face bounding-box overlay
- 🗣️ **Hinglish voice coaching** via Web Speech API with smart cooldown throttling
- 🤖 **3-tier AI feedback engine** — Ollama (local) → Gemini API (cloud) → deterministic fallback — for both live micro-feedback and full post-session summaries
- 📊 **Session analytics** — dashboard summary, weekly activity chart, session history, and global leaderboard
- 🔐 **JWT-based authentication** with phone OTP login
- 🌐 **RESTful API** with a clean Flask blueprint architecture
- 💾 **SQLite database** (swappable for PostgreSQL / MySQL) with auto-seed demo data on first run

---

## Tech Stack

### Backend

| Library | Purpose |
|---|---|
| **Flask** | Web framework |
| **Flask-SQLAlchemy** | ORM / database |
| **Flask-JWT-Extended** | JWT authentication |
| **Flask-CORS** | Cross-origin resource sharing |
| **Flask-Caching** | Response caching |
| **Ultralytics YOLO11-Pose** | Real-time 17-keypoint body pose estimation |
| **DeepFace** | Facial emotion recognition (7 emotions) |
| **OpenCV (`cv2`)** | Frame decode / encode / Haar-cascade face detection |
| **NumPy** | Numerical array operations, joint angle geometry |
| **Ollama (`qwen2.5:latest`)** | Local LLM for live coaching and session summaries |
| **Google Gemini API** | Cloud AI fallback provider |
| **SQLite** | Default database (auto-created on first run) |
| **Gunicorn** | WSGI production server |

### Frontend

| Library | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **Tailwind CSS 4** | Utility-first styling |
| **Lucide React** | Icon set |
| **Three.js + React Three Fiber** | 3D visualisations |
| **Web Speech API** | Browser TTS for Hinglish voice coaching |

---

## Architecture

```text
┌──────────────────────────────────┐
│        React Frontend (Vite)      │
│                                   │
│  getUserMedia() → webcam stream   │
│  Canvas frame capture (~5 fps)    │
│  Base64 JPEG encoding             │
│  Web Speech TTS (Hinglish)        │
└──────────────┬───────────────────┘
               │  POST /api/pose/analyze_frame
               │  POST /api/emotion/analyze_frame
               ▼
   ┌──────────────────────────┐
   │    Flask API Server      │
   │  (port 5000, CORS on)    │
   └────┬─────────────────────┘
        │
   ┌────┴────────────────────────────────────────┐
   │              Analysis Pipelines              │
   │                                              │
   │  POSE PIPELINE                               │
   │  ┌──────────────────────────────────────┐   │
   │  │ Base64 → JPEG decode (cv2)           │   │
   │  │ YOLO11-Pose inference (17 keypoints) │   │
   │  │ Exercise analyzer (state machine)    │   │
   │  │ Skeleton annotation (.plot())        │   │
   │  │ JPEG → Base64 re-encode              │   │
   │  └──────────────────────────────────────┘   │
   │                                              │
   │  EMOTION PIPELINE                            │
   │  ┌──────────────────────────────────────┐   │
   │  │ Base64 → JPEG decode (cv2)           │   │
   │  │ Haar-cascade face detection          │   │
   │  │ DeepFace.analyze (emotion only)      │   │
   │  │ 5-frame rolling score smoothing      │   │
   │  │ Face bounding-box annotation         │   │
   │  │ JPEG → Base64 re-encode              │   │
   │  └──────────────────────────────────────┘   │
   └────┬────────────────────────────────────────┘
        │
   ┌────┴────────────────────────────────┐
   │  AI Insight Engine (Background)     │
   │  Ollama → Gemini → Local Fallback   │
   └────┬────────────────────────────────┘
        │
   ┌────▼────────────────────────────────┐
   │         SQLite Database             │
   │  users · movement_sessions          │
   │  movement_rep_logs                  │
   └─────────────────────────────────────┘
```

---

## Project Structure

```text
.
├── backend/
│   ├── app.py                        # Flask entry point — config, extensions, blueprints
│   ├── models.py                     # SQLAlchemy ORM (User, MovementSession, MovementRepLog)
│   ├── ai_summarizer.py              # 3-tier AI coaching engine (Ollama → Gemini → Fallback)
│   ├── seed.py                       # Auto-seeds demo users + sessions on first run
│   ├── requirements.txt              # Python dependencies
│   ├── instance/
│   │   └── postretrek.sqlite         # SQLite database file (auto-created)
│   ├── routes/
│   │   ├── auth.py                   # POST /api/login · GET /api/me
│   │   ├── movement.py               # /api/pose/* — frame analysis, session start/stop
│   │   ├── emotion.py                # /api/emotion/* — facial emotion detection (planned)
│   │   ├── dashboard.py              # /api/dashboard/* — stats, weekly chart
│   │   └── sessions.py               # /api/sessions/* — session history + delete
│   ├── analyzers/
│   │   ├── squat_analyzer.py         # Squat rep counting + form errors
│   │   ├── pushup_analyzer.py        # Push-up form analysis
│   │   ├── lunge_analyzer.py         # Lunge tracking
│   │   ├── plank_analyzer.py         # Plank hold duration + stability
│   │   ├── posture_analyzer.py       # General posture monitoring
│   │   ├── desk_posture_analyzer.py  # Desk / study posture
│   │   ├── surya_namaskar_analyzer.py# Yoga sun-salutation sequence
│   │   ├── yoga_pose_analyzer.py     # Individual yoga poses
│   │   └── emotion_analyzer.py       # DeepFace emotion analysis (planned)
│   └── yolo11n-pose.pt               # YOLO11 nano pose model weights
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── Router.jsx                # All client-side routes
│       ├── index.css                 # Global styles (Tailwind)
│       ├── api/
│       │   └── Api.jsx               # Axios client (baseURL: http://127.0.0.1:5000/api)
│       ├── components/
│       │   └── Navbar.jsx            # Top navigation bar
│       ├── layouts/
│       │   └── HomeLayout.jsx        # Shell layout (Navbar + <Outlet />)
│       └── pages/
│           ├── Home.jsx              # Landing page
│           ├── Login.jsx             # Phone OTP login
│           ├── Dashboard.jsx         # Stats + weekly chart + recent sessions
│           ├── PoseAnalysis.jsx      # Main exercise webcam + analysis UI
│           ├── EmotionDetection.jsx  # Facial emotion detector (planned)
│           ├── Sessions.jsx          # Full session history list
│           ├── Progress.jsx          # Accuracy progress charts
│           ├── Exercises.jsx         # Exercise catalogue
│           ├── Leaderboard.jsx       # Global user rankings
│           └── Profile.jsx           # User settings
│
├── model/                            # Standalone reference / prototype scripts
│   ├── facial_expression_analyzer.py # Standalone DeepFace emotion demo (desktop)
│   ├── posture.py
│   ├── pushup_analyzer.py
│   ├── squat_analyzer.py
│   ├── surya_namaskar_analyzer.py
│   ├── yoga_pose_analyzer.py
│   └── test_pose.py
│
├── docs/
│   └── documentation.md             # Additional project documentation
│
├── yolo11n-pose.pt                   # Root copy of YOLO model weights
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Webcam-enabled browser — Chrome or Edge recommended
- *(Optional)* [Ollama](https://ollama.com/) with `qwen2.5:latest` for local AI coaching
- *(Optional)* Google Gemini API key for cloud AI fallback

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. (For emotion detection) Install DeepFace
pip install deepface tf-keras

# 5. Start the Flask server
python app.py
```

The API will be available at `http://localhost:5000`.

On first start, the database is auto-created and seeded with five demo users and realistic workout sessions.

### Frontend Setup

```bash
# From the project root
cd frontend

npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Database — defaults to SQLite if not set
SQLALCHEMY_DATABASE_URI=sqlite:///instance/postretrek.sqlite

# Security — change these before any public deployment
SECRET_KEY=change-me-in-production
JWT_SECRET_KEY=change-me-in-production

# AI Providers (both optional — app works without them)
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=qwen2.5:latest
GEMINI_API_KEY=your-gemini-api-key-here
```

> ⚠️ **Security:** Never commit `SECRET_KEY`, `JWT_SECRET_KEY`, or API keys to version control.

---

## Supported Exercises & Poses

| Mode | Type | Key Biomechanical Checks | Detected Errors |
|---|---|---|---|
| **Squat** | Rep-based | Knee angle depth, knee alignment | `knee_valgus`, `shallow_depth`, `forward_lean` |
| **Push-up** | Rep-based | Elbow angle, body straightness | `sagging_hips`, `flared_elbows`, `incomplete_range` |
| **Lunges** | Rep-based | Front knee angle (90°), torso lean | `knee_past_toe`, `torso_lean`, `unstable_landing` |
| **Plank** | Hold-based | Hip/shoulder straightness, hold time | `hip_drop`, `shoulder_shrug`, `head_drop` |
| **Surya Namaskar** | Sequence-based | Pose transition accuracy | Per-pose validation |
| **Yoga Poses** | Hold-based | Tree, Tadasana, Warrior II, Triangle, Downward Dog, Cobra | Per-pose alignment |
| **Desk Posture** | Continuous | Screen distance, neck tilt, slouching | `slouch`, `forward_neck`, `screen_too_close` |
| **General Posture** | Continuous | Torso lean, shoulder balance, head-forward drift | `rounded_shoulders`, `forward_neck`, `uneven_hips` |

Each analyzer implements:
1. **YOLO11-Pose inference** on the incoming frame to extract 17 COCO keypoints
2. **Angle calculation** using 3-point joint geometry (e.g. hip–knee–ankle)
3. **5-frame rolling average** smoothing via a `deque` to reduce jitter
4. **State machine** transitions (e.g. `standing` ↔ `squatting`) for rep detection
5. **Error detection** against biomechanical thresholds
6. **Per-rep logging** — stores correctness, errors, and deepest joint angle

---

## Emotion Detection

The `/emotion-detection` page provides a standalone real-time facial expression analyser:

| Emotion | Emoji | Description |
|---|---|---|
| happy | 😊 | Positive, smiling expression |
| sad | 😢 | Downturned mouth, low brow |
| angry | 😠 | Furrowed brow, tight jaw |
| surprise | 😲 | Raised brows, open mouth |
| fear | 😨 | Tense, wide-eyed expression |
| disgust | 🤢 | Wrinkled nose, curled lip |
| neutral | 😐 | Relaxed, no dominant expression |

**How it works:**

1. Webcam frames are captured by the browser (~5 fps) and sent as base64 JPEG to `POST /api/emotion/analyze_frame`.
2. The backend detects a face using OpenCV's Haar-cascade classifier.
3. The cropped face region is passed to **DeepFace** (`detector_backend="skip"`, `actions=["emotion"]`).
4. Raw scores are smoothed over a 5-frame rolling window to eliminate flickering.
5. The annotated frame (with face bounding box and emotion label), the dominant emotion, and all 7 confidence scores are returned to the frontend.
6. The page displays the annotated image, a large emoji badge, and a confidence bar for each of the 7 emotions.

> **Disclaimer:** Emotion scores are estimates of visible facial-expression patterns. They cannot reliably determine a person's internal emotional state and should not be used for clinical, legal, or diagnostic purposes.

---

## API Reference

All endpoints use the `/api` prefix. JWT is optional unless noted.

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/login` | `{mobile}` | Step 1 — request OTP for a registered phone number |
| `POST` | `/api/login` | `{mobile, otp}` | Step 2 — verify OTP and receive JWT token |
| `GET` | `/api/me` | — | Get current user profile *(JWT required)* |
| `GET` | `/api/health` | — | Server health check |

### Pose Analysis

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/pose/start` | `{exercise}` | Begin a new exercise session |
| `POST` | `/api/pose/analyze_frame` | `{image}` | Submit a base64 JPEG frame → returns annotated frame + metrics + AI feedback |
| `POST` | `/api/pose/live_ai_summary` | `{exercise, metrics}` | On-demand AI coaching summary for the active session |
| `POST` | `/api/pose/stop` | `{exercise, duration}` | End session, save to DB, return AI report |
| `GET` | `/api/pose/session/<id>` | — | Fetch single session details |
| `GET` | `/api/pose/leaderboard` | `?period=daily\|weekly\|monthly\|all_time` | Global leaderboard |

**`analyze_frame` response shape:**
```json
{
  "annotated_image": "data:image/jpeg;base64,...",
  "metrics": {
    "stage": "squatting",
    "total_reps": 5,
    "correct_reps": 4,
    "incorrect_reps": 1,
    "accuracy": 80.0,
    "feedback": "Knees thoda bahar rakho!",
    "issues": ["knee_valgus"]
  },
  "ai_live_summary": {
    "summary": "...",
    "coaching_tip": "...",
    "live_speech": "...",
    "form_quality": "Needs Attention"
  }
}
```

### Emotion Detection

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/emotion/analyze_frame` | `{image}` | Submit a base64 JPEG frame → returns annotated frame + emotion scores |

**`analyze_frame` response shape:**
```json
{
  "annotated_image": "data:image/jpeg;base64,...",
  "emotion": "happy",
  "scores": {
    "happy": 87.3,
    "neutral": 6.1,
    "surprise": 3.2,
    "sad": 1.5,
    "angry": 0.9,
    "fear": 0.6,
    "disgust": 0.4
  },
  "face_detected": true
}
```

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Total sessions, reps, avg accuracy, exercise breakdown |
| `GET` | `/api/dashboard/recent_sessions` | 5 most recent sessions |
| `GET` | `/api/dashboard/weekly` | Rep counts grouped by day-of-week (Mon–Sun) |

### Sessions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sessions` | All sessions, most recent first |
| `GET` | `/api/sessions/<id>` | Single session detail |
| `DELETE` | `/api/sessions/<id>` | Delete a session and its rep logs |

---

## AI Insight Engine

[`backend/ai_summarizer.py`](backend/ai_summarizer.py) implements a resilient three-tier feedback pipeline:

```text
Frame metrics + rep history
        │
        ▼
1. Ollama (local LLM — qwen2.5:latest)
        │ fails or unavailable
        ▼
2. Google Gemini API (cloud)
        │ fails or no API key
        ▼
3. Deterministic rule-based fallback
   (works offline, zero latency)
```

**Key design decisions:**
- **Background threading** — Ollama calls run in a daemon thread to avoid blocking webcam frame returns.
- **Result caching** — AI output is cached per exercise type and reused across frames; invalidated when accuracy shifts by >15 percentage points.
- **`form_quality` override** — Always recomputed from live accuracy + detected issues, never from a potentially stale AI-generated string.
- **Hinglish prompting** — Prompts instruct the model to respond in natural Hinglish (mixed Hindi–English), matching how Indian gym trainers actually speak.

---

## Demo Accounts

The database is seeded automatically on first run with five demo users. Use any of the following phone numbers with OTP `123456`:

| Name | Phone |
|---|---|
| Arjun Mehta | `9876543210` |
| Priya Kapoor | `9876543211` |
| Dev Sharma | `9876543212` |
| Neha Singh | `9876543213` |
| Rohan Verma | `9876543214` |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | — |
| `name` | String | — |
| `phone` | String (unique) | Primary login key |
| `email` | String (unique, nullable) | — |
| `role` | String | `user` or `admin` |
| `preferred_language` | String | `en`, `hi`, etc. |
| `total_sessions` / `total_reps` / `avg_accuracy` | Aggregates | Cached, updated after each session via `update_stats()` |

### `movement_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | — |
| `user_id` | FK → users | Nullable (guest sessions) |
| `exercise_type` | String | e.g. `squat`, `plank`, `tree_pose` |
| `started_at` / `ended_at` | DateTime | — |
| `total_reps` / `correct_reps` / `incorrect_reps` | Integer | — |
| `accuracy` | Float | 0–100% |
| `ai_summary` | Text | Full post-session AI report |

### `movement_rep_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | — |
| `session_id` | FK → movement_sessions | — |
| `rep_number` | Integer | — |
| `correct` | Boolean | — |
| `errors` | String | Comma-separated error labels |
| `min_angle` | Float | Deepest joint angle reached in this rep |

---

## Roadmap

- [x] Real-time YOLO11-Pose exercise analysis (~5 fps)
- [x] 8 exercise / posture modes with rep counting and form error tagging
- [x] 3-tier AI coaching engine (Ollama → Gemini → local fallback)
- [x] Hinglish voice coaching via Web Speech API
- [x] JWT phone-OTP authentication
- [x] Session persistence, dashboard, and leaderboard
- [ ] Facial emotion detection page (`/emotion-detection`) ← **in progress**
- [ ] WebSocket-based frame streaming (lower latency)
- [ ] Multi-person pose detection
- [ ] Exportable PDF session reports
- [ ] SMS OTP gateway integration (Twilio / Fast2SMS)
- [ ] Mobile-responsive camera capture
- [ ] Unit tests for analyzer state machines
- [ ] Personalised AI workout recommendations
- [ ] Long-term posture trend analysis

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with clear, descriptive messages.
4. Open a pull request describing what changed and how it was tested.

---

## License

This project is licensed under the **MIT License**.

---

## Acknowledgements

- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics) — YOLO11-Pose model for real-time keypoint detection
- [DeepFace](https://github.com/serengil/deepface) — Facial expression recognition
- [Ollama](https://ollama.com/) — Local LLM inference
- [Google Gemini](https://ai.google.dev/) — Cloud AI fallback
- [OpenCV](https://opencv.org/) — Computer vision and frame processing

---

**Author:** Sunny Bharti — [GitHub](https://github.com/sunnykbharti)
