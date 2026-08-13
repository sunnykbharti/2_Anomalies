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
from analyzers.desk_posture_analyzer import DeskPostureAnalyzer
from ai_summarizer import ai_summarizer

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
    "desk_posture": lambda: DeskPostureAnalyzer(),
}

_active = {
    "exercise": None,
    "analyzer": None,
    "running": False,
    "frame_count": 0,
    "last_ai_insight": None,
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
    _active["frame_count"] = 0
    _active["last_ai_insight"] = None
    _active["started_at"] = datetime.utcnow()

    return jsonify({"status": "started", "exercise": exercise_type})


@movement_bp.route('/analyze_frame', methods=['POST'])
def analyze_frame():
    """Called repeatedly by frontend while analysis is running.
    Body: {"image": "data:image/jpeg;base64,...."}
    Returns skeleton-annotated frame + live metrics + AI Live Feed Summary."""
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass

    data = request.get_json(silent=True) or {}

    if not _active["running"] or _active["analyzer"] is None:
        exercise_type = data.get("exercise", "squat")
        if exercise_type not in ANALYZERS:
            exercise_type = "squat"
        _active["exercise"] = exercise_type
        _active["analyzer"] = ANALYZERS[exercise_type]()
        _active["running"] = True
        _active["frame_count"] = 0
        _active["last_ai_insight"] = None

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
    _active["frame_count"] += 1

    ok, buffer = cv2.imencode(".jpg", output, [cv2.IMWRITE_JPEG_QUALITY, 70])
    if not ok:
        return jsonify({"error": "could not encode output"}), 500

    annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

    # Generate or update Live AI Feed Insight (throttled every 15 frames or issue change)
    rep_log = getattr(_active["analyzer"], "rep_log", [])
    has_issues = bool(metrics.get("issues"))
    last_had_issues = _active.get("last_had_issues", False)
    _active["last_had_issues"] = has_issues

    should_call_ai = (
        _active["last_ai_insight"] is None or
        _active["frame_count"] % 15 == 1 or
        has_issues != last_had_issues
    )

    if should_call_ai:
        ai_insight = ai_summarizer.generate_live_feed_insight(
            _active["exercise"],
            metrics,
            rep_log
        )
        _active["last_ai_insight"] = ai_insight
    else:
        ai_insight = _active["last_ai_insight"]

    # Ensure feedback field is AI-generated
    ai_feedback_text = ai_insight.get("live_speech") or ai_insight.get("coaching_tip") or metrics.get("feedback", "")
    metrics["feedback"] = ai_feedback_text

    return jsonify({
        "annotated_image": annotated_b64,
        "metrics": metrics,
        "ai_live_summary": ai_insight,
    })


@movement_bp.route('/live_ai_summary', methods=['POST'])
def live_ai_summary():
    """Generates an immediate on-demand AI summary for the active live feed."""
    data = request.get_json(silent=True) or {}
    exercise = data.get("exercise", _active.get("exercise") or "squat")
    metrics = data.get("metrics", {})
    rep_log = getattr(_active.get("analyzer"), "rep_log", [])

    insight = ai_summarizer.generate_live_feed_insight(exercise, metrics, rep_log)
    return jsonify({"ai_live_summary": insight})


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
    exercise_name = _active["exercise"] or "squat"
    _active["running"] = False

    if analyzer is None:
        return jsonify({"error": "no session to stop"}), 400

    summary = analyzer.session_summary()

    # Generate full AI Session Report using AISummarizer
    ai_report = ai_summarizer.generate_session_summary(exercise_name, summary)
    ai_summary_text = ai_report.get("formatted_text") or ai_report.get("overview") or _build_text_summary(summary)

    # Save to database if user is logged in or for global history
    session_id = None
    ended_at = datetime.utcnow()
    started_at = _active.get("started_at") or ended_at
    try:
        session = MovementSession(
            user_id=int(user_id) if user_id and str(user_id).isdigit() else None,
            exercise_type=exercise_name,
            started_at=started_at,
            ended_at=ended_at,
            total_reps=summary["total_reps"],
            correct_reps=summary["correct_reps"],
            incorrect_reps=summary["incorrect_reps"],
            accuracy=summary["accuracy"],
            ai_summary=ai_summary_text,
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
        _active["started_at"] = None  # reset after saving
    except Exception as e:
        db.session.rollback()
        print(f"Session save warning: {e}")

    return jsonify({
        "exercise": exercise_name,
        "duration": data.get("duration", 0),
        "reps": summary["total_reps"],
        "accuracy": summary["accuracy"],
        "feedback": ai_summary_text,
        "ai_report": ai_report,
        "session_id": session_id,
    })


def _build_text_summary(summary):
    errors_flat = [e for rep in summary.get("rep_log", []) for e in rep.get("errors", [])]
    if not errors_flat:
        return f"शानदार सत्र! {summary['correct_reps']} रेप्स सही फॉर्म के साथ पूरे किए।"
    common = max(set(errors_flat), key=errors_flat.count)
    return f"{summary['correct_reps']}/{summary['total_reps']} सही। बार-बार आने वाली समस्या: {common.replace('_', ' ')}।"


from datetime import timedelta
from models import User

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


@movement_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Returns gamified posture correctness & exercise accuracy leaderboard.
    Query params: period=daily|weekly|monthly|all_time (default: all_time)"""
    period = request.args.get('period', 'all_time').lower()

    current_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        jwt_sub = get_jwt_identity()
        if jwt_sub and str(jwt_sub).isdigit():
            current_user_id = int(jwt_sub)
    except Exception:
        pass

    now = datetime.utcnow()
    query = db.session.query(MovementSession)

    if period == 'daily':
        query = query.filter(MovementSession.started_at >= now - timedelta(days=1))
    elif period == 'weekly':
        query = query.filter(MovementSession.started_at >= now - timedelta(days=7))
    elif period == 'monthly':
        query = query.filter(MovementSession.started_at >= now - timedelta(days=30))

    sessions = query.all()

    # Aggregate stats per user
    user_stats = {}
    for s in sessions:
        uid = s.user_id or 0
        if uid not in user_stats:
            user_stats[uid] = {
                "user_id": uid,
                "total_reps": 0,
                "correct_reps": 0,
                "sessions_count": 0,
                "accuracy_sum": 0.0,
            }
        user_stats[uid]["total_reps"] += (s.total_reps or 0)
        user_stats[uid]["correct_reps"] += (s.correct_reps or 0)
        user_stats[uid]["sessions_count"] += 1
        user_stats[uid]["accuracy_sum"] += (s.accuracy or 0.0)

    # Fetch User details from database
    user_ids = [uid for uid in user_stats.keys() if uid > 0]
    users_db = {u.id: u for u in User.query.filter(User.id.in_(user_ids)).all()} if user_ids else {}

    leaderboard = []
    for uid, stats in user_stats.items():
        if uid > 0 and uid in users_db:
            name = users_db[uid].name
            role = users_db[uid].role
        elif uid == 0:
            name = "Guest User"
            role = "Guest"
        else:
            name = f"User #{uid}"
            role = "Member"

        avg_accuracy = round(stats["accuracy_sum"] / stats["sessions_count"], 1) if stats["sessions_count"] > 0 else 0.0
        points = int(stats["correct_reps"] * 10 + avg_accuracy * 5 + stats["sessions_count"] * 20)

        leaderboard.append({
            "user_id": uid,
            "name": name,
            "role": role,
            "total_reps": stats["total_reps"],
            "correct_reps": stats["correct_reps"],
            "sessions_count": stats["sessions_count"],
            "accuracy": avg_accuracy,
            "points": points,
        })

    # Sort leaderboard by points descending
    leaderboard.sort(key=lambda x: x["points"], reverse=True)

    # Assign ranks and badges
    for idx, entry in enumerate(leaderboard):
        rank = idx + 1
        entry["rank"] = rank
        if rank == 1:
            entry["badge"] = "🥇 Posture Master"
            entry["tier"] = "Gold"
        elif rank == 2:
            entry["badge"] = "🥈 Biomechanics Pro"
            entry["tier"] = "Silver"
        elif rank == 3:
            entry["badge"] = "🥉 Consistency Sentinel"
            entry["tier"] = "Bronze"
        elif rank <= 10:
            entry["badge"] = "🌟 Elite Tracker"
            entry["tier"] = "Elite"
        else:
            entry["badge"] = "🏅 Active Scholar"
            entry["tier"] = "Scholar"

    current_user_rank = None
    if current_user_id:
        for entry in leaderboard:
            if entry["user_id"] == current_user_id:
                current_user_rank = entry
                break

    return jsonify({
        "period": period,
        "leaderboard": leaderboard,
        "current_user_rank": current_user_rank,
    })