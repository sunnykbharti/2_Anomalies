from datetime import datetime
# pyrefly: ignore [missing-import]
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

    # worker, doctor, admin
    role = db.Column(db.String(20), nullable=False)

    # e.g., English, Hindi
    preferred_language = db.Column(db.String(10), default='en')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    movement_sessions = db.relationship('MovementSession', backref='user', lazy=True)
    patients = db.relationship('Patient', backref='created_by_user', lazy=True)
    visits = db.relationship('Visit', backref='created_by', lazy=True)
    doctor_notes = db.relationship('DoctorNote', backref='doctor', lazy=True)


class MovementSession(db.Model):
    __tablename__ = 'movement_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    exercise_type = db.Column(db.String(50), nullable=False)
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


# 2. Patient and demographic info
class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(50), unique=True, nullable=True)  # local health ID, etc.

    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=True)  # M/F/Other

    village = db.Column(db.String(120), nullable=True)
    district = db.Column(db.String(120), nullable=True)
    state = db.Column(db.String(120), nullable=True, default='Uttar Pradesh')

    phone = db.Column(db.String(20), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    visits = db.relationship('Visit', backref='patient', lazy=True, cascade="all, delete-orphan")
    history_items = db.relationship('MedicalHistoryItem', backref='patient', lazy=True, cascade="all, delete-orphan")
    medication_risk_scores = db.relationship('MedicationRiskScore', backref='patient', lazy=True, cascade="all, delete-orphan")
    education_cards = db.relationship('HealthEducationCard', backref='patient', lazy=True, cascade="all, delete-orphan")


# 3. Visit / encounter model
class Visit(db.Model):
    __tablename__ = 'visits'

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # health worker

    visit_time = db.Column(db.DateTime, default=datetime.utcnow)

    # Free-text description collected from worker
    chief_complaint = db.Column(db.Text, nullable=True)
    symptoms_text = db.Column(db.Text, nullable=True)  # raw symptom description (before structuring)
    duration_text = db.Column(db.String(50), nullable=True)

    # low / medium / high / emergency
    risk_level = db.Column(db.String(20), nullable=True)

    # new, pending_doctor, completed, referred
    status = db.Column(db.String(20), default='new')

    # Internet status at time of visit (online/offline/sms/ivr)
    connectivity_mode = db.Column(db.String(20), default='online')

    # language used in this visit
    language = db.Column(db.String(10), default='en')

    vitals = db.relationship('VitalSign', backref='visit', lazy=True, cascade="all, delete-orphan")
    symptoms = db.relationship('Symptom', backref='visit', lazy=True, cascade="all, delete-orphan")
    medications = db.relationship('Medication', backref='visit', lazy=True, cascade="all, delete-orphan")
    ai_result = db.relationship('AIResult', backref='visit', uselist=False, cascade="all, delete-orphan")
    doctor_note = db.relationship('DoctorNote', backref='visit', uselist=False, cascade="all, delete-orphan")
    workflow_logs = db.relationship('WorkflowStepLog', backref='visit', lazy=True, cascade="all, delete-orphan")


# 4. Vitals, structured symptoms, medical history
class VitalSign(db.Model):
    __tablename__ = 'vital_signs'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)

    temperature = db.Column(db.Float, nullable=True)  # in Celsius
    systolic_bp = db.Column(db.Integer, nullable=True)
    diastolic_bp = db.Column(db.Integer, nullable=True)
    pulse = db.Column(db.Integer, nullable=True)
    spo2 = db.Column(db.Integer, nullable=True)

    respiratory_rate = db.Column(db.Integer, nullable=True)

    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)


class Symptom(db.Model):
    __tablename__ = 'symptoms'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)

    # e.g., "fever", "cough", "chest pain"
    name = db.Column(db.String(120), nullable=False)

    # mild/moderate/severe OR free text
    severity = db.Column(db.String(50), nullable=True)

    duration = db.Column(db.String(50), nullable=True)  # "2 days", "3 hours"

    # Additional notes if needed
    notes = db.Column(db.Text, nullable=True)


class MedicalHistoryItem(db.Model):
    __tablename__ = 'medical_history_items'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)

    # e.g., "diabetes", "hypertension", "pregnancy", "TB"
    condition_name = db.Column(db.String(120), nullable=False)

    is_active = db.Column(db.Boolean, default=True)
    diagnosed_at = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)


# 5. Medications and risk scoring
class Medication(db.Model):
    __tablename__ = 'medications'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)

    # e.g., from OCR or worker input
    name = db.Column(db.String(120), nullable=False)
    dose = db.Column(db.String(120), nullable=True)  # "500 mg", "5 ml"
    frequency = db.Column(db.String(120), nullable=True)  # "BD", "TDS", etc.
    duration = db.Column(db.String(120), nullable=True)  # "3 days", etc.

    route = db.Column(db.String(50), nullable=True)  # oral, IV, IM
    is_antibiotic = db.Column(db.Boolean, default=False)
    is_otc = db.Column(db.Boolean, default=False)

    source = db.Column(db.String(50), nullable=True)  # "ocr", "manual", "doctor"


class MedicationRiskScore(db.Model):
    __tablename__ = 'medication_risk_scores'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)

    # numeric score computed from history
    score = db.Column(db.Integer, nullable=False, default=0)

    # low / medium / high
    risk_level = db.Column(db.String(20), nullable=False, default='low')

    # snapshot date when score was calculated
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)

    notes = db.Column(db.Text, nullable=True)


