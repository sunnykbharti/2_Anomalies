import cv2
import time
import numpy as np
from collections import deque
from ultralytics import YOLO

LEFT_SHOULDER, RIGHT_SHOULDER = 5, 6
LEFT_ELBOW, RIGHT_ELBOW = 7, 8
LEFT_WRIST, RIGHT_WRIST = 9, 10
LEFT_HIP, RIGHT_HIP = 11, 12
LEFT_KNEE, RIGHT_KNEE = 13, 14
LEFT_ANKLE, RIGHT_ANKLE = 15, 16

KEYPOINT_CONFIDENCE_THRESHOLD = 0.25
SMOOTHING_WINDOW = 5

POSES = {
    "tree_pose": "Tree Pose",
    "tadasana": "Tadasana (Mountain)",
    "warrior_two": "Warrior II",
    "triangle": "Triangle Pose",
    "downward_dog": "Downward Dog",
    "cobra": "Cobra Pose",
}


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


class YogaAnalyzer:
    """
    Yoga Pose Analyzer class.
    Detects balance, pose accuracy for various yoga postures, and tracks hold timers.
    """

    def __init__(self, target_pose="tree_pose", model_path="yolo11n-pose.pt"):
        try:
            self.model = YOLO(model_path)
        except Exception:
            self.model = YOLO("yolov8n-pose.pt")

        self.target_pose = target_pose if target_pose in POSES else "tree_pose"
        self.pose_hold_start = None
        self.completed_holds = 0
        self.total_hold_time = 0.0
        self.current_hold_duration = 0.0
        self.last_feedback = "Get into starting posture"
        self.rep_log = []

    def process_frame(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.model(frame_rgb, verbose=False)
        output_rgb = results[0].plot()
        output_bgr = cv2.cvtColor(output_rgb, cv2.COLOR_RGB2BGR)

        feedback = "No person detected"
        is_good = False
        keypoint_data = results[0].keypoints.data

        if len(keypoint_data) > 0:
            person = keypoint_data[0].cpu().numpy()

            if self.target_pose == "tree_pose":
                feedback = self._check_tree(person)
            elif self.target_pose == "warrior_two":
                feedback = self._check_warrior_two(person)
            elif self.target_pose == "triangle":
                feedback = self._check_triangle(person)
            elif self.target_pose == "downward_dog":
                feedback = self._check_downward_dog(person)
            elif self.target_pose == "cobra":
                feedback = self._check_cobra(person)
            else:
                feedback = self._check_tadasana(person)

            is_good = feedback.startswith("GOOD")

            # Hold timer tracking
            if is_good:
                if self.pose_hold_start is None:
                    self.pose_hold_start = time.time()
                self.current_hold_duration = time.time() - self.pose_hold_start
                if self.current_hold_duration >= 3.0 and not (len(self.rep_log) > 0 and self.rep_log[-1]["hold_time"] >= 3.0):
                    self.completed_holds += 1
                    self.rep_log.append({
                        "rep_number": self.completed_holds,
                        "correct": True,
                        "errors": [],
                        "hold_time": round(float(self.current_hold_duration), 1),
                    })
                feedback += f" | Hold: {self.current_hold_duration:.1f}s"
            else:
                if self.pose_hold_start is not None:
                    self.total_hold_time += self.current_hold_duration
                    self.pose_hold_start = None
                    self.current_hold_duration = 0.0

        return output_bgr, {
            "stage": POSES.get(self.target_pose, "Yoga Pose"),
            "total_reps": self.completed_holds,
            "correct_reps": self.completed_holds,
            "incorrect_reps": 0,
            "hold_seconds": round(float(self.current_hold_duration), 1),
            "feedback": feedback,
        }

    def _reliable(self, person, indexes, min_count=None):
        confs = [person[idx][2] for idx in indexes]
        valid = [c > KEYPOINT_CONFIDENCE_THRESHOLD for c in confs]
        if min_count is None:
            return all(valid)
        return sum(valid) >= min_count

    def _check_tree(self, person):
        idx = [LEFT_HIP, RIGHT_HIP, LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE]
        if not self._reliable(person, idx, min_count=4):
            return "Show lower body clearly"

        l_ank_y, r_ank_y = person[LEFT_ANKLE][1], person[RIGHT_ANKLE][1]
        lifted_left = l_ank_y < r_ank_y - 20
        lifted_right = r_ank_y < l_ank_y - 20

        if not lifted_left and not lifted_right:
            return "Lift one foot and place on ankle/calf"

        return "GOOD: Tree Pose balance"

    def _check_tadasana(self, person):
        idx = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP, LEFT_ANKLE, RIGHT_ANKLE]
        if not self._reliable(person, idx, min_count=4):
            return "Show full body standing straight"

        sh_width = distance(person[LEFT_SHOULDER], person[RIGHT_SHOULDER])
        ank_width = distance(person[LEFT_ANKLE], person[RIGHT_ANKLE])

        if ank_width > sh_width * 1.8:
            return "Bring feet closer together"

        return "GOOD: Tadasana alignment"

    def _check_warrior_two(self, person):
        idx = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_WRIST, RIGHT_WRIST, LEFT_HIP, RIGHT_HIP, LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE]
        if not self._reliable(person, idx, min_count=6):
            return "Extend arms and widen stance"

        l_knee_angle = calculate_angle(person[LEFT_HIP][:2], person[LEFT_KNEE][:2], person[LEFT_ANKLE][:2])
        r_knee_angle = calculate_angle(person[RIGHT_HIP][:2], person[RIGHT_KNEE][:2], person[RIGHT_ANKLE][:2])

        hands_w = distance(person[LEFT_WRIST], person[RIGHT_WRIST])
        sh_w = distance(person[LEFT_SHOULDER], person[RIGHT_SHOULDER])

        if hands_w < sh_w * 1.6:
            return "Extend both arms parallel to floor"
        if min(l_knee_angle, r_knee_angle) > 140:
            return "Bend your front knee"

        return "GOOD: Warrior II alignment"

    def _check_triangle(self, person):
        idx = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP, LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE]
        if not self._reliable(person, idx, min_count=5):
            return "Show full body in wide triangle stance"

        l_leg = calculate_angle(person[LEFT_HIP][:2], person[LEFT_KNEE][:2], person[LEFT_ANKLE][:2])
        r_leg = calculate_angle(person[RIGHT_HIP][:2], person[RIGHT_KNEE][:2], person[RIGHT_ANKLE][:2])

        if min(l_leg, r_leg) < 140:
            return "Keep both legs straight and extended"

        return "GOOD: Triangle Pose alignment"

    def _check_downward_dog(self, person):
        idx = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP, LEFT_ANKLE, RIGHT_ANKLE]
        if not self._reliable(person, idx, min_count=4):
            return "Show shoulders, hips, and ankles"

        sh_c = midpoint(person[LEFT_SHOULDER], person[RIGHT_SHOULDER])
        hip_c = midpoint(person[LEFT_HIP], person[RIGHT_HIP])

        if hip_c[1] >= sh_c[1]:
            return "Lift your hips high into an inverted V"

        return "GOOD: Downward Dog alignment"

    def _check_cobra(self, person):
        idx = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP, LEFT_ELBOW, RIGHT_ELBOW]
        if not self._reliable(person, idx, min_count=4):
            return "Show upper body on mat"

        sh_c = midpoint(person[LEFT_SHOULDER], person[RIGHT_SHOULDER])
        hip_c = midpoint(person[LEFT_HIP], person[RIGHT_HIP])

        if abs(hip_c[1] - sh_c[1]) < 25:
            return "Lift chest gently upward"

        return "GOOD: Cobra Pose alignment"

    def session_summary(self):
        return {
            "total_reps": self.completed_holds,
            "correct_reps": self.completed_holds,
            "incorrect_reps": 0,
            "accuracy": 100.0 if self.completed_holds > 0 else 0.0,
            "rep_log": self.rep_log,
        }
