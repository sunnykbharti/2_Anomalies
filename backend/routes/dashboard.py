from flask import Blueprint, jsonify
from models import db, Patient, Visit
from sqlalchemy import func


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    total_patients = db.session.query(func.count(Patient.id)).scalar()
    risk_counts = (
        db.session.query(Visit.risk_level, func.count(Visit.id))
        .group_by(Visit.risk_level)
        .all()
    )
    risk_summary = {
        'low': 0,
        'medium': 0,
        'high': 0,
        'emergency': 0,
    }
    for level, cnt in risk_counts:
        if level:
            risk_summary[level] = cnt
    return jsonify({
        'total_patients': total_patients,
        'risk_counts': risk_summary,
    })

@dashboard_bp.route('/recent', methods=['GET'])
def get_recent_patients():
    recent = (
        db.session.query(Patient)
        .order_by(Patient.created_at.desc())
        .limit(5)
        .all()
    )
    data = [
        {
            'id': p.id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'village': p.village,
            'district': p.district,
            'created_at': p.created_at.isoformat()
        }
        for p in recent
    ]
    return jsonify(data)

@dashboard_bp.route('/recent_visits', methods=['GET'])
def get_recent_visits():
    recent = (
        db.session.query(Visit)
        .order_by(Visit.visit_time.desc())
        .limit(5)
        .all()
    )
    data = [
        {
            'id': v.id,
            'patient_name': v.patient.name if v.patient else None,
            'chief_complaint': v.chief_complaint,
            'risk_level': v.risk_level,
            'visit_time': v.visit_time.isoformat()
        }
        for v in recent
    ]
    return jsonify(data)
