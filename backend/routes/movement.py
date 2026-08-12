import base64
import numpy as np
import cv2
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from models import db, MovementSession, MovementRepLog
from analyzers.squat_analyzer import SquatAnalyzer
from analyzers.pushup_analyzer import PushupAnalyzer
from analyzers.yoga_pose_analyzer import YogaAnalyzer
from analyzers.surya_namaskar_analyzer import SuryaAnalyzer
from analyzers.lunge_analyzer import LungeAnalyzer
from analyzers.plank_analyzer import PlankAnalyzer
from analyzers.posture_analyzer import PostureAnalyzer

movement_bp = Blueprint('movement', __name__, url_prefix='/api/pose')

ANALYZERS = {
    "squat": lambda: SquatAnalyzer(),
    "pushup": lambda: PushupAnalyzer(),
    "suryanamaskar": lambda: SuryaAnalyzer(),
    "tree_pose": lambda: YogaAnalyzer(target_pose="tree_pose"),
    "tadasana": lambda: YogaAnalyzer(target_pose="tadasana"),
    "warrior_two": lambda: YogaAnalyzer(target_pose="warrior_two"),
    "triangle": lambda: YogaAnalyzer(target_pose="triangle"),
    "downward_dog": lambda: YogaAnalyzer(target_pose="downward_dog"),
    "cobra": lambda: YogaAnalyzer(target_pose="cobra"),
    "lunges": lambda: LungeAnalyzer(),
    "plank": lambda: PlankAnalyzer(),
    "posture": lambda: PostureAnalyzer(),
}

_active = {
    "exercise": None,
    "analyzer": None,
    "running": False,
}


@movement_bp.route('/start', methods=['POST'])
def start_exercise():
    """Matches the frontend's POST /pose/start {exercise: 'squat'}.
    Optional JWT auth header check."""
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass

    data = request.get_json(silent=True) or {}
    exercise_type = data.get("exercise", "squat")

    if exercise_type not in ANALYZERS:
        # Fallback to squat if unknown
        exercise_type = "squat"

    _active["exercise"] = exercise_type
    _active["analyzer"] = ANALYZERS[exercise_type]()
    _active["running"] = True

    return jsonify({"status": "started", "exercise": exercise_type})


@movement_bp.route('/analyze_frame', methods=['POST'])
def analyze_frame():
    """Called repeatedly by frontend while analysis is running.
    Body: {"image": "data:image/jpeg;base64,...."}
    Returns skeleton-annotated frame + live metrics."""
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass

    if not _active["running"] or _active["analyzer"] is None:
        return jsonify({"error": "no active session — call /pose/start first"}), 400

    data = request.get_json(silent=True) or {}
    image_data_url = data.get("image")
    if not image_data_url:
        return jsonify({"error": "missing 'image' field"}), 400

    try:
        header, encoded = image_data_url.split(",", 1)
        raw_bytes = base64.b64decode(encoded)
        np_array = np.frombuffer(raw_bytes, dtype=np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    except Exception:
        return jsonify({"error": "could not decode image"}), 400

    if frame is None:
        return jsonify({"error": "empty frame"}), 400

    output, metrics = _active["analyzer"].process_frame(frame)

    ok, buffer = cv2.imencode(".jpg", output, [cv2.IMWRITE_JPEG_QUALITY, 70])
    if not ok:
        return jsonify({"error": "could not encode output"}), 500

    annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "annotated_image": annotated_b64,
        "metrics": metrics,
    })


@movement_bp.route('/stop', methods=['POST'])
def stop_exercise():
    """Matches POST /pose/stop {exercise, duration}."""
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    data = request.get_json(silent=True) or {}
    analyzer = _active["analyzer"]
    _active["running"] = False

    if analyzer is None:
        return jsonify({"error": "no session to stop"}), 400

    summary = analyzer.session_summary()

    # Save to database if user is logged in
    session_id = None
    try:
        session = MovementSession(
            user_id=int(user_id) if user_id and str(user_id).isdigit() else None,
            exercise_type=_active["exercise"] or "squat",
            ended_at=datetime.utcnow(),
            total_reps=summary["total_reps"],
            correct_reps=summary["correct_reps"],
            incorrect_reps=summary["incorrect_reps"],
            accuracy=summary["accuracy"],
            ai_summary=_build_text_summary(summary),
        )
        db.session.add(session)
        db.session.flush()

        for rep in summary.get("rep_log", []):
            db.session.add(MovementRepLog(
                session_id=session.id,
                rep_number=rep.get("rep_number", 1),
                correct=rep.get("correct", True),
                errors=",".join(rep.get("errors", [])),
                min_angle=rep.get("min_angle", rep.get("hold_time", 0.0)),
            ))
        db.session.commit()
        session_id = session.id
    except Exception as e:
        db.session.rollback()
        print(f"Session save warning: {e}")

    return jsonify({
        "exercise": _active["exercise"],
        "duration": data.get("duration", 0),
        "reps": summary["total_reps"],
        "accuracy": summary["accuracy"],
        "feedback": _build_text_summary(summary),
        "session_id": session_id,
    })


def _build_text_summary(summary):
    errors_flat = [e for rep in summary.get("rep_log", []) for e in rep.get("errors", [])]
    if not errors_flat:
        return f"Solid session! Completed {summary['correct_reps']} reps/holds with good form alignment."
    common = max(set(errors_flat), key=errors_flat.count)
    return f"{summary['correct_reps']}/{summary['total_reps']} correct. Recurring form suggestion: {common.replace('_', ' ')}."


@movement_bp.route('/session/<int:session_id>', methods=['GET'])
def get_session(session_id):
    session = MovementSession.query.get_or_404(session_id)
    return jsonify({
        "id": session.id,
        "exercise_type": session.exercise_type,
        "total_reps": session.total_reps,
        "correct_reps": session.correct_reps,
        "incorrect_reps": session.incorrect_reps,
        "accuracy": session.accuracy,
        "ai_summary": session.ai_summary,
    })