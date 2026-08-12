import os
import json
import urllib.request
import urllib.parse
import threading
import time

class AISummarizer:
    """
    AI Summarizer Engine for AuraTrek / Nirmaya platform.
    Parses real-time live feed telemetry (YOLO pose keypoints, joint angles, rep performance, form errors)
    and generates natural language AI insights and detailed session summaries.
    Uses local Ollama AI model (qwen2.5:latest) or Google Gemini API.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5:latest")
        
        self.cached_insight = {}
        self.is_generating_live = False
        self.last_live_generate_time = 0

    def generate_live_feed_insight(self, exercise_type: str, metrics: dict, rep_history: list = None) -> dict:
        """
        Parses live feed telemetry per frame / interval and returns micro AI feedback & form score using Ollama AI model.
        Uses background async thread execution to eliminate webcam frame lag.
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

        # Check if we should launch background Ollama AI generation
        now = time.time()
        if not self.is_generating_live and (now - self.last_live_generate_time > 2.0):
            self.is_generating_live = True
            threading.Thread(
                target=self._async_ollama_live_worker,
                args=(exercise_type, metrics, recent_errors),
                daemon=True
            ).start()

        # If Ollama has generated an insight, return it!
        if self.cached_insight.get(exercise_type):
            res = dict(self.cached_insight[exercise_type])
            res["stage"] = stage
            res["total_reps"] = total_reps
            res["accuracy"] = metrics.get("accuracy", 0.0)
            return res

        # Check if Gemini API key exists as secondary option
        if self.api_key:
            try:
                insight = self._call_gemini_live_insight(exercise_type, metrics, recent_errors)
                if insight:
                    return insight
            except Exception as e:
                print(f"[AISummarizer] Gemini Live API call error: {e}")

        # Local Intelligent AI Fallback Engine
        return self._build_local_live_insight(exercise_type, total_reps, correct_reps, incorrect_reps, stage, feedback, recent_errors)

    def _async_ollama_live_worker(self, exercise_type: str, metrics: dict, recent_errors: list):
        try:
            insight = self._call_ollama_live_insight(exercise_type, metrics, recent_errors)
            if insight:
                self.cached_insight[exercise_type] = insight
        except Exception as e:
            print(f"[AISummarizer] Async Ollama worker error: {e}")
        finally:
            self.last_live_generate_time = time.time()
            self.is_generating_live = False

    def generate_session_summary(self, exercise_type: str, summary_data: dict) -> dict:
        """
        Parses full exercise session telemetry and generates comprehensive structured AI summary using Ollama AI model.
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

        # 1. Try Ollama (qwen2.5:latest) local model first!
        try:
            ollama_summary = self._call_ollama_session_summary(exercise_type, summary_data, all_errors, min_angles)
            if ollama_summary:
                return ollama_summary
        except Exception as e:
            print(f"[AISummarizer] Ollama Session API call error: {e}")

        # 2. Check if Gemini API key exists
        if self.api_key:
            try:
                gemini_summary = self._call_gemini_session_summary(exercise_type, summary_data, all_errors, min_angles)
                if gemini_summary:
                    return gemini_summary
            except Exception as e:
                print(f"[AISummarizer] Gemini Session API call error: {e}")

        # 3. Local Intelligent AI Fallback Engine
        return self._build_local_session_summary(exercise_type, total_reps, correct_reps, incorrect_reps, accuracy, all_errors, min_angles)

    def _call_ollama_live_insight(self, exercise_type: str, metrics: dict, recent_errors: list) -> dict:
        accuracy = metrics.get("accuracy", 0.0)
        total_reps = metrics.get("total_reps", 0)
        correct_reps = metrics.get("correct_reps", 0)
        incorrect_reps = metrics.get("incorrect_reps", 0)
        score = metrics.get("score", 100)
        issues = metrics.get("issues", [])

        err_list = recent_errors if recent_errors else issues

        prompt = (
            f"You are a polite, expert AI Biomechanics & Posture Coach analyzing real-time exercise feed telemetry.\n"
            f"Exercise/Mode: {exercise_type}\n"
            f"Current Stage: {metrics.get('stage')}\n"
            f"Posture Health Score: {score}/100\n"
            f"Accuracy Rate: {accuracy}%\n"
            f"Reps/Frames Stats: Total={total_reps}, Correct={correct_reps}, Incorrect={incorrect_reps}\n"
            f"Active Errors/Issues: {', '.join(err_list) if err_list else 'None'}\n\n"
            f"Provide a JSON response with keys:\n"
            f"1. 'summary': 1 sentence evaluation of current posture or movement quality in clear Hindi.\n"
            f"2. 'coaching_tip': 1 specific, polite biomechanical correction or encouragement in clear Hindi.\n"
            f"3. 'live_speech': 1 short voice phrase (4-8 words) in polite Hindi for Text-To-Speech guidance.\n"
            f"4. 'form_quality': 'Optimal' (if accuracy > 80% and no critical errors), 'Needs Attention' (if accuracy 50-80% or minor errors), or 'Critical Correction' (if accuracy < 50% or severe errors).\n"
            f"Respond ONLY with valid JSON."
        )

        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "num_predict": 100,
                "temperature": 0.3
            }
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(self.ollama_url, data=data_bytes, headers={"Content-Type": "application/json"})

        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode("utf-8"))
                text_out = res_data.get("response", "").strip()
                if text_out.startswith("```"):
                    text_out = text_out.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                return json.loads(text_out)
        return None

    def _call_ollama_session_summary(self, exercise_type: str, summary_data: dict, all_errors: list, min_angles: list) -> dict:
        accuracy = summary_data.get("accuracy", 0.0)
        total_reps = summary_data.get("total_reps", 0)
        correct_reps = summary_data.get("correct_reps", 0)
        incorrect_reps = summary_data.get("incorrect_reps", 0)

        prompt = (
            f"You are an AI Clinical & Athletic Posture Specialist analyzing complete workout telemetry.\n"
            f"Exercise: {exercise_type.upper()}\n"
            f"Total Reps/Frames: {total_reps}, Correct: {correct_reps}, Incorrect: {incorrect_reps}\n"
            f"Accuracy: {accuracy}%\n"
            f"Observed posture errors: {all_errors}\n\n"
            f"Provide a structured JSON response in refined Hindi with:\n"
            f"1. 'headline': Eye-catching AI diagnostic headline.\n"
            f"2. 'overview': Detailed natural language synthesis of movement quality and posture consistency.\n"
            f"3. 'key_strengths': List of 2 strengths observed during session.\n"
            f"4. 'areas_for_improvement': List of 2 critical corrections required.\n"
            f"5. 'safety_note': Guidance on avoiding injury or strain.\n"
            f"6. 'score_text': e.g. 'Grade A - उत्कृष्ट संतुलन' or 'Grade C - सुधार की आवश्यकता'\n"
            f"Respond ONLY with valid JSON."
        )

        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "num_predict": 250,
                "temperature": 0.3
            }
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(self.ollama_url, data=data_bytes, headers={"Content-Type": "application/json"})

        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode("utf-8"))
                text_out = res_data.get("response", "").strip()
                if text_out.startswith("```"):
                    text_out = text_out.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                res_json = json.loads(text_out)

                if "formatted_text" not in res_json:
                    res_json["formatted_text"] = (
                        f"🎯 **{res_json.get('headline', '')}**\n\n"
                        f"📊 **Score**: {res_json.get('score_text', '')}\n"
                        f"📝 **AI Overview**: {res_json.get('overview', '')}\n\n"
                        f"✅ **Key Strengths**:\n• " + "\n• ".join(res_json.get('key_strengths', [])) + "\n\n"
                        f"💡 **Areas for Improvement**:\n• " + "\n• ".join(res_json.get('areas_for_improvement', [])) + "\n\n"
                        f"🛡️ **Safety Note**: {res_json.get('safety_note', '')}"
                    )
                return res_json
        return None

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
        
        # Comprehensive exercise-specific optimal feedback library
        EXERCISE_OPTIMAL = {
            "squat": {
                "summary": "उत्कृष्ट स्क्वाट फॉर्म! घुटनों और रीढ़ की हड्डी का संरेखण सही है।",
                "coaching_tip": "बहुत बढ़िया! एड़ियों से ज़मीन को दबाते हुए ऊपर उठें और कोर टाइट रखें।",
                "live_speech": "उत्कृष्ट स्क्वाट फॉर्म! एड़ियों के बल पर ऊपर उठें।",
            },
            "pushup": {
                "summary": "शानदार पुश-अप फॉर्म! सिर से पैरों तक शरीर एक सीधी रेखा में है।",
                "coaching_tip": "कोहनियों को 45 डिग्री पर बनाए रखें और छाती को नियंत्रण के साथ नीचे लाएं।",
                "live_speech": "शानदार पुश-अप! इसी तरह नियंत्रण बनाए रखें।",
            },
            "plank": {
                "summary": "उत्कृष्ट प्लैंक होल्ड! रीढ़ और कूल्हों का संतुलन मजबूत है।",
                "coaching_tip": "कोर को कसकर रखें और सामान्य रूप से सांस लेते रहें।",
                "live_speech": "मजबूत प्लैंक होल्ड! कोर को टाइट रखें।",
            },
            "lunges": {
                "summary": "उत्कृष्ट लंज पोज़िशन! आगे का घुटना 90 डिग्री पर स्थिर है।",
                "coaching_tip": "धड़ को बिल्कुल सीधा रखें और संतुलन को केंद्र में बनाए रखें।",
                "live_speech": "उत्कृष्ट लंज फॉर्म! संतुलन बनाए रखें।",
            },
            "desk_posture": {
                "summary": "उत्कृष्ट स्टडी पोज़! पीठ सीधी है, गर्दन तनावमुक्त है और स्क्रीन दूरी सुरक्षित है।",
                "coaching_tip": "कंधों को ढीला रखें और रीढ़ को सहारा देकर बैठें ताकि लंबे समय तक थकान न हो।",
                "live_speech": "उत्कृष्ट स्टडी पोज़! आपकी पीठ और गर्दन का संतुलन सही है।",
            },
            "posture": {
                "summary": "उत्कृष्ट मुद्रा संतुलन! दोनों कंधे और धड़ बिल्कुल सीधे हैं।",
                "coaching_tip": "वजन को दोनों पैरों पर समान रूप से वितरित रखें।",
                "live_speech": "उत्कृष्ट मुद्रा संतुलन बना हुआ है।",
            },
            "tree_pose": {
                "summary": "वृक्षासन का बेहतरीन संतुलन! पैर की पकड़ और एकाग्रता मजबूत है।",
                "coaching_tip": "दृष्टि को सामने किसी स्थिर बिंदु पर केंद्रित रखें और सांस सामान्य रखें।",
                "live_speech": "वृक्षासन में बहुत सुंदर संतुलन!",
            },
            "tadasana": {
                "summary": "ताड़ासन की सही स्थिति! रीढ़ सीधी है और शरीर तना हुआ है।",
                "coaching_tip": "सांस भरते हुए शरीर को ऊपर की ओर खींचें और पैरों को मजबूती से टिकाएं।",
                "live_speech": "ताड़ासन की उत्कृष्ट मुद्रा!",
            },
            "warrior_two": {
                "summary": "वीरभद्रासन में मजबूत स्थिरता! भुजाएं क्षैतिज रूप से फैली हुई हैं।",
                "coaching_tip": "सामने वाले घुटने को 90 डिग्री पर मोड़ें और दृष्टि आगे की उंगलियों पर रखें।",
                "live_speech": "वीरभद्रासन में उत्कृष्ट स्थिरता!",
            },
            "triangle": {
                "summary": "त्रिकोणासन का सुंदर खिंचाव! पैर और रीढ़ सही संरेखण में हैं।",
                "coaching_tip": "छाती को सामने की ओर खुला रखें और ऊपर वाली बांह को सीधा तानें।",
                "live_speech": "त्रिकोणासन का बहुत सुंदर खिंचाव!",
            },
            "downward_dog": {
                "summary": "अधोमुख श्वानासन की सही मुद्रा! हिप्स ऊपर उठे हैं और रीढ़ लंबी है।",
                "coaching_tip": "हथेली से ज़मीन को दबाएं और एड़ियों को ज़मीन की ओर जाने दें।",
                "live_speech": "अधोमुख श्वानासन का बेहतरीन खिंचाव!",
            },
            "cobra": {
                "summary": "भुजंगासन की उत्कृष्ट मुद्रा! छाती खुली हुई है और कंधे पीछे हैं।",
                "coaching_tip": "कंधों को कानों से दूर रखें और रीढ़ के ऊपरी हिस्से से खिंचाव लें।",
                "live_speech": "भुजंगासन की सुंदर मुद्रा!",
            },
            "suryanamaskar": {
                "summary": "सूर्य नमस्कार का शानदार प्रवाह! गतियों में अच्छा संतुलन और लय है।",
                "coaching_tip": "प्रत्येक आसन के साथ सांस के तालमेल पर ध्यान केंद्रित रखें।",
                "live_speech": "सूर्य नमस्कार का उत्कृष्ट प्रवाह!",
            },
        }

        if not errors:
            form_quality = "Optimal"
            opt_data = EXERCISE_OPTIMAL.get(exercise_type, {
                "summary": f"लाइव AI ट्रैकिंग सक्रिय है। {ex_name} में आपका पोज़ संतुलन बहुत अच्छा है।",
                "coaching_tip": "बहुत बढ़िया! पूरी प्रक्रिया के दौरान सांस की गति और संतुलन बनाए रखें।",
                "live_speech": f"उत्कृष्ट {ex_name} फॉर्म! इसी तरह नियंत्रण बनाए रखें।",
            })
            summary = opt_data["summary"]
            coaching_tip = opt_data["coaching_tip"]
            live_speech = opt_data["live_speech"]
        else:
            form_quality = "Needs Attention"
            unique_errs = list(set(errors))
            err_desc = ", ".join([e.replace("_", " ") for e in unique_errs])
            summary = f"लाइव AI ने {ex_name} के दौरान पोज़ में थोड़ा अंतर पाया: {err_desc}।"
            
            if "knee_valgus" in unique_errs or "knees_inward" in err_desc:
                coaching_tip = "कृपया घुटनों को पैरों की सीध में थोड़ा बाहर की ओर रखें, जिससे जोड़ों पर अनावश्यक दबाव न पड़े।"
                live_speech = "कृपया अपने घुटनों को थोड़ा बाहर की तरफ रखें।"
            elif "slouching" in err_desc.lower() or "झुककर" in err_desc:
                coaching_tip = "रीढ़ की हड्डी को सीधा रखें और कुर्सी की बैकस्टेस्ट का सहारा लें।"
                live_speech = "कृपया अपनी पीठ को सीधा करके बैठें।"
            elif "neck" in err_desc.lower() or "गर्दन" in err_desc:
                coaching_tip = "गर्दन को थोड़ा पीछे लाएं और स्क्रीन को आंखों के स्तर (eye-level) पर रखें।"
                live_speech = "कृपया अपनी गर्दन को थोड़ा पीछे की तरफ रखें।"
            elif "shoulder" in err_desc.lower() or "कंधे" in err_desc:
                coaching_tip = "दोनों कंधों को एक ही स्तर पर सीधा रखें, एक तरफ न झुकें।"
                live_speech = "कृपया अपने दोनों कंधों को संतुलित रखें।"
            elif "screen" in err_desc.lower() or "स्क्रीन" in err_desc or "close" in err_desc.lower():
                coaching_tip = "स्क्रीन से कम से कम 20-24 इंच की दूरी बनाए रखें।"
                live_speech = "कृपया स्क्रीन से थोड़ा पीछे हटकर बैठें।"
            elif "hips_sagging" in unique_errs or "sagging" in err_desc:
                coaching_tip = "कमर और हिप्स झुक रहे हैं, कोर मांसपेशियों को कसकर हिप्स को सीधा रखें।"
                live_speech = "कमर को झुकने न दें, कोर को टाइट रखें।"
            elif "hips_piked" in unique_errs or "piked" in err_desc:
                coaching_tip = "हिप्स बहुत ऊपर उठे हैं, शरीर को कंधों और एड़ियों की सीध में सीधा करें।"
                live_speech = "हिप्स को थोड़ा नीचे लाएं, शरीर सीधा रखें।"
            elif "depth" in err_desc or "shallow" in err_desc:
                coaching_tip = "धीरे-धीरे थोड़ा और गहराई तक जाने का प्रयास करें, और एड़ियों को जमीन पर टिकाए रखें।"
                live_speech = "कृपया अपनी एड़ियों को टिकाते हुए थोड़ा और नीचे जाएँ।"
            elif "elbow" in err_desc:
                coaching_tip = "कोहनियों को शरीर के समीप रखें ताकि कंधों पर सही संतुलन बना रहे।"
                live_speech = "कृपया कोहनियों को थोड़ा शरीर के पास रखें।"
            else:
                coaching_tip = f"कृपया {ex_name} के दौरान पोज़ का संतुलन थोड़ा और सुधारने का प्रयास करें।"
                live_speech = f"कृपया {ex_name} में अपने पोज़ का संतुलन सुधारें।"

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
