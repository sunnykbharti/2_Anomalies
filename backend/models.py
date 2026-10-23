"""
models.py – PostureTrek database schema with enterprise security features.

Tables:
  users              – registered users (OTP and password auth, brute-force protection)
  otp_verifications  – persistent, hashed OTP records with rate-limiting & lockout
  movement_sessions  – one row per workout session
  movement_rep_logs  – one row per individual rep within a session
"""

import secrets
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# ─────────────────────────────────────────────────────────
# 1. USER
# ─────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)

    # Identity
    name          = db.Column(db.String(120), nullable=False)
    phone         = db.Column(db.String(15),  unique=True, nullable=False)   # PRIMARY LOGIN KEY
    email         = db.Column(db.String(120), unique=True, nullable=True)

    # Auth & Security
    password_hash            = db.Column(db.String(255), nullable=True)
    failed_password_attempts = db.Column(db.Integer, default=0)
    locked_until             = db.Column(db.DateTime, nullable=True)

    # Profile Details
    role               = db.Column(db.String(20),  nullable=False, default='user')  # user | admin
    avatar_url         = db.Column(db.String(500), nullable=True)
    preferred_language = db.Column(db.String(10),  default='en')
    age                = db.Column(db.Integer,     nullable=True)
    gender             = db.Column(db.String(20),  nullable=True)
    height             = db.Column(db.Float,       nullable=True)
    weight             = db.Column(db.Float,       nullable=True)
    fitness_goal       = db.Column(db.String(100), nullable=True)
    activity_level     = db.Column(db.String(50),  nullable=True)
    experience         = db.Column(db.String(50),  nullable=True)

    # Stats cache (updated after each session for fast dashboard reads)
    total_sessions   = db.Column(db.Integer, default=0)
    total_reps       = db.Column(db.Integer, default=0)
    total_correct    = db.Column(db.Integer, default=0)
    avg_accuracy     = db.Column(db.Float,   default=0.0)
    streak_days      = db.Column(db.Integer, default=0)
    last_session_at  = db.Column(db.DateTime, nullable=True)

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sessions = db.relationship(
        'MovementSession',
        backref='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    # ── Password & Lockout Security ──────────────────────────
    def set_password(self, password: str):
        """Hash and assign password using secure PBKDF2/SHA256."""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password: str) -> bool:
        """Verify candidate password against hash."""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    @property
    def is_locked(self) -> bool:
        """Check if account is actively locked due to failed attempts."""
        if self.locked_until and datetime.utcnow() < self.locked_until:
            return True
        return False

    @property
    def lock_time_remaining(self) -> int:
        """Minutes remaining before lock expires (1 to N)."""
        if self.is_locked:
            delta = self.locked_until - datetime.utcnow()
            return max(1, int(delta.total_seconds() / 60) + 1)
        return 0

    def record_failed_password_attempt(self, max_attempts: int = 5, lockout_minutes: int = 15) -> tuple:
        """
        Increment failed attempt count.
        Locks account for lockout_minutes if max_attempts is reached.
        Returns: (is_locked: bool, attempts_left: int)
        """
        self.failed_password_attempts = (self.failed_password_attempts or 0) + 1
        if self.failed_password_attempts >= max_attempts:
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
            db.session.commit()
            return True, 0
        db.session.commit()
        return False, max_attempts - self.failed_password_attempts

    def reset_failed_password_attempts(self):
        """Reset failed attempt counters upon successful authentication."""
        self.failed_password_attempts = 0
        self.locked_until = None
        db.session.commit()

    def to_dict(self):
        return {
            'id':                 self.id,
            'name':               self.name,
            'phone':              self.phone,
            'email':              self.email,
            'role':               self.role,
            'avatar_url':         self.avatar_url,
            'preferred_language': self.preferred_language,
            'age':                self.age,
            'gender':             self.gender,
            'height':             self.height,
            'weight':             self.weight,
            'fitness_goal':       self.fitness_goal,
            'activity_level':     self.activity_level,
            'experience':         self.experience,
            'total_sessions':     self.total_sessions,
            'total_reps':         self.total_reps,
            'total_correct':      self.total_correct,
            'avg_accuracy':       self.avg_accuracy,
            'streak_days':        self.streak_days,
            'is_locked':          self.is_locked,
            'has_password':       bool(self.password_hash),
            'last_session_at':    self.last_session_at.isoformat() if self.last_session_at else None,
            'created_at':         self.created_at.isoformat() if self.created_at else None,
        }

    def update_stats(self):
        """Recalculate cached stats from actual session rows."""
        all_sessions = self.sessions.all()
        if not all_sessions:
            return

        self.total_sessions  = len(all_sessions)
        self.total_reps      = sum(s.total_reps   or 0 for s in all_sessions)
        self.total_correct   = sum(s.correct_reps or 0 for s in all_sessions)
        self.avg_accuracy    = round(
            sum(s.accuracy or 0 for s in all_sessions) / len(all_sessions), 1
        )
        recent = max(all_sessions, key=lambda s: s.started_at or datetime.min)
        self.last_session_at = recent.started_at


