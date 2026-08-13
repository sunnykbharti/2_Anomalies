# PoseCare AI Fitness — Real-Time Pose & Posture Analysis Platform

> AI-powered exercise form correction and posture monitoring using YOLO pose estimation, with real-time Hinglish voice coaching and session analytics.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-black)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](https://react.dev/)
[![YOLO](https://img.shields.io/badge/Ultralytics-YOLO11--Pose-purple)](https://docs.ultralytics.com/)
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
- [API Reference](#api-reference)
- [AI Insight Engine](#ai-insight-engine)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**PoseCare** is a full-stack web application that turns any webcam into a real-time exercise and posture coach. It uses **YOLO11 pose estimation** to extract body keypoints frame-by-frame, runs them through exercise-specific biomechanical rule engines (angle thresholds, alignment checks, state machines), and returns live rep counts, form scores, and corrective feedback — spoken aloud in **Hinglish** via text-to-speech.

A three-tier AI insight layer (local Ollama model → Gemini API → deterministic rule-based fallback) generates natural-language coaching tips and post-session reports, so the app degrades gracefully even with no internet connection or API key.

## Features

- 🎥 **Live webcam pose analysis** — frames captured client-side and streamed to the backend for inference (~5 fps)
- 🏋️ **8 exercise/posture modes**: Squat, Push-up, Lunges, Plank, Surya Namaskar, Yoga poses (Tree, Tadasana, Warrior II, Triangle, Downward Dog, Cobra), Desk/Study Posture, General Posture
- 🔁 **Automatic rep counting** with per-rep correctness tracking and error tagging (e.g. knee valgus, hip sagging, shallow depth)
- 🗣️ **Real-time voice coaching** in Hinglish/Hindi/English with smart cooldowns to avoid spam or interrupted speech
- 🤖 **3-tier AI feedback engine** (Ollama local LLM → Gemini API → local rule-based fallback) for both live micro-feedback and full session summaries
- 📊 **Session analytics** — dashboard, progress tracking, session history, and leaderboard
- 🔐 **JWT-based authentication**
- 🌐 **RESTful API** with a clean Flask blueprint architecture

## Tech Stack

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS
- [Ultralytics YOLO11-Pose](https://docs.ultralytics.com/) for keypoint detection
- OpenCV & NumPy for frame processing and geometry
- SQLite by default — swappable for PostgreSQL/MySQL
- Ollama (`qwen2.5:latest`) for local LLM inference
- Google Gemini API as secondary AI provider

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Web Speech API (`SpeechSynthesis`) for TTS voice feedback

## Architecture

```text
┌─────────────────┐        base64 JPEG frame        ┌──────────────────────┐
│   React Client   │ ───────────────────────────────▶│   Flask API Server   │
│  (webcam capture)│                                  │                       │
│                  │◀─────────────────────────────── │  YOLO11-Pose Model   │
└─────────────────┘   annotated frame + metrics      │  Exercise Analyzers  │
                                                      │  AI Summarizer        │
                                                      │  (Ollama/Gemini/Local)│
                                                      └──────────┬────────────┘
                                                                 │
                                                      ┌──────────▼────────────┐
                                                      │   SQLite/PostgreSQL    │
                                                      │  Users · Sessions ·    │
                                                      │  Rep Logs · Visits     │
                                                      └───────────────────────┘
```

Each exercise has a dedicated **analyzer class** (`SquatAnalyzer`, `PushupAnalyzer`, `PlankAnalyzer`, etc.) that:

1. Runs YOLO pose inference on the incoming frame.
2. Extracts and smooths relevant joint angles.
3. Runs a small state machine to detect rep transitions and form errors.
4. Returns an annotated frame plus a structured `metrics` payload.

## Project Structure

```text
.
├── app.py                       # Flask app entrypoint & config
├── models.py                    # SQLAlchemy models
├── ai_summarizer.py             # 3-tier AI insight engine
├── routes/
│   ├── auth.py                  # Login / registration / JWT issuance
│   ├── movement.py              # /pose/* frame analysis endpoints
│   ├── dashboard.py             # Dashboard summary endpoints
│   └── sessions.py              # Session history endpoints
├── analyzers/
│   ├── squat_analyzer.py
│   ├── pushup_analyzer.py
│   ├── lunge_analyzer.py
│   ├── plank_analyzer.py
│   ├── posture_analyzer.py
│   ├── desk_posture_analyzer.py
│   ├── surya_namaskar_analyzer.py
│   └── yoga_pose_analyzer.py
└── frontend/
    └── src/
        ├── api/Api.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Exercises.jsx
            ├── PoseAnalysis.jsx
            ├── Sessions.jsx
            ├── Progress.jsx
            ├── Leaderboard.jsx
            └── Profile.jsx
```

> **Note:** Adjust this tree to match your actual repository layout.

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- Optional: Ollama with `qwen2.5:latest`
- Optional: Google Gemini API key
- Webcam-enabled browser
- Chrome/Edge recommended

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/sunnykbharti/<repo-name>.git
cd <repo-name>/backend

# Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py
```

The API will be available at:

```text
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file inside the backend directory:

```env
# Database
SQLALCHEMY_DATABASE_URI=sqlite:///posecare.sqlite

# Authentication
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me

# AI Providers
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=qwen2.5:latest
GEMINI_API_KEY=your-gemini-api-key
```

> ⚠️ **Security note:** Never commit `SECRET_KEY`, `JWT_SECRET_KEY`, or API keys to GitHub. Use environment variables and strong production secrets.

## Supported Exercises & Poses

| Mode | Type | Key Checks |
|---|---|---|
| Squat | Rep-based | Knee angle depth, knee valgus |
| Push-up | Rep-based | Elbow angle, body straightness |
| Lunges | Rep-based | Front knee angle, torso lean |
| Plank | Hold-based | Body straightness, hold duration |
| Surya Namaskar | Sequence-based | Pose transitions |
| Yoga Poses | Hold-based | Tree, Tadasana, Warrior II, Triangle, Downward Dog, Cobra |
| Desk/Study Posture | Continuous | Slouching, forward neck, shoulder tilt |
| General Posture | Continuous | Torso lean, shoulder imbalance, head-forward drift |

## API Reference



| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Authenticate user and issue JWT |
| `POST` | `/pose/analyze_frame` | Submit a frame for pose analysis |
| `POST` | `/pose/stop` | End the current analysis session |
| `GET` | `/sessions` | List past workout sessions |
| `GET` | `/profile` | Fetch current user profile |
| `GET` | `/dashboard/summary` | Fetch dashboard statistics |
| `GET` | `/dashboard/weekly-activity` | Fetch weekly activity data |

## AI Insight Engine

`ai_summarizer.py` implements a resilient three-tier feedback pipeline:

1. **Ollama** — primary local LLM provider.
2. **Google Gemini** — secondary cloud AI provider.
3. **Local rule-based fallback** — deterministic feedback that works without internet or API keys.

The `form_quality` value is recomputed from live accuracy and detected issues rather than blindly trusting AI-generated text.

This ensures that AI feedback cannot override the actual biomechanical analysis.

## Roadmap

- [ ] OpenAPI/Swagger documentation
- [ ] WebSocket-based frame streaming
- [ ] Multi-person detection
- [ ] Exportable PDF session reports
- [ ] Mobile-responsive camera capture
- [ ] Unit tests for analyzer state machines
- [ ] Personalized workout recommendations
- [ ] Long-term posture trend analysis
- [ ] AI-generated fitness plans

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes with clear messages.
4. Open a pull request describing the changes and testing performed.

## License

This project is licensed under the **MIT License**.

## Acknowledgements

- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics) for pose estimation
- [Ollama](https://ollama.com/) for local LLM inference
- [Google Gemini](https://ai.google.dev/) for cloud AI fallback

---

**Author:** Sunny Bharti — [GitHub](https://github.com/sunnykbharti)