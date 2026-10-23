"""
routes/auth.py – Production-ready authentication with rate limiting,
account lockout brute-force defense, cryptographic OTP generation, and email delivery.
"""

import re
from datetime import timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, User, OtpVerification
from extensions import limiter
from services.email_service import send_otp_email, mask_email, is_valid_email

auth_bp = Blueprint('auth', __name__)

PHONE_REGEX = re.compile(r'^\d{10}$')


def clean_identifier(raw: str) -> tuple:
    """
    Determine if input is a 10-digit mobile phone or an email address.
    Returns: (type: 'phone' | 'email' | None, cleaned_value: str)
    """
    if not raw or not isinstance(raw, str):
        return None, ""
    val = raw.strip()
    # Check phone (optional +91 prefix removal)
    cleaned_phone = val.replace('+91', '').replace('-', '').replace(' ', '')
    if PHONE_REGEX.match(cleaned_phone):
        return 'phone', cleaned_phone
    if is_valid_email(val):
        return 'email', val.lower()
    return None, val


# ─────────────────────────────────────────────────────────
# 1. PRIMARY LOGIN ENDPOINT (Supports OTP and Password)
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("15 per minute")
def login():
    """
    Universal login handler:
      - Send OTP:   {"mobile": "..."} OR {"email": "..."}
      - Verify OTP: {"mobile": "...", "otp": "..."} OR {"email": "...", "otp": "..."}
      - Password:   {"identifier": "...", "password": "..."}
    """
    data = request.get_json(silent=True) or {}
    raw_ident = data.get('mobile') or data.get('email') or data.get('identifier')
    otp = data.get('otp')
    password = data.get('password')

    ident_type, ident_val = clean_identifier(str(raw_ident or ''))
    if not ident_type:
        return jsonify({
            "error": "Bad Request",
            "message": "Please enter a valid 10-digit mobile number or email address."
        }), 400

    # ── CASE A: Password Authentication ────────────────────────
    if password:
        return _handle_password_login(ident_type, ident_val, password)

    # ── CASE B: Send OTP Request (when otp is omitted) ─────────
    if not otp:
        return _handle_send_otp(ident_type, ident_val)

    # ── CASE C: Verify OTP Request ─────────────────────────────
    return _handle_verify_otp(ident_type, ident_val, str(otp))


# ─────────────────────────────────────────────────────────
# 2. SEPARATE PASSWORD LOGIN ENDPOINT
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/login/password', methods=['POST'])
@limiter.limit("10 per minute; 30 per hour")
def password_login():
    """Direct password authentication with brute-force lockout."""
    data = request.get_json(silent=True) or {}
    raw_ident = data.get('identifier') or data.get('mobile') or data.get('email')
    password = data.get('password')

    if not password:
        return jsonify({"error": "Bad Request", "message": "Password is required."}), 400

    ident_type, ident_val = clean_identifier(str(raw_ident or ''))
    if not ident_type:
        return jsonify({
            "error": "Bad Request",
            "message": "Enter a valid 10-digit mobile number or email address."
        }), 400

    return _handle_password_login(ident_type, ident_val, password)


# ─────────────────────────────────────────────────────────
# 3. RESEND OTP ENDPOINT
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/login/resend-otp', methods=['POST'])
@limiter.limit("3 per minute; 10 per hour")
def resend_otp():
    """Resend a fresh OTP to user's registered email with rate limit protection."""
    data = request.get_json(silent=True) or {}
    raw_ident = data.get('mobile') or data.get('email') or data.get('identifier')

    ident_type, ident_val = clean_identifier(str(raw_ident or ''))
    if not ident_type:
        return jsonify({
            "error": "Bad Request",
            "message": "Valid mobile number or email is required."
        }), 400

    return _handle_send_otp(ident_type, ident_val)


