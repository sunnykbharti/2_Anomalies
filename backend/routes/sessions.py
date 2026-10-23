"""
Sessions API – list, get, and delete MovementSession records.
The Sessions page expects:
  {
    id, pose, score, repetitions, duration, status, date, ai_summary
  }
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import db, MovementSession

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api/sessions')

# Friendly label for exercise_type keys stored in DB
EXERCISE_LABELS = {
    'squat':          'Squat',
    'pushup':         'Push Up',
    'push_up':        'Push Up',
    'lunge':          'Lunge',
    'lunges':         'Lunge',
    'plank':          'Plank',
    'bicep_curl':     'Bicep Curl',
    'shoulder_press': 'Shoulder Press',
    'suryanamaskar':  'Surya Namaskar',
    'tree_pose':      'Tree Pose',
    'tadasana':       'Tadasana',
    'warrior_two':    'Warrior II',
    'triangle':       'Triangle',
    'downward_dog':   'Downward Dog',
    'cobra':          'Cobra',
    'posture':        'Posture Check',
    'desk_posture':   'Desk Posture',
}


def _serialize(s: MovementSession) -> dict:
    """Convert a MovementSession ORM object to the shape expected by the UI."""
    # Duration: prefer computed from timestamps, else 0
    duration_seconds = 0
    if s.started_at and s.ended_at:
        diff = (s.ended_at - s.started_at).total_seconds()
        duration_seconds = max(int(diff), 0)

    # Date: prefer started_at, fall back to ended_at, then None
    date_val = s.started_at or s.ended_at

    return {
        'id':            s.id,
        'pose':          EXERCISE_LABELS.get(s.exercise_type, s.exercise_type.replace('_', ' ').title()),
        'exercise_type': s.exercise_type,
        'score':         round(s.accuracy or 0, 1),
        'repetitions':   s.total_reps or 0,
        'correct_reps':  s.correct_reps or 0,
        'incorrect_reps': s.incorrect_reps or 0,
        'duration':      duration_seconds,
        'status':        'Completed',
        'date':          date_val.isoformat() if date_val else None,
        'ai_summary':    s.ai_summary or '',
    }



def _current_user_id():
    """Return the authenticated user's integer id, or None for unauthenticated requests."""
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        return int(uid) if uid and str(uid).isdigit() else None
    except Exception:
        return None


@sessions_bp.route('', methods=['GET'])
def list_sessions():
    """Return sessions for the authenticated user (or all if unauthenticated, for demo mode)."""
    uid = _current_user_id()
    query = db.session.query(MovementSession).order_by(MovementSession.started_at.desc())
    # fix #9: scope to the authenticated user's own sessions when logged in
    if uid is not None:
        query = query.filter(MovementSession.user_id == uid)
    sessions = query.all()
    return jsonify([_serialize(s) for s in sessions])


@sessions_bp.route('/<int:session_id>', methods=['GET'])
def get_session(session_id):
    """Return a single session by ID."""
    s = db.session.get(MovementSession, session_id)
    if not s:
        return jsonify({'error': 'Session not found'}), 404
    # fix #10: only return the session if it belongs to the requesting user (when authenticated)
    uid = _current_user_id()
    if uid is not None and s.user_id != uid:
        return jsonify({'error': 'Session not found'}), 404
    return jsonify(_serialize(s))


@sessions_bp.route('/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a session and its rep logs."""
    s = db.session.get(MovementSession, session_id)
    if not s:
        return jsonify({'error': 'Session not found'}), 404
    # fix #9 + #10: require authentication and ownership to delete
    uid = _current_user_id()
    if uid is None:
        return jsonify({'error': 'Authentication required'}), 401
    if s.user_id != uid:
        return jsonify({'error': 'Not authorised to delete this session'}), 403
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully'})
