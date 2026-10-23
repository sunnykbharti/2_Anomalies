"""
emotion_analyzer.py – Per-frame facial emotion recognition.

Pipeline:
  1. OpenCV Haar-cascade detects the first face in the frame.
  2. Cropped face is passed to DeepFace (detector_backend="skip" so the
     cascade result is reused — avoids double-detection overhead).
  3. Raw scores for the 7 basic emotions are smoothed over a 5-frame
     rolling window to prevent flickering.
  4. The annotated frame (face bounding box + dominant emotion label)
     is returned together with the smoothed scores.

DeepFace / tf-keras must be installed:
    pip install deepface tf-keras
"""

import cv2
import numpy as np
from collections import deque

EMOTION_NAMES = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
SMOOTHING_WINDOW = 5
FACE_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

# Warm-up: load Haar cascade at import time (fast, CPU only)
_face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
if _face_cascade.empty():
    raise RuntimeError("Could not load OpenCV Haar-cascade face detector.")

# Warm-up DeepFace model weights so the first real request isn't slow.
# Wrapped in try/except so the server still starts if deepface is not installed.
try:
    from deepface import DeepFace as _DeepFace
    _dummy = np.zeros((64, 64, 3), dtype=np.uint8)
    _DeepFace.analyze(_dummy, actions=["emotion"], detector_backend="skip",
                      enforce_detection=False, silent=True)
    _DEEPFACE_AVAILABLE = True
except Exception:
    _DEEPFACE_AVAILABLE = False


class EmotionAnalyzer:
    """Stateful per-session emotion analyser with rolling-average smoothing."""

    def __init__(self):
        self._score_history: deque = deque(maxlen=SMOOTHING_WINDOW)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_frame(self, frame: np.ndarray) -> tuple[np.ndarray, dict]:
        """
        Detect a face, run emotion inference, annotate the frame.

        Returns
        -------
        annotated : np.ndarray   BGR frame with bounding box + label drawn.
        result    : dict         {face_detected, emotion, scores}
        """
        annotated = frame.copy()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = _face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
        )

        if len(faces) == 0:
            return annotated, {"face_detected": False, "emotion": "none", "scores": {}}

        # Use the first detected face
        x, y, w, h = faces[0]
        face_crop = frame[y: y + h, x: x + w]

        scores = self._run_deepface(face_crop)

        if scores is None:
            # DeepFace not available or inference failed — return the frame
            # with the face box but no emotion data.
            cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)
            return annotated, {"face_detected": True, "emotion": "unknown", "scores": {}}

        # Smooth scores
        self._score_history.append(scores)
        smoothed = {
            em: float(np.mean([s[em] for s in self._score_history]))
            for em in EMOTION_NAMES
        }
        dominant = max(smoothed, key=smoothed.get)
        confidence = round(smoothed[dominant], 1)

        # Annotate
        cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 180), 2)
        label = f"{dominant}  {confidence:.0f}%"
        cv2.putText(annotated, label, (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 180), 2)

        return annotated, {
            "face_detected": True,
            "emotion": dominant,
            "scores": {em: round(smoothed[em], 1) for em in EMOTION_NAMES},
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _run_deepface(self, face_crop: np.ndarray) -> dict | None:
        if not _DEEPFACE_AVAILABLE or face_crop.size == 0:
            return None
        try:
            analysis = _DeepFace.analyze(
                img_path=face_crop,
                actions=["emotion"],
                detector_backend="skip",
                enforce_detection=False,
                silent=True,
            )
            if isinstance(analysis, list):
                analysis = analysis[0]
            raw = analysis.get("emotion", {})
            return {em: float(raw.get(em, 0.0)) for em in EMOTION_NAMES}
        except Exception:
            return None