# ─────────────────────────────────────────────────────────
# 4. CURRENT USER & PROFILE ENDPOINTS
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get authenticated user info."""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    """Retrieve or update authenticated user profile."""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "user": user.to_dict(),
            "status": "success"
        }), 200

    # PUT update
    payload = request.get_json(silent=True) or {}
    if 'name' in payload and payload['name'].strip():
        user.name = payload['name'].strip()
    if 'age' in payload:
        try:
            user.age = int(payload['age'])
        except (ValueError, TypeError):
            pass
    if 'gender' in payload:
        user.gender = str(payload['gender']).strip()
    if 'height' in payload:
        try:
            user.height = float(payload['height'])
        except (ValueError, TypeError):
            pass
    if 'weight' in payload:
        try:
            user.weight = float(payload['weight'])
        except (ValueError, TypeError):
            pass
    if 'fitnessGoal' in payload or 'fitness_goal' in payload:
        user.fitness_goal = payload.get('fitnessGoal') or payload.get('fitness_goal')
    if 'activityLevel' in payload or 'activity_level' in payload:
        user.activity_level = payload.get('activityLevel') or payload.get('activity_level')
    if 'experience' in payload:
        user.experience = payload.get('experience')

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200


# ─────────────────────────────────────────────────────────
# 5. PASSWORD SETUP / RESET
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/set-password', methods=['POST'])
@jwt_required()
def set_user_password():
    """Set or update password for authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    new_password = data.get('password')
    if not new_password or len(new_password) < 6:
        return jsonify({
            "error": "Bad Request",
            "message": "Password must be at least 6 characters long."
        }), 400

    user.set_password(new_password)
    user.reset_failed_password_attempts()
    db.session.commit()

    return jsonify({"message": "Password updated successfully."}), 200


# ─────────────────────────────────────────────────────────
# 6. REGISTRATION ENDPOINT
# ─────────────────────────────────────────────────────────

@auth_bp.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute; 20 per hour")
def register():
    """Register a new user account with phone, email, name, and password."""
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    raw_mobile = str(data.get('mobile') or data.get('phone') or '').strip()
    raw_email = str(data.get('email') or '').strip()
    password = data.get('password')

    if not name or len(name) < 2:
        return jsonify({
            "error": "Bad Request",
            "message": "Full name must be at least 2 characters long."
        }), 400

    # Validate mobile
    cleaned_phone = raw_mobile.replace('+91', '').replace('-', '').replace(' ', '')
    if not PHONE_REGEX.match(cleaned_phone):
        return jsonify({
            "error": "Bad Request",
            "message": "Please enter a valid 10-digit mobile number."
        }), 400

    # Validate email
    if not is_valid_email(raw_email):
        return jsonify({
            "error": "Bad Request",
            "message": "Please enter a valid email address."
        }), 400
    email = raw_email.lower()

    # Check for existing account conflicts
    if User.query.filter_by(phone=cleaned_phone).first():
        return jsonify({
            "error": "Conflict",
            "message": "An account with this mobile number already exists. Please log in."
        }), 409

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "Conflict",
            "message": "An account with this email address already exists. Please log in."
        }), 409

    # Validate password if provided
    if password and len(password) < 6:
        return jsonify({
            "error": "Bad Request",
            "message": "Password must be at least 6 characters long."
        }), 400

    new_user = User(
        name=name,
        phone=cleaned_phone,
        email=email,
        role='user'
    )
    if password:
        new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    # Generate and send welcome OTP verification code to registered email
    raw_otp, _ = OtpVerification.create_otp(
        identifier=email,
        destination_email=email,
        expiry_minutes=10
    )
    send_otp_email(
        to_email=email,
        otp_code=raw_otp,
        user_name=name
    )

    # Issue JWT access token for immediate session creation
    access_token = create_access_token(
        identity=str(new_user.id),
        additional_claims={
            "role": new_user.role,
            "name": new_user.name,
            "phone": new_user.phone,
            "email": new_user.email,
        },
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        "message": "Registration successful! Welcome to PostureTrek.",
        "access_token": access_token,
        "user": new_user.to_dict()
    }), 201


# ─────────────────────────────────────────────────────────
# INTERNAL AUTH WORKERS
# ─────────────────────────────────────────────────────────

