from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# 1. User and roles
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)

    movement_sessions = db.relationship('MovementSession', backref='user', lazy=True)


# 2. Movement / posture session tracking (CV analyzer feature)
class MovementSession(db.Model):
    __tablename__ = 'movement_sessions'

    id = db.Column(db.Integer, primary_key=True)

    # Who performed the session. If you bring back a Patient model later for
    # rehab/physio tracking, add patient_id = db.Column(db.Integer,
    # db.ForeignKey('patients.id'), nullable=True) back in at that point —
    # left out for now since there's no Patient table to point at.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    exercise_type = db.Column(db.String(50), nullable=False)  # "squat", "pushup", "surya_namaskar", etc.
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)

    total_reps = db.Column(db.Integer, default=0)
    correct_reps = db.Column(db.Integer, default=0)
    incorrect_reps = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0)

    ai_summary = db.Column(db.Text, nullable=True)

    rep_logs = db.relationship('MovementRepLog', backref='session', lazy=True, cascade="all, delete-orphan")


class MovementRepLog(db.Model):
    __tablename__ = 'movement_rep_logs'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('movement_sessions.id'), nullable=False)

    rep_number = db.Column(db.Integer, nullable=False)
    correct = db.Column(db.Boolean, default=False)
    errors = db.Column(db.String(200), default="")
    min_angle = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)