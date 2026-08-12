from datetime import datetime, timedelta
import random
from app import app  # Import your Flask app
from models import (
    db, User, Patient, Visit, VitalSign, Symptom, 
    MedicalHistoryItem, Medication, MedicationRiskScore, 
    AIResult, DoctorNote, WorkflowStepLog, HealthEducationCard, CommunitySignal
)

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        print("Seeding Users...")
        # 1. USERS (Health Workers, Doctors, Admin)
        users_data = [
            # Admins
            {"name": "Anita Sharma", "phone": "9876543210", "email": "anita.admin@health.org", "role": "admin", "preferred_language": "en"},
            # Doctors
            {"name": "Dr. Rajesh Kumar", "phone": "9876543211", "email": "rajesh.doc@health.org", "role": "doctor", "preferred_language": "hi"},
            {"name": "Dr. Sunita Patel", "phone": "9876543212", "email": "sunita.doc@health.org", "role": "doctor", "preferred_language": "en"},
            {"name": "Dr. Vikas Verma", "phone": "9876543213", "email": "vikas.doc@health.org", "role": "doctor", "preferred_language": "hi"},
            # Health Workers (ASHA / ANM)
            {"name": "Pooja Devi", "phone": "9876543214", "email": "pooja.worker@health.org", "role": "worker", "preferred_language": "hi"},
            {"name": "Kavita Singh", "phone": "9876543215", "email": "kavita.worker@health.org", "role": "worker", "preferred_language": "hi"},
            {"name": "Rani Yadav", "phone": "9876543216", "email": "rani.worker@health.org", "role": "worker", "preferred_language": "hi"},
            {"name": "Rekha Gupta", "phone": "9876543217", "email": "rekha.worker@health.org", "role": "worker", "preferred_language": "hi"},
            {"name": "Sunita Devi", "phone": "9876543218", "email": "sunita.worker@health.org", "role": "worker", "preferred_language": "hi"},
            {"name": "Meena Kumari", "phone": "9876543219", "email": "meena.worker@health.org", "role": "worker", "preferred_language": "hi"},
        ]

        users = []
        for u in users_data:
            user = User(
                name=u["name"],
                phone=u["phone"],
                email=u["email"],
                password_hash="pbkdf2:sha256:dummy_hash_for_testing",  # Standard placeholder
                role=u["role"],
                preferred_language=u["preferred_language"]
            )
            db.session.add(user)
            users.append(user)

        db.session.commit()

        # Separate users by role
        workers = [u for u in users if u.role == "worker"]
        doctors = [u for u in users if u.role == "doctor"]

        print("Seeding Patients...")
        # 2. PATIENTS
        patients_data = [
            {"name": "Ramesh Chandra", "age": 45, "gender": "M", "village": "Kakadeo", "district": "Kanpur Nagar", "phone": "9123456701"},
            {"name": "Sita Devi", "age": 32, "gender": "F", "village": "Bitiya", "district": "Kanpur Dehat", "phone": "9123456702"},
            {"name": "Ram Lal", "age": 62, "gender": "M", "village": "Shivrajpur", "district": "Kanpur Nagar", "phone": "9123456703"},
            {"name": "Priya Sharma", "age": 24, "gender": "F", "village": "Kakadeo", "district": "Kanpur Nagar", "phone": "9123456704"},
            {"name": "Chhotu Kumar", "age": 8, "gender": "M", "village": "Kalyanpur", "district": "Kanpur Nagar", "phone": "9123456705"},
            {"name": "Geeta Rani", "age": 50, "gender": "F", "village": "Bitiya", "district": "Kanpur Dehat", "phone": "9123456706"},
            {"name": "Suresh Prasad", "age": 55, "gender": "M", "village": "Shivrajpur", "district": "Kanpur Nagar", "phone": "9123456707"},
            {"name": "Amina Khatun", "age": 29, "gender": "F", "village": "Kalyanpur", "district": "Kanpur Nagar", "phone": "9123456708"},
            {"name": "Harish Singh", "age": 40, "gender": "M", "village": "Kakadeo", "district": "Kanpur Nagar", "phone": "9123456709"},
            {"name": "Suman Mishra", "age": 36, "gender": "F", "village": "Bitiya", "district": "Kanpur Dehat", "phone": "9123456710"},
        ]

        patients = []
        for idx, p in enumerate(patients_data):
            assigned_worker = random.choice(workers)
            patient = Patient(
                external_id=f"PAT-2026-{1000 + idx}",
                name=p["name"],
                age=p["age"],
                gender=p["gender"],
                village=p["village"],
                district=p["district"],
                state="Uttar Pradesh",
                phone=p["phone"],
                created_by_id=assigned_worker.id
            )
            db.session.add(patient)
            patients.append(patient)

        db.session.commit()

        print("Seeding Medical History...")
        # 3. MEDICAL HISTORY
        conditions = ["Hypertension", "Diabetes Type 2", "Asthma", "Tuberculosis (Past)", "Anemia"]
        for patient in patients:
            if random.choice([True, False]):
                history = MedicalHistoryItem(
                    patient_id=patient.id,
                    condition_name=random.choice(conditions),
                    is_active=True,
                    diagnosed_at=datetime.utcnow() - timedelta(days=random.randint(100, 1000)),
                    notes="Diagnosed during community health screening."
                )
                db.session.add(history)

        db.session.commit()

        print("Seeding Visits and Encounter Data...")
        # 4. VISITS & RELATED CLINICAL DATA
        complaints = [
            ("High fever with chills", "fever", "3 days", "high"),
            ("Persistent dry cough and fatigue", "cough", "1 week", "medium"),
            ("Severe chest tightness and dyspnea", "chest pain", "2 hours", "emergency"),
            ("Mild headache and body pain", "body ache", "1 day", "low"),
            ("Acute abdominal pain and nausea", "stomach pain", "5 hours", "medium")
        ]

        for idx, patient in enumerate(patients):
            worker = random.choice(workers)
            doctor = random.choice(doctors)
            chief, symptom_name, dur, risk = random.choice(complaints)

            visit = Visit(
                patient_id=patient.id,
                created_by_id=worker.id,
                chief_complaint=chief,
                symptoms_text=f"Patient complains of {symptom_name} lasting for {dur}.",
                duration_text=dur,
                risk_level=risk,
                status=random.choice(["pending_doctor", "completed", "referred"]),
                connectivity_mode=random.choice(["online", "offline", "sms"]),
                language="hi" if idx % 2 == 0 else "en"
            )
            db.session.add(visit)
            db.session.flush()  # To populate visit.id

            # Vitals
            vitals = VitalSign(
                visit_id=visit.id,
                temperature=round(random.uniform(36.5, 39.5), 1),
                systolic_bp=random.randint(110, 160),
                diastolic_bp=random.randint(70, 100),
                pulse=random.randint(65, 110),
                spo2=random.randint(91, 99),
                respiratory_rate=random.randint(16, 26)
            )
            db.session.add(vitals)

            # Symptom Record
            symptom = Symptom(
                visit_id=visit.id,
                name=symptom_name,
                severity="severe" if risk in ["high", "emergency"] else "moderate",
                duration=dur,
                notes="Patient reported onset after evening meal."
            )
            db.session.add(symptom)

            # Medication Record
            med = Medication(
                visit_id=visit.id,
                name="Paracetamol" if symptom_name == "fever" else "Amoxicillin",
                dose="500 mg",
                frequency="BD",
                duration="5 days",
                route="oral",
                is_antibiotic=True if symptom_name == "cough" else False,
                is_otc=True,
                source="ocr"
            )
            db.session.add(med)

            # AI Result Record
            ai_res = AIResult(
                visit_id=visit.id,
                chief_complaint_summary=chief,
                history_summary="No major prior allergies noted.",
                exam_summary="Febrile appearance, chest clear to auscultation.",
                vitals_interpretation="Elevated body temperature." if vitals.temperature > 37.5 else "Vitals stable.",
                risk_level=risk,
                possible_conditions='["Viral Fever", "Malaria", "Upper Respiratory Tract Infection"]',
                recommended_action="consult_doctor" if risk != "emergency" else "refer_hospital",
                explanation_points='["Temperature > 38.0 C", "Duration less than 5 days"]',
                guideline_match="PHC_febrile_illness_protocol"
            )
            db.session.add(ai_res)

            # Doctor Note (if completed or referred)
            if visit.status in ["completed", "referred"]:
                doc_note = DoctorNote(
                    visit_id=visit.id,
                    doctor_id=doctor.id,
                    note="Advised oral rehydration, antipyretics, and blood test if fever persists for 48 hours.",
                    final_recommendation="manage_locally" if risk != "emergency" else "refer_hospital"
                )
                db.session.add(doc_note)

            # Education Card
            edu_card = HealthEducationCard(
                patient_id=patient.id,
                visit_id=visit.id,
                language=visit.language,
                content_text="Drink plenty of fluids. Rest in a well-ventilated room.",
                delivery_channel="whatsapp",
                delivered=True,
                delivered_at=datetime.utcnow()
            )
            db.session.add(edu_card)

        print("Seeding Community Signals...")
        # 5. COMMUNITY SIGNALS
        signals = [
            CommunitySignal(
                village="Kakadeo",
                district="Kanpur Nagar",
                signal_type="fever_spike",
                description="Increase in acute febrile cases detected past week.",
                metric_value=25.0,
                start_date=datetime.utcnow() - timedelta(days=7),
                end_date=datetime.utcnow()
            ),
            CommunitySignal(
                village="Bitiya",
                district="Kanpur Dehat",
                signal_type="respiratory_outbreak",
                description="Cluster of seasonal cough and throat infection cases.",
                metric_value=12.5,
                start_date=datetime.utcnow() - timedelta(days=5),
                end_date=datetime.utcnow()
            )
        ]
        db.session.add_all(signals)

        db.session.commit()
        print("Database successfully seeded with dummy data!")

if __name__ == "__main__":
    seed_database()