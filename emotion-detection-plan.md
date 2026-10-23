# Emotion Detection Feature — Plan

## Top-Level Overview

Add a new **standalone real-time emotion detection page** at `/emotion-detection`.
The page will use the user's webcam to continuously detect and display basic facial
emotions (happy, sad, angry, surprise, fear, disgust, neutral) along with a confidence
score and an emoji indicator.

**Approach:**
- **Backend**: New Flask blueprint (`/api/emotion/*`) with a single `POST /api/emotion/analyze_frame`
  endpoint. Uses the existing OpenCV Haar-cascade face detector (already available via `cv2.data`)
  combined with `DeepFace` for emotion inference. Runs DeepFace in a background thread to keep
  frame latency low (same pattern as `model/facial_expression_analyzer.py`).
  `deepface` is added to `backend/requirements.txt`.
- **Frontend**: New React page `EmotionDetection.jsx` at route `/emotion-detection`. Mirrors the
  existing webcam + canvas frame-capture pattern (the same as `PoseAnalysis.jsx`). Sends base64
  JPEG frames to the backend endpoint and renders the annotated frame + emotion overlay (emoji,
  dominant emotion label, confidence bar).
- **Routing**: Add `/emotion-detection` to `frontend/src/Router.jsx`.
- **Navigation**: Add a link to the new page in the existing `Navbar` so users can reach it.

**Non-goals:**
- No database persistence for emotion sessions.
- No AI LLM coaching for emotion results.
- No changes to existing exercise analyzers or pose analysis flow.

---

## Sub-Tasks

---

### Sub-Task 1 — Backend: Emotion Analyzer + API Endpoint

**Intent**
Create the Python emotion analyzer and Flask route that receives a webcam frame (base64 JPEG),
runs face detection + DeepFace emotion inference, draws the face bounding box on the frame, and
returns the annotated image together with the emotion scores.

**Expected Outcomes**
- `backend/analyzers/emotion_analyzer.py` exists and processes a single frame correctly.
- `backend/routes/emotion.py` blueprint is registered in `backend/app.py`.
- `POST /api/emotion/analyze_frame` accepts `{"image": "data:image/jpeg;base64,..."}` and returns:
  ```json
  {
    "annotated_image": "data:image/jpeg;base64,...",
    "emotion": "happy",
    "scores": { "happy": 92.1, "sad": 1.3, ... },
    "face_detected": true
  }
  ```
- `deepface` is listed in `backend/requirements.txt`.

**Todo List**
1. Add `deepface` and `tf-keras` to `backend/requirements.txt`.
2. Create `backend/analyzers/emotion_analyzer.py`:
   - Load OpenCV Haar-cascade face detector at module level (warm-up dummy run).
   - `process_frame(frame)` method: detect face → crop → DeepFace.analyze (detector_backend="skip", actions=["emotion"]) in current thread (simple, no threading needed in HTTP context) → draw bounding box + dominant emotion label on frame → return annotated frame + result dict.
   - If no face is detected, return the original frame + `{"face_detected": false}`.
   - Apply a 5-frame deque rolling average on scores (store state in the analyzer instance) to smooth flickering.
3. Create `backend/routes/emotion.py` blueprint (`emotion_bp`, url_prefix `/api/emotion`):
   - Stateless (no session concept needed) — create a fresh `EmotionAnalyzer()` instance per server start (module-level singleton, same as `_active` pattern).
   - `POST /api/emotion/analyze_frame`: decode base64 frame → call `analyzer.process_frame()` → re-encode annotated frame → return JSON.
4. Register `emotion_bp` in `backend/app.py` (alongside the existing blueprints).

**Relevant Context**
- Pattern reference: `backend/routes/movement.py` — base64 decode/encode + cv2 frame handling.
- Emotion logic reference: `model/facial_expression_analyzer.py` — DeepFace usage, Haar cascade, threading pattern.
- Registration pattern: `backend/app.py` (imports and `app.register_blueprint(...)` calls).

**Status** `[ ] pending`

---

### Sub-Task 2 — Frontend: EmotionDetection Page

