# 🏥 Virtual Village Clinic (NIRMAYA)

> **Transforming rural health centers into AI-assisted, doctor-connected virtual clinics with multi-lingual triage, offline SMS fallback, and community outbreak detection.**

---

## 📌 Problem Statement

Rural health centers often operate with trained health workers but face a severe shortage of qualified doctors. Villagers traveling to nearest hospitals lose critical hours. **Virtual Village Clinic** empowers local health workers with AI-driven intake, document OCR, safety-first clinical decision support, protocol-based first aid, and seamless remote doctor collaboration—even in low-connectivity environments.

---

## 🚀 Key Features

### 1. Smart Patient Intake
* 📝 **Guided Intake Form:** Standardized collection of symptoms, duration, history, and vitals (BP, SpO2, Pulse, Temp).
* 📷 **Visual Symptom Upload:** Capture high-res images of wounds, rashes, or visible injuries.
* 🎙️ **Voice Input & Translation:** Hands-free speech intake translated into structured medical clinical data in real time.

### 2. AI Clinical Engine & Triage
* 🔍 **Symptom Analysis:** Generates structured SOAP notes (Subjective, Objective, Assessment, Plan).
* 🩺 **Preliminary Assessment & Triage:** Automatically triages into **Green (First Aid)**, **Yellow (Doctor Review Required)**, and **Red (Emergency Referral)**.
* 💊 **OTC & Next Steps Guidance:** Suggests appropriate, safety-checked OTC medicines or immediate referral pathways.

### 3. Protocol-Based First Aid Guidance
* 🎨 **Visual Aid Support:** Interactive, step-by-step visual instructions for wound cleaning, dressing (*patti*), and emergency stabilization.
* ⚖️ **Safety & Dosage Checks:** Enforces strict dosage limits based on age, weight, and clinical constraints.

### 4. Remote Doctor Collaboration Portal
* 📊 **Doctor Dashboard:** View patient timelines, uploaded diagnostic reports, and visual symptoms at a glance.
* 💬 **Tele-Consultation:** Built-in chat and audio/video consult capabilities.
* ✍️ **Doctor Action Hub:** 1-click workflows to add notes, confirm/modify preliminary assessments, or trigger hospital referrals/follow-ups.

### 5. Medical Document OCR
* 📄 **Prescription & Lab OCR:** Camera-based capture of physical prescriptions and lab reports using OCR + NLP.
* 📜 **Automated Medical History:** Auto-extracts past medication names and dosages directly into the digital patient health timeline.

### 6. Safety & Rule Engine
* 🚨 **Hardcoded Red Flags:** Rule-based triggers for critical symptoms (e.g., chest pain, severe dyspnea) forcing immediate hospital referral.
* 👶 **Age Band Restrictions:** Automated restrictions on OTC suggestions for pediatric and geriatric patient groups.
* 🛡️ **Assisted-Only Framework:** System explicitly acts as a co-pilot and never claims to replace professional medical diagnosis.

### 7. Unique & Out-of-the-Box Capabilities (Moat)
* 🏛️ **Government Protocol Alignment:** Cross-references recommendations with local government rural health guidelines and tracks doctor overrides to refine safety models.
* 📶 **Offline-First & SMS Fallback:** Generates compressed SMS instruction packets on zero internet; auto-syncs to cloud when connectivity restores.
* ⚠️ **Irrational Medicine Detection:** Real-time checking to flag risky or harmful drug combinations.
* 📈 **Community Syndromic Outbreak Tracking:** Aggregates village-level symptoms (e.g., sudden spike in fever + cough over 3 days) to flag potential local epidemic outbreaks.
* 💡 **Health Literacy Focus:** Explains treatment plans to patients in clear, accessible local language terms.

---

## 🏗️ System Workflow Architecture










🛡️ Medical Disclaimer
This software is designed solely as a clinical decision-support co-pilot for trained health workers operating under doctor supervision. It does not provide independent medical diagnoses or replace licensed physicians.
