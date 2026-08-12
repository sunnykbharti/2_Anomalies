# import cv2
# from datetime import datetime
# from flask import Blueprint, Response, jsonify, request
# from flask_jwt_extended import jwt_required, get_jwt_identity

# from models import db, MovementSession, MovementRepLog
# from analyzers.squat_analyzer import SquatAnalyzer
# # from analyzers.pushup_analyzer import PushupAnalyzer
# # from analyzers.yoga_pose_analyzer import YogaAnalyzer

# movement_bp = Blueprint('movement', __name__, url_prefix='/api/movement')

# ANALYZERS = {
#     "squat": SquatAnalyzer,
#     # "pushup": PushupAnalyzer,
#     # "yoga": YogaAnalyzer,
# }

# # Single-camera/single-session state for the hackathon demo.
# _active = {
#     "exercise": None,
#     "analyzer": None,
#     "camera": None,
#     "running": False,
# }


# @movement_bp.route('/start/<exercise_type>', methods=['POST'])
# @jwt_required()
# def start_exercise(exercise_type):
#     """Called when the React 'Start Exercise' button is clicked.
#     Opens the camera and resets a fresh analyzer instance."""
#     if exercise_type not in ANALYZERS:
#         return jsonify({"error": f"unknown exercise '{exercise_type}'"}), 400

#     if _active["camera"] is not None:
#         _active["camera"].release()

#     camera = cv2.VideoCapture(0)
#     if not camera.isOpened():
#         return jsonify({"error": "could not open camera"}), 500

#     _active["exercise"] = exercise_type
#     _active["analyzer"] = ANALYZERS[exercise_type]()
#     _active["camera"] = camera
#     _active["running"] = True

#     return jsonify({"status": "started", "exercise": exercise_type})


# @movement_bp.route('/stop', methods=['POST'])
# @jwt_required()
# def stop_exercise():
#     """Called when the React 'Stop Exercise' button is clicked.
#     Releases the camera and returns the final summary so the frontend
#     can show results without a separate save call if you want."""
#     _active["running"] = False

#     if _active["camera"] is not None:
#         _active["camera"].release()
#         _active["camera"] = None

#     summary = _active["analyzer"].session_summary() if _active["analyzer"] else None
#     return jsonify({"status": "stopped", "summary": summary})


# def _gen_frames():
#     while _active["running"] and _active["camera"] is not None:
#         success, frame = _active["camera"].read()
#         if not success:
#             break

#         frame = cv2.flip(frame, 1)
#         output, metrics = _active["analyzer"].process_frame(frame)

#         ok, buffer = cv2.imencode(".jpg", output)
#         if not ok:
#             continue
#         yield (
#             b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
#         )


# @movement_bp.route('/video_feed')
# def video_feed():
#     # An <img> tag can't send an Authorization header, so the JWT comes in
#     # as a query param instead. Requires in app.py:
#     #   app.config["JWT_TOKEN_LOCATION"] = ["headers", "query_string"]
#     #   app.config["JWT_QUERY_STRING_NAME"] = "token"
#     from flask_jwt_extended import verify_jwt_in_request
#     try:
#         verify_jwt_in_request(locations=["query_string"])
#     except Exception:
#         return jsonify({"error": "missing or invalid token"}), 401

#     if not _active["running"]:
#         return jsonify({"error": "no active session — call /start/<exercise_type> first"}), 400

#     return Response(_gen_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


# @movement_bp.route('/metrics', methods=['GET'])
# @jwt_required()
# def get_metrics():
#     analyzer = _active["analyzer"]
#     if analyzer is None:
#         return jsonify({"error": "no active session"}), 400
#     return jsonify({
#         "exercise": _active["exercise"],
#         "running": _active["running"],
#         "stage": getattr(analyzer, "squat_stage", None),
#         "total_reps": analyzer.total_repetitions,
#         "correct_reps": analyzer.correct_repetitions,
#         "incorrect_reps": analyzer.incorrect_repetitions,
#     })


# @movement_bp.route('/session/save', methods=['POST'])
# @jwt_required()
# def save_session():
#     user_id = get_jwt_identity()
#     analyzer = _active["analyzer"]
#     if analyzer is None:
#         return jsonify({"error": "no session to save"}), 400

#     summary = analyzer.session_summary()

#     session = MovementSession(
#         user_id=user_id,
#         exercise_type=_active["exercise"],
#         ended_at=datetime.utcnow(),
#         total_reps=summary["total_reps"],
#         correct_reps=summary["correct_reps"],
#         incorrect_reps=summary["incorrect_reps"],
#         accuracy=summary["accuracy"],
#     )
#     db.session.add(session)
#     db.session.flush()

