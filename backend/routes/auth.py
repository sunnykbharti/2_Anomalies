from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

# Temporary in-memory OTP store for demonstration
# Key: mobile string, Value: {"otp": str, "expires_at": datetime}
# For production, replace this with Redis or a dedicated OTP table
OTP_STORE = {}


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    mobile = data.get('mobile')
    otp = data.get('otp')

    if not mobile or len(mobile) != 10:
        return jsonify({"message": "Valid 10-digit mobile number is required"}), 400

    # ---------------------------------------------------------
    # STEP 1: Send OTP Request (when 'otp' is not provided)
    # ---------------------------------------------------------
    if not otp:
        # Check if user exists with this phone number
        user = User.query.filter_by(phone=mobile).first()
        
        # Optionally auto-create a user if signing up on the fly, or reject unassigned numbers:
        if not user:
            return jsonify({"message": "Mobile number not registered in the system"}), 404

        # Generate OTP (Hardcoded '123456' for development/testing)
        generated_otp = "123456"
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        OTP_STORE[mobile] = {
            "otp": generated_otp,
            "expires_at": expires_at
        }

        # TODO: Integrate SMS gateway service here (e.g., Fast2SMS, Twilio)

        return jsonify({
            "message": "OTP sent successfully",
            "mobile": mobile
        }), 200

    # ---------------------------------------------------------
    # STEP 2: Verify OTP Request (when 'otp' is provided)
    # ---------------------------------------------------------
    if len(otp) != 6:
        return jsonify({"message": "Valid 6-digit OTP is required"}), 400

    record = OTP_STORE.get(mobile)

    # Check if OTP exists and hasn't expired
    if not record:
        return jsonify({"message": "No OTP requested for this number. Please try again."}), 400

    if datetime.utcnow() > record["expires_at"]:
        OTP_STORE.pop(mobile, None)
        return jsonify({"message": "OTP has expired. Please request a new one."}), 400

    if record["otp"] != otp:
        return jsonify({"message": "Invalid OTP. Please check and try again."}), 401

    # Clear used OTP
    OTP_STORE.pop(mobile, None)

    # Fetch user details
    user = User.query.filter_by(phone=mobile).first()
    if not user:
        return jsonify({"message": "User account not found"}), 404

    # Issue JWT token containing identity and role claims
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "name": user.name,
            "phone": user.phone
        },
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "preferred_language": user.preferred_language
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role,
        "preferred_language": user.preferred_language
    }), 200