**Intent**
Build the React page at `/emotion-detection` that shows a live webcam feed, sends frames to the
backend, and displays the dominant emotion with an emoji, confidence score bar for all 7 emotions,
and a "face not detected" fallback state.

**Expected Outcomes**
- `frontend/src/pages/EmotionDetection.jsx` exists and renders correctly.
- The page streams webcam frames to `POST /api/emotion/analyze_frame` at ~5 fps (same cadence as pose analysis).
- The annotated image (with bounding box drawn by backend) is displayed in place of the raw video feed.
- The dominant emotion and its emoji are shown prominently.
- A compact bar list shows confidence % for all 7 emotions.
- "No face detected" message is shown when `face_detected: false`.
- A disclaimer note is shown: "Not a diagnosis or a reliable measure of inner emotion."
- Start/Stop camera buttons work correctly; camera stops on page unmount.

**Todo List**
1. Create `frontend/src/pages/EmotionDetection.jsx` with:
   - `useRef` for video element and canvas (for frame capture).
   - `useState` for: `cameraActive`, `emotion`, `scores`, `faceDetected`, `annotatedImage`, `isAnalyzing`.
   - `startCamera()` / `stopCamera()` using `getUserMedia` (same as PoseAnalysis pattern).
   - `useEffect` loop with `setInterval` (~200 ms = 5 fps): capture canvas frame → convert to base64 JPEG → POST to `/api/emotion/analyze_frame` → update state.
   - Render: webcam/annotated image area, emotion badge with emoji (map 7 emotions to emojis), confidence score bars for each emotion, disclaimer text.
   - Emotion → emoji mapping: happy 😊, sad 😢, angry 😠, surprise 😲, fear 😨, disgust 🤢, neutral 😐.
2. Use Tailwind CSS classes consistent with the rest of the app (dark theme style visible in existing pages).

**Relevant Context**
- Frame capture pattern: `frontend/src/pages/PoseAnalysis.jsx` (commented-out code shows exact canvas + getUserMedia pattern).
- API client: `frontend/src/api/Api.jsx` — `api.post("/emotion/analyze_frame", {image: ...})`.
- Tailwind dark theme: `frontend/src/index.css` + existing pages for reference.

**Status** `[ ] pending`

---

### Sub-Task 3 — Routing + Navigation

**Intent**
Wire the new page into the app so users can navigate to it.

**Expected Outcomes**
- Navigating to `/emotion-detection` loads the `EmotionDetection` page.
- The existing `Navbar` has a new link "Emotion" (or "😊 Emotion") pointing to `/emotion-detection`.

**Todo List**
1. In `frontend/src/Router.jsx`: import `EmotionDetection` and add `{ path: "/emotion-detection", element: <EmotionDetection /> }`.
2. In `frontend/src/components/Navbar.jsx` (or `Nav1.jsx`, whichever is the active nav): add a nav link for `/emotion-detection`.

**Relevant Context**
- Router file: `frontend/src/Router.jsx` — existing route pattern to follow.
- Navbar: `frontend/src/components/Navbar.jsx` and `Nav1.jsx`.

**Status** `[ ] pending`

---

## Architecture Diagram

```
Browser (EmotionDetection.jsx)
  |
  |  getUserMedia() — webcam stream
  |  Canvas capture → base64 JPEG (5 fps)
  |
  +--> POST /api/emotion/analyze_frame
           |
           | EmotionAnalyzer.process_frame(frame)
           |   1. Haar Cascade face detection
           |   2. DeepFace.analyze (emotion only, detector_backend=skip)
           |   3. 5-frame rolling average smoothing
           |   4. Draw bounding box + label on frame
           |
           +--> { annotated_image, emotion, scores, face_detected }
  |
  Display annotated image + emotion badge + score bars
```

---

## Dependency Note

`deepface` and `tf-keras` must be installed in the backend virtual environment before running:
```bash
pip install deepface tf-keras
```
The first time the server starts it will download the FaceNet/VGG-Face weights automatically.
A warm-up dummy run in the analyzer module init will pre-load the weights on server startup.