# 6. AI results, doctor notes, workflow coaching
class AIResult(db.Model):
    __tablename__ = 'ai_results'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False, unique=True)

    # Structured summary sections
    chief_complaint_summary = db.Column(db.Text, nullable=True)
    history_summary = db.Column(db.Text, nullable=True)
    exam_summary = db.Column(db.Text, nullable=True)
    vitals_interpretation = db.Column(db.Text, nullable=True)

    # Assessment
    risk_level = db.Column(db.String(20), nullable=True)
    possible_conditions = db.Column(db.Text, nullable=True)  # JSON string or comma-separated list
    recommended_action = db.Column(db.String(120), nullable=True)  # "first_aid", "consult_doctor", "refer_hospital"

    # Trustworthy AI explanations
    explanation_points = db.Column(db.Text, nullable=True)  # JSON string of bullet points
    guideline_match = db.Column(db.String(120), nullable=True)  # e.g., "PHC_pneumonia_protocol"

    generated_at = db.Column(db.DateTime, default=datetime.utcnow)


class DoctorNote(db.Model):
    __tablename__ = 'doctor_notes'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False, unique=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    note = db.Column(db.Text, nullable=True)

    final_recommendation = db.Column(db.String(50), nullable=True)
    # e.g., "manage_locally", "teleconsult_given", "refer_hospital"

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class WorkflowStepLog(db.Model):
    __tablename__ = 'workflow_step_logs'

    id = db.Column(db.Integer, primary_key=True)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)

    # e.g., "Q1", "Q2", "training_clip_bp"
    step_code = db.Column(db.String(50), nullable=False)

    # What the coach said / asked
    prompt_text = db.Column(db.Text, nullable=True)

    # Worker response (interpreted as text/yes/no/value)
    worker_response = db.Column(db.Text, nullable=True)

    # Timestamp
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# 7. Health education and community signals
class HealthEducationCard(db.Model):
    __tablename__ = 'health_education_cards'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)

    language = db.Column(db.String(10), default='en')

    # simple text content; can also store JSON for structured (title, bullets, icons)
    content_text = db.Column(db.Text, nullable=False)

    delivery_channel = db.Column(db.String(20), default='print')  # print / whatsapp / audio
    delivered = db.Column(db.Boolean, default=False)
    delivered_at = db.Column(db.DateTime, nullable=True)


class CommunitySignal(db.Model):
    __tablename__ = 'community_signals'

    id = db.Column(db.Integer, primary_key=True)

    village = db.Column(db.String(120), nullable=False)
    district = db.Column(db.String(120), nullable=True)
    state = db.Column(db.String(120), nullable=True, default='Uttar Pradesh')

    # e.g., "fever_spike", "bp_trend", "respiratory_outbreak"
    signal_type = db.Column(db.String(50), nullable=False)

    description = db.Column(db.Text, nullable=True)

    # numeric metric, e.g., count increase, percentage change
    metric_value = db.Column(db.Float, nullable=True)

    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# 8. OCR Document Processing
class OCRDocument(db.Model):
    __tablename__ = 'ocr_documents'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)

    # prescription / lab_report / other
    document_type = db.Column(db.String(50), default='other')

    # pending / processing / completed / failed
    status = db.Column(db.String(20), default='pending')

    raw_text = db.Column(db.Text, nullable=True)
    confidence_score = db.Column(db.Float, nullable=True)
    document_date = db.Column(db.DateTime, nullable=True)
    doctor_notes_text = db.Column(db.Text, nullable=True)

    error_message = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    patient = db.relationship('Patient', backref=db.backref('ocr_documents', lazy=True, cascade='all, delete-orphan'))
    uploaded_by = db.relationship('User', backref=db.backref('uploaded_ocr_documents', lazy=True))
    extracted_medications = db.relationship('ExtractedMedication', backref='ocr_document', lazy=True, cascade='all, delete-orphan')
    extracted_lab_results = db.relationship('ExtractedLabResult', backref='ocr_document', lazy=True, cascade='all, delete-orphan')


class ExtractedMedication(db.Model):
    __tablename__ = 'extracted_medications'

    id = db.Column(db.Integer, primary_key=True)
    ocr_document_id = db.Column(db.Integer, db.ForeignKey('ocr_documents.id'), nullable=False)

    name = db.Column(db.String(200), nullable=False)
    dosage = db.Column(db.String(120), nullable=True)
    frequency = db.Column(db.String(120), nullable=True)
    duration = db.Column(db.String(120), nullable=True)
    instructions = db.Column(db.Text, nullable=True)

    is_verified = db.Column(db.Boolean, default=False)

    # After sync, points to the canonical Medication record
    synced_medication_id = db.Column(db.Integer, db.ForeignKey('medications.id'), nullable=True)


class ExtractedLabResult(db.Model):
    __tablename__ = 'extracted_lab_results'

    id = db.Column(db.Integer, primary_key=True)
    ocr_document_id = db.Column(db.Integer, db.ForeignKey('ocr_documents.id'), nullable=False)

    test_name = db.Column(db.String(200), nullable=False)
    value = db.Column(db.String(100), nullable=True)
    unit = db.Column(db.String(50), nullable=True)
    reference_range = db.Column(db.String(100), nullable=True)

    # normal / high / low / critical
    flag = db.Column(db.String(20), nullable=True)

    is_verified = db.Column(db.Boolean, default=False)