def _handle_send_otp(ident_type: str, ident_val: str):
    """Find user, generate secure OTP, and deliver via email."""
    if ident_type == 'phone':
        user = User.query.filter_by(phone=ident_val).first()
    else:
        user = User.query.filter_by(email=ident_val).first()

    if not user:
        return jsonify({
            "error": "Not Found",
            "message": f"No account found with this {ident_type}. Please verify or sign up."
        }), 404

    # Resolve target email
    recipient_email = user.email or (ident_val if ident_type == 'email' else None)
    if not recipient_email:
        # Fallback for demo users without email
        recipient_email = f"user_{user.phone}@postretrek.io"
        user.email = recipient_email
        db.session.commit()

    # Create persistent, hashed OTP (10 min expiry)
    raw_otp, _ = OtpVerification.create_otp(
        identifier=ident_val,
        destination_email=recipient_email,
        expiry_minutes=10
    )

    # Deliver via real email
    sent, msg = send_otp_email(
        to_email=recipient_email,
        otp_code=raw_otp,
        user_name=user.name
    )

    return jsonify({
        "message": f"Verification code sent to {mask_email(recipient_email)}",
        "email_masked": mask_email(recipient_email),
        "identifier": ident_val,
        "identifier_type": ident_type,
        "expires_in_minutes": 10
    }), 200


def _handle_verify_otp(ident_type: str, ident_val: str, otp: str):
    """Verify submitted OTP code with brute-force protection and lockout."""
    if len(otp) != 6 or not otp.isdigit():
        return jsonify({
            "error": "Bad Request",
            "message": "Verification code must be exactly 6 digits."
        }), 400

    status, msg, meta = OtpVerification.verify_otp(ident_val, otp)

    if status == 'NOT_FOUND':
        return jsonify({"error": "Bad Request", "message": msg}), 400
    if status == 'EXPIRED':
        return jsonify({"error": "Expired", "message": msg}), 400
    if status == 'LOCKED':
        return jsonify({"error": "Too Many Requests", "message": msg, "locked": True}), 429
    if status == 'INVALID':
        return jsonify({"error": "Unauthorized", "message": msg, "attempts_left": meta.get("attempts_left")}), 401

    # OTP is verified! Find user & issue JWT
    if ident_type == 'phone':
        user = User.query.filter_by(phone=ident_val).first()
    else:
        user = User.query.filter_by(email=ident_val).first()

    if not user:
        return jsonify({"error": "Not Found", "message": "User record not found."}), 404

    # Reset any password lockout counters
    user.reset_failed_password_attempts()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
        },
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


def _handle_password_login(ident_type: str, ident_val: str, password: str):
    """Authenticate with password; enforce 5-try limit with 15-minute lockout."""
    if ident_type == 'phone':
        user = User.query.filter_by(phone=ident_val).first()
    else:
        user = User.query.filter_by(email=ident_val).first()

    if not user:
        return jsonify({
            "error": "Not Found",
            "message": "Account not found for this identifier."
        }), 404

    # 1. Check account lockout status
    if user.is_locked:
        rem_min = user.lock_time_remaining
        return jsonify({
            "error": "Too Many Requests",
            "message": f"Account temporarily locked due to multiple failed password attempts. Try again in {rem_min} minute(s).",
            "locked": True,
            "retry_after_minutes": rem_min
        }), 429

    # 2. Check if password is set on account
    if not user.password_hash:
        return jsonify({
            "error": "Bad Request",
            "message": "No password set for this account. Please log in with OTP to set up a password."
        }), 400

    # 3. Check password
    if not user.check_password(password):
        is_locked, attempts_left = user.record_failed_password_attempt(max_attempts=5, lockout_minutes=15)
        if is_locked:
            return jsonify({
                "error": "Too Many Requests",
                "message": "Account locked for 15 minutes due to 5 consecutive failed password attempts.",
                "locked": True,
                "retry_after_minutes": 15
            }), 429
        return jsonify({
            "error": "Unauthorized",
            "message": f"Incorrect password. {attempts_left} attempt(s) remaining before account lockout.",
            "attempts_left": attempts_left
        }), 401

    # 4. Successful password login: reset counters and issue JWT
    user.reset_failed_password_attempts()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
        },
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200