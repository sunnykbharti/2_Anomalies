import os
import json
import urllib.request
import urllib.parse

class AISummarizer:
    """
    AI Summarizer Engine for AuraTrek / Nirmaya platform.
    Parses real-time live feed telemetry (YOLO pose keypoints, joint angles, rep performance, form errors)
    and generates natural language AI insights and detailed session summaries.
    Uses Google Gemini API if available, or falls back to an intelligent local heuristic AI synthesis engine.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def generate_live_feed_insight(self, exercise_type: str, metrics: dict, rep_history: list = None) -> dict:
        """
        Parses live feed telemetry per frame / interval and returns micro AI feedback & form score.
        """
        stage = metrics.get("stage", "detecting")
        total_reps = metrics.get("total_reps", 0)
        correct_reps = metrics.get("correct_reps", 0)
        incorrect_reps = metrics.get("incorrect_reps", 0)
        feedback = metrics.get("feedback", "")
        
        rep_history = rep_history or []
        recent_errors = []
        for rep in rep_history[-3:]:
            if isinstance(rep, dict) and "errors" in rep:
                recent_errors.extend(rep.get("errors", []))

        # Check if Gemini API key exists
        if self.api_key:
            try:
                insight = self._call_gemini_live_insight(exercise_type, metrics, recent_errors)
                if insight:
                    return insight
            except Exception as e:
                print(f"[AISummarizer] Gemini Live API call error: {e}")

        # Local Intelligent AI Fallback Engine
        return self._build_local_live_insight(exercise_type, total_reps, correct_reps, incorrect_reps, stage, feedback, recent_errors)

    def generate_session_summary(self, exercise_type: str, summary_data: dict) -> dict:
        """
        Parses full exercise session telemetry and generates comprehensive structured AI summary.
        """
        total_reps = summary_data.get("total_reps", 0)
        correct_reps = summary_data.get("correct_reps", 0)
        incorrect_reps = summary_data.get("incorrect_reps", 0)
        accuracy = summary_data.get("accuracy", 0.0)
        rep_log = summary_data.get("rep_log", [])

        # Collect all errors across session
        all_errors = []
        min_angles = []
        for rep in rep_log:
            if isinstance(rep, dict):
                all_errors.extend(rep.get("errors", []))
                if "min_angle" in rep and rep["min_angle"] is not None:
                    min_angles.append(rep["min_angle"])

        if self.api_key:
            try:
                gemini_summary = self._call_gemini_session_summary(exercise_type, summary_data, all_errors, min_angles)
                if gemini_summary:
                    return gemini_summary
            except Exception as e:
                print(f"[AISummarizer] Gemini Session API call error: {e}")

        # Local Intelligent AI Fallback Engine
        return self._build_local_session_summary(exercise_type, total_reps, correct_reps, incorrect_reps, accuracy, all_errors, min_angles)

    def _call_gemini_live_insight(self, exercise_type: str, metrics: dict, recent_errors: list) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt = (
            f"You are a polite, encouraging AI Biomechanics Coach giving real-time live voice guidance in clear, refined Hindi.\n"
            f"Exercise: {exercise_type}\n"
            f"Current Stage: {metrics.get('stage')}\n"
            f"Reps Completed: {metrics.get('total_reps', 0)} (Correct: {metrics.get('correct_reps', 0)}, Incorrect: {metrics.get('incorrect_reps', 0)})\n"
            f"Recent posture errors detected: {', '.join(recent_errors) if recent_errors else 'None'}\n\n"
            f"Provide a concise JSON response with keys:\n"
            f"1. 'summary': 1 sentence summary in refined Hindi.\n"
            f"2. 'coaching_tip': polite and refined Hindi biomechanical advice.\n"
            f"3. 'live_speech': polite, refined, encouraging Hindi voice phrase (4-8 words) for Text-To-Speech (e.g. 'कृपया अपने घुटनों को थोड़ा बाहर रखें', 'बहुत बढ़िया! इसी तरह नियंत्रण बनाए रखें'). Avoid blunt or direct commands.\n"
            f"4. 'form_quality': 'Optimal', 'Needs Attention', or 'Critical Correction'.\n"
            f"Respond ONLY with valid JSON."
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode("utf-8"))
                content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(content)
        return None

    def _call_gemini_session_summary(self, exercise_type: str, summary_data: dict, all_errors: list, min_angles: list) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt = (
            f"You are an AI Clinical & Athletic Posture Specialist analyzing complete live exercise feed session data.\n"
            f"Exercise: {exercise_type.upper()}\n"
            f"Total Reps: {summary_data.get('total_reps')}, Correct: {summary_data.get('correct_reps')}, Incorrect: {summary_data.get('incorrect_reps')}\n"
            f"Accuracy: {summary_data.get('accuracy')}%\n"
            f"Observed posture errors: {all_errors}\n"
            f"Joint Angle Range: {min(min_angles) if min_angles else 'N/A'}° to {max(min_angles) if min_angles else 'N/A'}°\n\n"
            f"Provide a structured JSON response in refined Hindi with:\n"
            f"1. 'headline': Eye-catching AI diagnostic headline.\n"
            f"2. 'overview': Detailed natural language synthesis of movement quality and biomechanical consistency.\n"
            f"3. 'key_strengths': List of 2 strengths observed during live feed.\n"
            f"4. 'areas_for_improvement': List of 2 critical corrections required.\n"
            f"5. 'safety_note': Guidance on avoiding injury or strain.\n"
            f"6. 'score_text': e.g. 'Grade A - उत्कृष्ट संतुलन'\n"
            f"Respond ONLY with valid JSON."
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=6) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode("utf-8"))
                content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(content)
        return None

    def _build_local_live_insight(self, exercise_type: str, total: int, correct: int, incorrect: int, stage: str, feedback: str, errors: list) -> dict:
        ex_name = exercise_type.replace("_", " ").title()
        
        if not errors:
            form_quality = "Optimal"
            summary = f"लाइव AI ट्रैकिंग सक्रिय है। {ex_name} में आपका पोज़ संतुलन बहुत अच्छा है।"
            coaching_tip = "बहुत बढ़िया! पूरी प्रक्रिया के दौरान सांस की गति और संतुलन बनाए रखें।"
            live_speech = "बहुत सुंदर प्रयास! इसी तरह नियंत्रण बनाए रखें।"
        else:
            form_quality = "Needs Attention"
            unique_errs = list(set(errors))
            err_desc = ", ".join([e.replace("_", " ") for e in unique_errs])
            summary = f"लाइव AI ने {ex_name} के दौरान पोज़ में थोड़ा अंतर पाया: {err_desc}।"
            
            if "knee_valgus" in unique_errs or "knees_inward" in err_desc:
                coaching_tip = "कृपया घुटनों को पैरों की सीध में थोड़ा बाहर की ओर रखें, जिससे जोड़ों पर अनावश्यक दबाव न पड़े।"
                live_speech = "कृपया अपने घुटनों को थोड़ा बाहर की तरफ रखें।"
            elif "depth" in err_desc or "shallow" in err_desc:
                coaching_tip = "धीरे-धीरे थोड़ा और गहराई तक जाने का प्रयास करें, और एड़ियों को जमीन पर टिकाए रखें।"
                live_speech = "कृपया अपनी एड़ियों को टिकाते हुए थोड़ा और नीचे जाएँ।"
            elif "elbow" in err_desc:
                coaching_tip = "कोहनियों को शरीर के समीप रखें ताकि कंधों पर सही संतुलन बना रहे।"
                live_speech = "कृपया कोहनियों को थोड़ा शरीर के पास रखें।"
            else:
                coaching_tip = "कृपया अपने शरीर और पीठ का संतुलन थोड़ा और सुधारने का प्रयास करें।"
                live_speech = "कृपया अपने पोज़ का संतुलन थोड़ा और सुधारें।"

        if incorrect > correct and total > 2:
            form_quality = "Critical Correction"

        return {
            "summary": summary,
            "coaching_tip": coaching_tip,
            "live_speech": live_speech,
            "form_quality": form_quality,
            "stage": stage,
            "total_reps": total,
            "accuracy": round((correct / total * 100) if total > 0 else 100, 1),
        }

    def _build_local_session_summary(self, exercise_type: str, total: int, correct: int, incorrect: int, accuracy: float, all_errors: list, min_angles: list) -> dict:
        ex_name = exercise_type.replace("_", " ").title()
        
        if total == 0:
            return {
                "headline": f"Short {ex_name} Session Completed",
                "overview": "The live feed recorded a brief camera session without complete repetition tracking.",
                "key_strengths": ["Quick posture check initialized.", "Camera tracking remained active."],
                "areas_for_improvement": ["Complete full range-of-motion reps to enable complete AI joint scoring."],
                "safety_note": "Position yourself fully in frame with proper lighting.",
                "score_text": "Session Incomplete",
                "formatted_text": f"Short {ex_name} Session. Position yourself fully in frame to complete full reps."
            }

        # Error frequency calculation
        err_counts = {}
        for e in all_errors:
            clean_e = e.replace("_", " ").title()
            err_counts[clean_e] = err_counts.get(clean_e, 0) + 1

        top_errors = sorted(err_counts.items(), key=lambda x: x[1], reverse=True)

        if accuracy >= 85:
            headline = f"Excellent {ex_name} Performance! 🌟"
            score_text = "Grade A+ • Outstanding Biomechanics"
            overview = (
                f"AI live feed analysis confirmed top-tier performance for your {ex_name} session. "
                f"You completed {correct} out of {total} reps ({accuracy}%) with consistent joint symmetry "
                f"and smooth movement velocity."
            )
            strengths = [
                f"High movement accuracy ({accuracy}% correct reps).",
                "Excellent joint alignment and depth stability throughout sets."
            ]
            improvements = [
                "Keep pace steady to avoid sudden acceleration on peak strain.",
                "Focus on breathing rhythm during transition phases."
            ]
            safety = "Great form! Continue maintaining smooth transitions to keep stress off ligaments."
        elif accuracy >= 60:
            headline = f"Solid {ex_name} Session with Key Focus Areas 🎯"
            score_text = f"Grade B • {accuracy}% Form Compliance"
            most_common = top_errors[0][0] if top_errors else "posture strain"
            overview = (
                f"During your live feed {ex_name} session, AI tracked {total} total reps with {correct} clean reps. "
                f"The primary error detected across live frames was '{most_common}'."
            )
            strengths = [
                f"Completed {total} full repetitions.",
                "Strong effort maintaining cadence under repetition workload."
            ]
            improvements = [
                f"Primary correction needed: reduce instances of {most_common}.",
                "Control movement tempo to prevent joint sway at peak flex."
            ]
            safety = "Pay extra attention when fatigue sets in, as joint alignment tends to break down."
        else:
            headline = f"{ex_name} Form Correction Recommended ⚠️"
            score_text = f"Grade C • Focus on Form over Rep Count"
            most_common = top_errors[0][0] if top_errors else "posture instability"
            overview = (
                f"AI telemetry live parsing flagged multiple posture inconsistencies during this {ex_name} session. "
                f"Only {correct} of {total} reps met safety threshold standards ({accuracy}% accuracy). "
                f"Frequent issue detected: {most_common}."
            )
            strengths = [
                "Good camera positioning and full detection tracking achieved.",
                "High engagement throughout the live stream session."
            ]
            improvements = [
                f"Address frequent issue: {most_common}.",
                "Slow down movement to focus strictly on joint angle control over speed."
            ]
            safety = "Consider lowering reps or doing assisted warmups until posture alignment stabilizes."

        formatted_text = (
            f"🎯 **{headline}**\n\n"
            f"📊 **Score**: {score_text}\n"
            f"📝 **AI Overview**: {overview}\n\n"
            f"✅ **Key Strengths**:\n• " + "\n• ".join(strengths) + "\n\n"
            f"💡 **Areas for Improvement**:\n• " + "\n• ".join(improvements) + "\n\n"
            f"🛡️ **Safety Note**: {safety}"
        )

        return {
            "headline": headline,
            "overview": overview,
            "key_strengths": strengths,
            "areas_for_improvement": improvements,
            "safety_note": safety,
            "score_text": score_text,
            "formatted_text": formatted_text,
            "accuracy": accuracy,
            "total_reps": total,
            "correct_reps": correct,
            "incorrect_reps": incorrect,
        }

# Global singleton instance
ai_summarizer = AISummarizer()