#     for rep in summary["rep_log"]:
#         db.session.add(MovementRepLog(
#             session_id=session.id,
#             rep_number=rep["rep_number"],
#             correct=rep["correct"],
#             errors=",".join(rep["errors"]),
#             min_angle=rep["min_angle"],
#         ))

#     db.session.commit()
#     return jsonify({"session_id": session.id, "summary": summary})


# @movement_bp.route('/session/<int:session_id>', methods=['GET'])
# @jwt_required()
# def get_session(session_id):
#     session = MovementSession.query.get_or_404(session_id)
#     return jsonify({
#         "id": session.id,
#         "exercise_type": session.exercise_type,
#         "total_reps": session.total_reps,
#         "correct_reps": session.correct_reps,
#         "incorrect_reps": session.incorrect_reps,
#         "accuracy": session.accuracy,
#         "ai_summary": session.ai_summary,
#     })

import base64
import numpy as np
import cv2
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, MovementSession, MovementRepLog
from analyzers.squat_analyzer import SquatAnalyzer
# from analyzers.pushup_analyzer import PushupAnalyzer
# from analyzers.yoga_pose_analyzer import YogaAnalyzer

movement_bp = Blueprint('movement', __name__, url_prefix='/api/pose')

ANALYZERS = {
    "squat": SquatAnalyzer,
    # "pushup": PushupAnalyzer,
    # "suryanamaskar": SuryaAnalyzer,
}

_active = {
    "exercise": None,
    "analyzer": None,
    "running": False,
}


@movement_bp.route('/start', methods=['POST'])
@jwt_required()
def start_exercise():
    """Matches the frontend's POST /pose/start {exercise: 'squat'}.
    No camera is opened here — the browser owns the camera."""
    data = request.get_json(silent=True) or {}
    exercise_type = data.get("exercise")

    if exercise_type not in ANALYZERS:
        return jsonify({"error": f"unknown exercise '{exercise_type}'"}), 400

    _active["exercise"] = exercise_type
    _active["analyzer"] = ANALYZERS[exercise_type]()
    _active["running"] = True

    return jsonify({"status": "started", "exercise": exercise_type})


@movement_bp.route('/analyze_frame', methods=['POST'])
@jwt_required()
def analyze_frame():
    """Called repeatedly (every ~150-250ms) by the frontend while analysis
    is running. Body: {"image": "data:image/jpeg;base64,...."}
    Returns the skeleton-annotated frame + live metrics for that frame."""
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
@jwt_required()
def stop_exercise():
    """Matches POST /pose/stop {exercise, duration}."""
    data = request.get_json(silent=True) or {}
    analyzer = _active["analyzer"]

    _active["running"] = False

    if analyzer is None:
        return jsonify({"error": "no session to stop"}), 400

    summary = analyzer.session_summary()

    # Persist to DB right here so the frontend's sessionResult can just
    # display what's returned — no separate save call needed.
    user_id = get_jwt_identity()
    session = MovementSession(
        user_id=user_id,
        exercise_type=_active["exercise"],
        ended_at=datetime.utcnow(),
        total_reps=summary["total_reps"],
        correct_reps=summary["correct_reps"],
        incorrect_reps=summary["incorrect_reps"],
        accuracy=summary["accuracy"],
    )
    db.session.add(session)
    db.session.flush()

    for rep in summary["rep_log"]:
        db.session.add(MovementRepLog(
            session_id=session.id,
            rep_number=rep["rep_number"],
            correct=rep["correct"],
            errors=",".join(rep["errors"]),
            min_angle=rep["min_angle"],
        ))
    db.session.commit()

    return jsonify({
        "exercise": _active["exercise"],
        "duration": data.get("duration", 0),
        "reps": summary["total_reps"],
        "accuracy": summary["accuracy"],
        "feedback": _build_text_summary(summary),
        "session_id": session.id,
    })


def _build_text_summary(summary):
    errors_flat = [e for rep in summary["rep_log"] for e in rep["errors"]]
    if not errors_flat:
        return "Solid session — no recurring form issues detected."
    common = max(set(errors_flat), key=errors_flat.count)
    return f"{summary['correct_reps']}/{summary['total_reps']} reps correct. Recurring issue: {common.replace('_', ' ')}."


@movement_bp.route('/session/<int:session_id>', methods=['GET'])
@jwt_required()
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