# ─────────────────────────────────────────────────────────
# 2. OTP VERIFICATION (Persistent, Hashed, Brute-Force Safe)
# ─────────────────────────────────────────────────────────

class OtpVerification(db.Model):
    __tablename__ = 'otp_verifications'

    id           = db.Column(db.Integer, primary_key=True)
    identifier   = db.Column(db.String(120), nullable=False, index=True) # Phone or Email
    email        = db.Column(db.String(120), nullable=True)              # Destination email
    otp_hash     = db.Column(db.String(255), nullable=False)             # Hashed OTP
    attempts     = db.Column(db.Integer, default=0)
    max_attempts = db.Column(db.Integer, default=5)
    locked_until = db.Column(db.DateTime, nullable=True)
    expires_at   = db.Column(db.DateTime, nullable=False)
    used         = db.Column(db.Boolean,  default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    @classmethod
    def create_otp(cls, identifier: str, destination_email: str = None, expiry_minutes: int = 10):
        """
        Generate cryptographically secure 6-digit random code and persist hashed record.
        Invalidates any prior unused OTPs for the identifier.
        """
        # Invalidate previous unused codes
        cls.query.filter_by(identifier=identifier, used=False).update({'used': True})

        # Generate cryptographically secure 6-digit code
        raw_code = str(secrets.randbelow(900000) + 100000)
        otp_hash = generate_password_hash(raw_code, method='pbkdf2:sha256')
        expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)

        record = cls(
            identifier=identifier,
            email=destination_email,
            otp_hash=otp_hash,
            attempts=0,
            max_attempts=5,
            expires_at=expires_at,
            used=False
        )
        db.session.add(record)
        db.session.commit()
        return raw_code, record

    @classmethod
    def verify_otp(cls, identifier: str, submitted_otp: str) -> tuple:
        """
        Verify submitted OTP code against active record.
        Returns: (status: str, message: str, meta: dict)
        status can be: 'SUCCESS', 'LOCKED', 'EXPIRED', 'INVALID', 'NOT_FOUND'
        """
        record = cls.query.filter_by(identifier=identifier, used=False)\
                          .order_by(cls.created_at.desc())\
                          .first()

        if not record:
            return 'NOT_FOUND', "No active verification code found for this identifier.", {}

        # 1. Lockout check
        if record.locked_until and datetime.utcnow() < record.locked_until:
            rem = max(1, int((record.locked_until - datetime.utcnow()).total_seconds() / 60) + 1)
            return 'LOCKED', f"Too many incorrect attempts. Please wait {rem} minute(s).", {"retry_after_minutes": rem}

        # 2. Expiration check
        if datetime.utcnow() > record.expires_at:
            record.used = True
            db.session.commit()
            return 'EXPIRED', "Verification code has expired. Please request a new one.", {}

        # 3. Hash check
        if not check_password_hash(record.otp_hash, submitted_otp.strip()):
            record.attempts = (record.attempts or 0) + 1
            if record.attempts >= record.max_attempts:
                record.locked_until = datetime.utcnow() + timedelta(minutes=15)
                db.session.commit()
                return 'LOCKED', "Maximum attempts exceeded. Verification locked for 15 minutes.", {"retry_after_minutes": 15}
            
            remaining = record.max_attempts - record.attempts
            db.session.commit()
            return 'INVALID', f"Incorrect verification code. {remaining} attempt(s) remaining.", {"attempts_left": remaining}

        # 4. Success — mark as used
        record.used = True
        db.session.commit()
        return 'SUCCESS', "Verification successful.", {}


