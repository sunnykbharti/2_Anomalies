import numpy as np
from collections import deque
from ultralytics import YOLO

LEFT_SHOULDER, RIGHT_SHOULDER = 5, 6
LEFT_WRIST, RIGHT_WRIST = 9, 10
LEFT_HIP, RIGHT_HIP = 11, 12
LEFT_ANKLE, RIGHT_ANKLE = 15, 16

KEYPOINT_CONFIDENCE_THRESHOLD = 0.50
PRAYER_POSE = "Pranamasana (Prayer)"
FORWARD_FOLD_POSE = "Hastapadasana (Forward Fold)"
SMOOTHING_WINDOW = 5


def calculate_angle(a, b, c):
    a, b, c = (np.array(p, dtype=np.float32) for p in (a, b, c))
    ba, bc = a - b, c - b
    denom = np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8
    cos = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


def distance(a, b):
    return float(np.linalg.norm(np.array(a[:2]) - np.array(b[:2])))


def midpoint(a, b):
    return (np.array(a[:2]) + np.array(b[:2])) / 2.0


class SuryaAnalyzer:
    """
    Surya Namaskar Posture & Sequence Analyzer.
    Evaluates transitions between Pranamasana (Prayer Pose) and Hastapadasana (Forward Fold).
    """

    def __init__(self, model_path="yolo11n-pose.pt"):
        try:
            self.model = YOLO(model_path)
        except Exception:
            self.model = YOLO("yolov8n-pose.pt")

        self.current_pose = PRAYER_POSE
        self.completed_transitions = 0
        self.correct_transitions = 0
        self.incorrect_transitions = 0
        self.rep_log = []

    def process_frame(self, frame):
        results = self.model(frame, verbose=False)
        output = results[0].plot()

        feedback = "No person detected"
        keypoint_data = results[0].keypoints.data

        if len(keypoint_data) > 0:
            person = keypoint_data[0].cpu().numpy()

            l_sh, r_sh = person[LEFT_SHOULDER], person[RIGHT_SHOULDER]
            l_wr, r_wr = person[LEFT_WRIST], person[RIGHT_WRIST]
            l_hip, r_hip = person[LEFT_HIP], person[RIGHT_HIP]
            l_ank, r_ank = person[LEFT_ANKLE], person[RIGHT_ANKLE]

            important = [l_sh, r_sh, l_wr, r_wr, l_hip, r_hip, l_ank, r_ank]
            reliable = all(p[2] > KEYPOINT_CONFIDENCE_THRESHOLD for p in important)

            if reliable:
                wrists_center = midpoint(l_wr, r_wr)
                shoulders_center = midpoint(l_sh, r_sh)
                hips_center = midpoint(l_hip, r_hip)
                ankles_center = midpoint(l_ank, r_ank)

                hands_near_chest = (
                    abs(wrists_center[0] - shoulders_center[0]) < 60 and
                    shoulders_center[1] <= wrists_center[1] <= hips_center[1]
                )

                spine_angle = calculate_angle(shoulders_center, hips_center, ankles_center)
                hands_near_feet = (
                    abs(wrists_center[1] - ankles_center[1]) < 100 or
                    spine_angle < 120
                )

                if self.current_pose == PRAYER_POSE:
                    if hands_near_feet:
                        self.current_pose = FORWARD_FOLD_POSE
                        self.completed_transitions += 1
                        self.correct_transitions += 1
                        self.rep_log.append({
                            "rep_number": self.completed_transitions,
                            "correct": True,
                            "errors": [],
                            "min_angle": round(float(spine_angle), 1),
                        })
                        feedback = "GOOD: Transited to Hastapadasana (Forward Fold)"
                    elif hands_near_chest:
                        feedback = "GOOD: Pranamasana (Prayer Pose) posture"
                    else:
                        feedback = "Bring hands to chest center for Pranamasana"
                else: # FORWARD_FOLD_POSE
                    if hands_near_chest and spine_angle > 150:
                        self.current_pose = PRAYER_POSE
                        self.completed_transitions += 1
                        self.correct_transitions += 1
                        self.rep_log.append({
                            "rep_number": self.completed_transitions,
                            "correct": True,
                            "errors": [],
                            "min_angle": round(float(spine_angle), 1),
                        })
                        feedback = "GOOD: Returned to Pranamasana (Prayer Pose)"
                    elif hands_near_feet:
                        feedback = "GOOD: Hastapadasana deep forward bend"
                    else:
                        feedback = "Bend forward keeping legs extended"
            else:
                feedback = "Position full body in camera frame"

        return output, {
            "stage": self.current_pose,
            "total_reps": self.completed_transitions,
            "correct_reps": self.correct_transitions,
            "incorrect_reps": self.incorrect_transitions,
            "feedback": feedback,
        }

    def session_summary(self):
        accuracy = round(100 * self.correct_transitions / self.completed_transitions, 1) if self.completed_transitions else 0
        return {
            "total_reps": self.completed_transitions,
            "correct_reps": self.correct_transitions,
            "incorrect_reps": self.incorrect_transitions,
            "accuracy": accuracy,
            "rep_log": self.rep_log,
        }
