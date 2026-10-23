"""
routes/dashboard.py – User-scoped fitness analytics.
Only returns real data belonging to the authenticated user.
New users with no workout history receive zeroed metrics.
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import db, MovementSession
from sqlalchemy import func, extract

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


def _get_current_uid():
    """Retrieve authenticated user ID, or None if unauthenticated."""
    try:
        verify_jwt_in_request(optional=True)
        sub = get_jwt_identity()
        if sub and str(sub).isdigit():
            return int(sub)
    except Exception:
        pass
    return None


@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    """Fitness summary stats scoped strictly to the current user."""
    uid = _get_current_uid()

    # If unauthenticated or guest, return clean zero state
    if uid is None:
        return jsonify({
            'total_sessions': 0,
            'total_reps': 0,
            'correct_reps': 0,
            'avg_accuracy': 0.0,
            'exercise_breakdown': {},
        })

    user_query = db.session.query(MovementSession).filter(MovementSession.user_id == uid)

    total_sessions = user_query.with_entities(func.count(MovementSession.id)).scalar() or 0
    total_reps = user_query.with_entities(func.sum(MovementSession.total_reps)).scalar() or 0
    correct_reps = user_query.with_entities(func.sum(MovementSession.correct_reps)).scalar() or 0

    avg_accuracy = user_query.with_entities(func.avg(MovementSession.accuracy)).scalar()
    avg_accuracy = round(avg_accuracy, 1) if avg_accuracy else 0.0

    exercise_counts = (
        db.session.query(MovementSession.exercise_type, func.count(MovementSession.id))
        .filter(MovementSession.user_id == uid)
        .group_by(MovementSession.exercise_type)
        .all()
    )
    exercise_breakdown = {ex: cnt for ex, cnt in exercise_counts}

    return jsonify({
        'total_sessions': total_sessions,
        'total_reps': int(total_reps),
        'correct_reps': int(correct_reps),
        'avg_accuracy': avg_accuracy,
        'exercise_breakdown': exercise_breakdown,
    })


@dashboard_bp.route('/recent_sessions', methods=['GET'])
def get_recent_sessions():
    """Return the 5 most recent workout sessions belonging to the current user."""
    uid = _get_current_uid()
    if uid is None:
        return jsonify([])

    sessions = (
        db.session.query(MovementSession)
        .filter(MovementSession.user_id == uid)
        .order_by(MovementSession.started_at.desc())
        .limit(5)
        .all()
    )
    data = [
        {
            'id': s.id,
            'exercise_type': s.exercise_type,
            'total_reps': s.total_reps,
            'correct_reps': s.correct_reps,
            'accuracy': s.accuracy,
            'started_at': s.started_at.isoformat() if s.started_at else None,
            'ended_at': s.ended_at.isoformat() if s.ended_at else None,
            'ai_summary': s.ai_summary,
        }
        for s in sessions
    ]
    return jsonify(data)


@dashboard_bp.route('/weekly', methods=['GET'])
def get_weekly_activity():
    """Return weekly rep counts for the current user grouped by day-of-week."""
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    uid = _get_current_uid()

    if uid is None:
        return jsonify([{'day': d, 'reps': 0} for d in day_names])

    # dow: 0=Sunday, 1=Monday … 6=Saturday
    rows = (
        db.session.query(
            extract('dow', MovementSession.started_at).label('dow'),
            func.sum(MovementSession.total_reps).label('reps')
        )
        .filter(MovementSession.user_id == uid)
        .group_by('dow')
        .all()
    )

    day_map = {int(r.dow): int(r.reps or 0) for r in rows}
    # Re-map SQLite/Postgres DOW (0=Sun, 1=Mon, ..., 6=Sat) to Mon..Sun
    ordered_dow = [1, 2, 3, 4, 5, 6, 0]
    result = [{'day': day_names[i], 'reps': day_map.get(ordered_dow[i], 0)} for i in range(7)]
    return jsonify(result)