# ─────────────────────────────────────────────────────────
# 3. MOVEMENT SESSION  (one per workout)
# ─────────────────────────────────────────────────────────

class MovementSession(db.Model):
    __tablename__ = 'movement_sessions'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Exercise info
    exercise_type = db.Column(db.String(50), nullable=False)

    # Timing
    started_at   = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at     = db.Column(db.DateTime, nullable=True)

    # Aggregated counters
    total_reps     = db.Column(db.Integer, default=0)
    correct_reps   = db.Column(db.Integer, default=0)
    incorrect_reps = db.Column(db.Integer, default=0)
    accuracy       = db.Column(db.Float,   default=0.0)

    # AI-generated text report
    ai_summary   = db.Column(db.Text, nullable=True)

    # Rep-level detail
    rep_logs = db.relationship(
        'MovementRepLog',
        backref='session',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    @property
    def duration_seconds(self):
        if self.started_at and self.ended_at:
            return max(int((self.ended_at - self.started_at).total_seconds()), 0)
        return 0

    def to_dict(self, include_reps=False):
        data = {
            'id':             self.id,
            'user_id':        self.user_id,
            'exercise_type':  self.exercise_type,
            'started_at':     self.started_at.isoformat() if self.started_at else None,
            'ended_at':       self.ended_at.isoformat()   if self.ended_at   else None,
            'duration':       self.duration_seconds,
            'total_reps':     self.total_reps,
            'correct_reps':   self.correct_reps,
            'incorrect_reps': self.incorrect_reps,
            'accuracy':       self.accuracy,
            'ai_summary':     self.ai_summary,
        }
        if include_reps:
            data['rep_logs'] = [r.to_dict() for r in self.rep_logs]
        return data


# ─────────────────────────────────────────────────────────
# 4. MOVEMENT REP LOG  (one per rep within a session)
# ─────────────────────────────────────────────────────────

class MovementRepLog(db.Model):
    __tablename__ = 'movement_rep_logs'

    id          = db.Column(db.Integer, primary_key=True)
    session_id  = db.Column(db.Integer, db.ForeignKey('movement_sessions.id'), nullable=False)

    rep_number  = db.Column(db.Integer, nullable=False)
    correct     = db.Column(db.Boolean, default=False)
    errors      = db.Column(db.String(300), default='')
    min_angle   = db.Column(db.Float,   nullable=True)
    timestamp   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'session_id': self.session_id,
            'rep_number': self.rep_number,
            'correct':    self.correct,
            'errors':     self.errors.split(',') if self.errors else [],
            'min_angle':  self.min_angle,
            'timestamp':  self.timestamp.isoformat() if self.timestamp else None,
        }


# ─────────────────────────────────────────────────────────
# 5. AUTOMATIC DATABASE SCHEMA MIGRATOR
# ─────────────────────────────────────────────────────────

def auto_migrate():
    """
    Safely inspect and apply incremental schema changes to existing databases.
    Ensures zero data loss while adding security & profile columns.
    """
    inspector = inspect(db.engine)
    if 'users' in inspector.get_table_names():
        existing_cols = {c['name'] for c in inspector.get_columns('users')}
        
        column_definitions = [
            ('failed_password_attempts', 'INTEGER DEFAULT 0'),
            ('locked_until', 'DATETIME'),
            ('age', 'INTEGER'),
            ('gender', 'VARCHAR(20)'),
            ('height', 'FLOAT'),
            ('weight', 'FLOAT'),
            ('fitness_goal', 'VARCHAR(100)'),
            ('activity_level', 'VARCHAR(50)'),
            ('experience', 'VARCHAR(50)'),
        ]

        with db.engine.connect() as conn:
            for col_name, col_type in column_definitions:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[auto_migrate] Added column '{col_name}' to 'users' table.")
                    except Exception as e:
                        print(f"[auto_migrate] Warning adding '{col_name}': {e}")

    # Ensure all tables (including otp_verifications) are created
    db.create_all()