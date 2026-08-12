import numpy as np
from collections import deque
from ultralytics import YOLO

LEFT_HIP, RIGHT_HIP = 11, 12
LEFT_KNEE, RIGHT_KNEE = 13, 14
LEFT_ANKLE, RIGHT_ANKLE = 15, 16
LEFT_SHOULDER, RIGHT_SHOULDER = 5, 6

KEYPOINT_CONFIDENCE_THRESHOLD = 0.50
STANDING_KNEE_THRESHOLD = 155.0
LUNGE_DEPTH_THRESHOLD = 115.0
SMOOTHING_WINDOW = 5


def calculate_angle(a, b, c):
    a, b, c = (np.array(p, dtype=np.float32) for p in (a, b, c))
    ba, bc = a - b, c - b
    denom = np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8
    cos = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


class LungeAnalyzer:
    """
    Lunge Analyzer class.
    Detects front knee angle depth, back knee drop, torso uprightness, and counts repetitions.
    """

    def __init__(self, model_path="yolo11n-pose.pt"):
        try:
            self.model = YOLO(model_path)
        except Exception:
            self.model = YOLO("yolov8n-pose.pt")

        self.stage = "standing"
        self.total_repetitions = 0
        self.correct_repetitions = 0
        self.incorrect_repetitions = 0
        self.current_rep_errors = set()
        self.min_knee_this_rep = 180.0
        self.last_rep_feedback = "Step forward into a lunge"
        self.rep_log = []

    def process_frame(self, frame):
        results = self.model(frame, verbose=False)
        output = results[0].plot()

        feedback = "No person detected"
        min_knee = None
        keypoint_data = results[0].keypoints.data

        if len(keypoint_data) > 0:
            person = keypoint_data[0].cpu().numpy()

            l_hip, r_hip = person[LEFT_HIP], person[RIGHT_HIP]
            l_knee, r_knee = person[LEFT_KNEE], person[RIGHT_KNEE]
            l_ank, r_ank = person[LEFT_ANKLE], person[RIGHT_ANKLE]
            l_sh, r_sh = person[LEFT_SHOULDER], person[RIGHT_SHOULDER]

            important = [l_hip, r_hip, l_knee, r_knee, l_ank, r_ank, l_sh, r_sh]
            reliable = all(p[2] > KEYPOINT_CONFIDENCE_THRESHOLD for p in important)

            if reliable:
                left_knee_angle = calculate_angle(l_hip[:2], l_knee[:2], l_ank[:2])
                right_knee_angle = calculate_angle(r_hip[:2], r_knee[:2], r_ank[:2])
                min_knee = min(left_knee_angle, right_knee_angle)

                # Posture error checking: front knee passing way past ankle or leaning too forward
                frame_errors = set()
                torso_lean = abs(l_sh[0] - l_hip[0])
                if torso_lean > 60:
                    frame_errors.add("leaning_forward")

                feedback = self._run_state_machine(min_knee, frame_errors)
            else:
                feedback = "Show full body in side view"

        return output, {
            "stage": self.stage,
            "total_reps": self.total_repetitions,
            "correct_reps": self.correct_repetitions,
            "incorrect_reps": self.incorrect_repetitions,
            "knee_angle": None if min_knee is None else round(float(min_knee), 1),
            "feedback": feedback,
        }

    def _run_state_machine(self, min_knee_angle, frame_errors):
        if self.stage == "standing":
            if min_knee_angle < LUNGE_DEPTH_THRESHOLD:
                self.stage = "lunging"
                self.current_rep_errors = set()
                self.min_knee_this_rep = min_knee_angle

            if "leaning_forward" in frame_errors:
                return "Keep your chest upright while stepping"
            return self.last_rep_feedback if self.total_repetitions else "Step into lunge"

        # lunging
        self.min_knee_this_rep = min(self.min_knee_this_rep, min_knee_angle)
        self.current_rep_errors.update(frame_errors)

        if min_knee_angle > STANDING_KNEE_THRESHOLD:
            self.total_repetitions += 1
            if self.min_knee_this_rep > 105:
                self.current_rep_errors.add("shallow_lunge")

            is_correct = len(self.current_rep_errors) == 0
            if is_correct:
                self.correct_repetitions += 1
                self.last_rep_feedback = "Last rep: Excellent lunge!"
            else:
                self.incorrect_repetitions += 1
                self.last_rep_feedback = "Last rep: " + self._error_msg(self.current_rep_errors)

            self.rep_log.append({
                "rep_number": self.total_repetitions,
                "correct": is_correct,
                "errors": list(self.current_rep_errors),
                "min_angle": round(float(self.min_knee_this_rep), 1),
            })

            self.stage = "standing"
            self.current_rep_errors = set()
            self.min_knee_this_rep = 180.0
            return self.last_rep_feedback

        if "leaning_forward" in frame_errors:
            return "Keep upper body upright"
        return "Good lunge depth - push back up!"

    @staticmethod
    def _error_msg(errors):
        if "leaning_forward" in errors:
            return "Keep torso upright"
        if "shallow_lunge" in errors:
            return "Drop back knee closer to ground"
        return "Good repetition"

    def session_summary(self):
        accuracy = round(100 * self.correct_repetitions / self.total_repetitions, 1) if self.total_repetitions else 0
        return {
            "total_reps": self.total_repetitions,
            "correct_reps": self.correct_repetitions,
            "incorrect_reps": self.incorrect_repetitions,
            "accuracy": accuracy,
            "rep_log": self.rep_log,
        }
