import numpy as np
from collections import deque
from ultralytics import YOLO

LEFT_HIP, RIGHT_HIP = 11, 12
LEFT_KNEE, RIGHT_KNEE = 13, 14
LEFT_ANKLE, RIGHT_ANKLE = 15, 16

KEYPOINT_CONFIDENCE_THRESHOLD = 0.50
STANDING_ANGLE_THRESHOLD = 160
SQUAT_DEPTH_ANGLE_THRESHOLD = 140
GOOD_DEPTH_ANGLE_THRESHOLD = 105
KNEE_ALIGNMENT_THRESHOLD = 0.10
SMOOTHING_WINDOW = 5


def calculate_angle(a, b, c):
    a, b, c = (np.array(p, dtype=np.float32) for p in (a, b, c))
    ba, bc = a - b, c - b
    denom = np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8
    cos = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


def calculate_inward_deviation(hip, knee, ankle, hip_center):
    expected_knee_x = (hip[0] + ankle[0]) / 2
    inward_direction = np.sign(hip_center[0] - ankle[0])
    deviation = (knee[0] - expected_knee_x) * inward_direction
    leg_length = np.linalg.norm(np.array(hip[:2]) - np.array(ankle[:2]))
    return float(deviation / (leg_length + 1e-8))


class SquatAnalyzer:
    """
    One instance = one live session. Call process_frame(frame) every
    camera frame. It returns (annotated_frame, metrics_dict) and never
    touches cv2.imshow / cv2.waitKey — Flask owns the loop instead.
    """

    def __init__(self, model_path="yolo11n-pose.pt"):
        self.model = YOLO(model_path)

        self.left_angle_history = deque(maxlen=SMOOTHING_WINDOW)
        self.right_angle_history = deque(maxlen=SMOOTHING_WINDOW)
        self.left_alignment_history = deque(maxlen=SMOOTHING_WINDOW)
        self.right_alignment_history = deque(maxlen=SMOOTHING_WINDOW)

        self.squat_stage = "standing"
        self.total_repetitions = 0
        self.correct_repetitions = 0
        self.incorrect_repetitions = 0
        self.current_rep_errors = set()
        self.min_angle_this_rep = 180.0
        self.last_rep_feedback = "No repetition completed"
        self.rep_log = []  # every completed rep gets appended here

    def process_frame(self, frame):
        results = self.model(frame, verbose=False)
        output = results[0].plot()

        feedback = "No person detected"
        average_knee_angle = None
        keypoint_data = results[0].keypoints.data

        if len(keypoint_data) > 0:
            person = keypoint_data[0].cpu().numpy()
            left_hip, left_knee, left_ankle = person[LEFT_HIP], person[LEFT_KNEE], person[LEFT_ANKLE]
            right_hip, right_knee, right_ankle = person[RIGHT_HIP], person[RIGHT_KNEE], person[RIGHT_ANKLE]

            important_points = [left_hip, left_knee, left_ankle, right_hip, right_knee, right_ankle]
            reliable = all(p[2] > KEYPOINT_CONFIDENCE_THRESHOLD for p in important_points)

            if reliable:
                left_angle = calculate_angle(left_hip[:2], left_knee[:2], left_ankle[:2])
                right_angle = calculate_angle(right_hip[:2], right_knee[:2], right_ankle[:2])
                self.left_angle_history.append(left_angle)
                self.right_angle_history.append(right_angle)
                average_knee_angle = (np.mean(self.left_angle_history) + np.mean(self.right_angle_history)) / 2

                hip_center = (left_hip[:2] + right_hip[:2]) / 2
                left_dev = calculate_inward_deviation(left_hip[:2], left_knee[:2], left_ankle[:2], hip_center)
                right_dev = calculate_inward_deviation(right_hip[:2], right_knee[:2], right_ankle[:2], hip_center)
                self.left_alignment_history.append(left_dev)
                self.right_alignment_history.append(right_dev)

                left_in = np.mean(self.left_alignment_history) > KNEE_ALIGNMENT_THRESHOLD
                right_in = np.mean(self.right_alignment_history) > KNEE_ALIGNMENT_THRESHOLD

                frame_errors = set()
                if left_in:
                    frame_errors.add("left_knee_inward")
                if right_in:
                    frame_errors.add("right_knee_inward")
                if left_in and right_in:
                    frame_errors -= {"left_knee_inward", "right_knee_inward"}
                    frame_errors.add("both_knees_inward")

                feedback = self._run_state_machine(average_knee_angle, frame_errors)
            else:
                feedback = "Move into a clearer camera position"

        return output, {
            "stage": self.squat_stage,
            "total_reps": self.total_repetitions,
            "correct_reps": self.correct_repetitions,
            "incorrect_reps": self.incorrect_repetitions,
            "knee_angle": None if average_knee_angle is None else round(float(average_knee_angle), 1),
            "feedback": feedback,
        }

    def _run_state_machine(self, angle, frame_errors):
        if self.squat_stage == "standing":
            if angle < SQUAT_DEPTH_ANGLE_THRESHOLD:
                self.squat_stage = "squatting"
                self.current_rep_errors = set()
                self.min_angle_this_rep = angle
            return self.last_rep_feedback if self.total_repetitions else "Stand straight to begin"

        # squatting
        self.min_angle_this_rep = min(self.min_angle_this_rep, angle)
        self.current_rep_errors.update(frame_errors)

        if angle > STANDING_ANGLE_THRESHOLD:
            self.total_repetitions += 1
            if self.min_angle_this_rep > GOOD_DEPTH_ANGLE_THRESHOLD:
                self.current_rep_errors.add("shallow_squat")

            is_correct = len(self.current_rep_errors) == 0
            if is_correct:
                self.correct_repetitions += 1
                self.last_rep_feedback = "Last rep: Correct"
            else:
                self.incorrect_repetitions += 1
                self.last_rep_feedback = "Last rep: " + self._error_message(self.current_rep_errors)

            self.rep_log.append({
                "rep_number": self.total_repetitions,
                "correct": is_correct,
                "errors": list(self.current_rep_errors),
                "min_angle": round(float(self.min_angle_this_rep), 1),
            })

            self.squat_stage = "standing"
            self.current_rep_errors = set()
            self.min_angle_this_rep = 180.0
            return self.last_rep_feedback

        if "both_knees_inward" in frame_errors:
            return "Keep both knees aligned"
        if "left_knee_inward" in frame_errors:
            return "Move your left knee outward"
        if "right_knee_inward" in frame_errors:
            return "Move your right knee outward"
        return "Good squat position"

    @staticmethod
    def _error_message(errors):
        if "both_knees_inward" in errors:
            return "Keep both knees aligned"
        if "left_knee_inward" in errors:
            return "Move your left knee outward"
        if "right_knee_inward" in errors:
            return "Move your right knee outward"
        if "shallow_squat" in errors:
            return "Squat a little deeper"
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