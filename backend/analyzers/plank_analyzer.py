import time
import numpy as np
from collections import deque
from ultralytics import YOLO

LEFT_SHOULDER, RIGHT_SHOULDER = 5, 6
LEFT_HIP, RIGHT_HIP = 11, 12
LEFT_ANKLE, RIGHT_ANKLE = 15, 16

KEYPOINT_CONFIDENCE_THRESHOLD = 0.50
BODY_STRAIGHT_THRESHOLD = 162.0


def calculate_angle(a, b, c):
    a, b, c = (np.array(p, dtype=np.float32) for p in (a, b, c))
    ba, bc = a - b, c - b
    denom = np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8
    cos = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


def midpoint(a, b):
    return (np.array(a[:2]) + np.array(b[:2])) / 2.0


class PlankAnalyzer:
    """
    Plank Analyzer class.
    Monitors body straightness (detects hip sagging / hiking) and tracks total active plank hold time.
    """

    def __init__(self, model_path="yolo11n-pose.pt"):
        try:
            self.model = YOLO(model_path)
        except Exception:
            self.model = YOLO("yolov8n-pose.pt")

        self.hold_start_time = None
        self.total_hold_seconds = 0.0
        self.current_hold_seconds = 0.0
        self.completed_holds = 0
        self.rep_log = []

    def process_frame(self, frame):
        results = self.model(frame, verbose=False)
        output = results[0].plot()

        feedback = "No person detected"
        body_angle = None
        is_good = False

        keypoint_data = results[0].keypoints.data
        if len(keypoint_data) > 0:
            person = keypoint_data[0].cpu().numpy()

            l_sh, r_sh = person[LEFT_SHOULDER], person[RIGHT_SHOULDER]
            l_hip, r_hip = person[LEFT_HIP], person[RIGHT_HIP]
            l_ank, r_ank = person[LEFT_ANKLE], person[RIGHT_ANKLE]

            important = [l_sh, r_sh, l_hip, r_hip, l_ank, r_ank]
            reliable = all(p[2] > KEYPOINT_CONFIDENCE_THRESHOLD for p in important)

            if reliable:
                sh_c = midpoint(l_sh, r_sh)
                hip_c = midpoint(l_hip, r_hip)
                ank_c = midpoint(l_ank, r_ank)

                body_angle = calculate_angle(sh_c, hip_c, ank_c)

                if body_angle >= BODY_STRAIGHT_THRESHOLD:
                    is_good = True
                    feedback = f"GOOD: Perfect Plank Posture ({body_angle:.0f}°)"
                else:
                    expected_hip_y = (sh_c[1] + ank_c[1]) / 2.0
                    if hip_c[1] > expected_hip_y:
                        feedback = "Engage core - hips are sagging"
                    else:
                        feedback = "Lower your hips - body straight"

                if is_good:
                    if self.hold_start_time is None:
                        self.hold_start_time = time.time()
                    self.current_hold_seconds = time.time() - self.hold_start_time
                    if self.current_hold_seconds >= 5.0 and not (len(self.rep_log) > 0 and self.rep_log[-1]["hold_time"] >= 5.0):
                        self.completed_holds += 1
                        self.rep_log.append({
                            "rep_number": self.completed_holds,
                            "correct": True,
                            "errors": [],
                            "hold_time": round(float(self.current_hold_seconds), 1),
                        })
                    feedback += f" | Hold: {self.current_hold_seconds:.1f}s"
                else:
                    if self.hold_start_time is not None:
                        self.total_hold_seconds += self.current_hold_seconds
                        self.hold_start_time = None
                        self.current_hold_seconds = 0.0
            else:
                feedback = "Show full body side view in plank"

        return output, {
            "stage": "Plank Hold",
            "total_reps": self.completed_holds,
            "correct_reps": self.completed_holds,
            "incorrect_reps": 0,
            "body_angle": None if body_angle is None else round(float(body_angle), 1),
            "hold_seconds": round(float(self.current_hold_seconds), 1),
            "feedback": feedback,
        }

    def session_summary(self):
        return {
            "total_reps": self.completed_holds,
            "correct_reps": self.completed_holds,
            "incorrect_reps": 0,
            "accuracy": 100.0 if self.completed_holds > 0 else 0.0,
            "rep_log": self.rep_log,
        }
