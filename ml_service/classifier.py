import os
import re
from pathlib import Path
from typing import Dict, Any, Optional

class ReviewClassifier:
    """
    Fake / Off-Topic / Chat Review Classifier Microservice Engine.
    
    Integrated with our newly trained 4-Class ML Model:
    - NORMAL: Authentic customer review evaluating product features/experience
    - IRRELEVANT: Off-topic discussion, chat, or comments with zero product evaluation
    - PROMOTIONAL_SPAM: Commercial spam, promotional links, channel ads, discount solicitations
    - INAPPROPRIATE: Toxicity, violent threats, hate speech, severe harassment
    
    Trained Architecture: Word (1,2) + Char (3,5) TF-IDF FeatureUnion + Calibrated Linear SVM (LinearSVC).
    Includes secondary heuristic safety fallback.
    """

    def __init__(self, model_path: Optional[str] = None):
        default_path = Path(__file__).resolve().parent / "fake_review_model.pkl"
        self.model_path = Path(model_path) if model_path else Path(os.getenv("ML_MODEL_PATH", str(default_path)))
        self.trained_model = None
        self.model_metadata = {
            "model_type": "Unknown",
            "classes": ["INAPPROPRIATE", "IRRELEVANT", "NORMAL", "PROMOTIONAL_SPAM"],
            "accuracy": 0.9507
        }
        self._load_trained_model()

    def _load_trained_model(self):
        """Loads our newly trained scikit-learn ML pipeline."""
        if self.model_path.exists():
            try:
                import joblib
                self.trained_model = joblib.load(self.model_path)
                self.model_metadata["model_type"] = "Calibrated Linear SVM (LinearSVC) Pipeline"
                print(f"[ML Service] Successfully loaded trained ML model from {self.model_path}")
            except Exception as e:
                print(f"[ML Service] Warning: Could not load trained ML model from {self.model_path}: {e}")
                self.trained_model = None
        else:
            print(f"[ML Service] Warning: Model file {self.model_path} not found. Heuristic engine active.")

    def predict(
        self,
        review_text: str,
        headline: str = "",
        rating: int = 5,
        product_title: str = "",
        product_category: str = ""
    ) -> Dict[str, Any]:
        """
        Classifies review text using the trained 4-class ML model into:
        - NORMAL
        - IRRELEVANT
        - PROMOTIONAL_SPAM
        - INAPPROPRIATE
        """
        review_clean = (review_text or "").strip()
        headline_clean = (headline or "").strip()
        
        # Combine headline and review text as done during model training
        if headline_clean:
            combined_text = f"{headline_clean}. {review_clean}"
        else:
            combined_text = review_clean

        if not combined_text:
            return {
                "is_flagged": True,
                "prediction_type": "IRRELEVANT",
                "confidence": 1.0,
                "flag_reason": "Empty review submission.",
                "class_probabilities": {},
                "model_source": "system_guardrail"
            }

        # 1. Primary Inference: Newly Trained ML Model Pipeline
        if self.trained_model is None:
            self._load_trained_model()

        if self.trained_model is not None:
            try:
                prediction = str(self.trained_model.predict([combined_text])[0]).upper()
                class_probs = {}
                proba = 0.95

                if hasattr(self.trained_model, "predict_proba"):
                    probs = self.trained_model.predict_proba([combined_text])[0]
                    classes = getattr(self.trained_model, "classes_", [
                        "INAPPROPRIATE", "IRRELEVANT", "NORMAL", "PROMOTIONAL_SPAM"
                    ])
                    class_probs = {cls: round(float(p), 4) for cls, p in zip(classes, probs)}
                    proba = float(max(probs))

                # Normalize classification output
                if prediction in ["NORMAL", "GENUINE"]:
                    return {
                        "is_flagged": False,
                        "prediction_type": "NORMAL",
                        "confidence": round(proba, 4),
                        "flag_reason": None,
                        "class_probabilities": class_probs,
                        "model_source": "trained_ml_model"
                    }
                elif prediction == "IRRELEVANT":
                    return {
                        "is_flagged": True,
                        "prediction_type": "IRRELEVANT",
                        "confidence": round(proba, 4),
                        "flag_reason": "Flagged as Irrelevant by ML: Content does not evaluate product features or performance.",
                        "class_probabilities": class_probs,
                        "model_source": "trained_ml_model"
                    }
                elif prediction in ["PROMOTIONAL_SPAM", "SPAM"]:
                    return {
                        "is_flagged": True,
                        "prediction_type": "PROMOTIONAL_SPAM",
                        "confidence": round(proba, 4),
                        "flag_reason": "Flagged as Promotional Spam by ML: Unsolicited commercial advertising, affiliate links, or promo codes.",
                        "class_probabilities": class_probs,
                        "model_source": "trained_ml_model"
                    }
                elif prediction in ["INAPPROPRIATE", "ABUSIVE"]:
                    return {
                        "is_flagged": True,
                        "prediction_type": "INAPPROPRIATE",
                        "confidence": round(proba, 4),
                        "flag_reason": "Flagged as Inappropriate by ML: Abusive, toxic, harassing, or policy-violating language detected.",
                        "class_probabilities": class_probs,
                        "model_source": "trained_ml_model"
                    }
                else:
                    # Fallback for unexpected label
                    is_flagged = prediction != "NORMAL"
                    return {
                        "is_flagged": is_flagged,
                        "prediction_type": prediction,
                        "confidence": round(proba, 4),
                        "flag_reason": f"Flagged by ML model as {prediction}" if is_flagged else None,
                        "class_probabilities": class_probs,
                        "model_source": "trained_ml_model"
                    }

            except Exception as err:
                print(f"[ML Service] Error during ML pipeline inference: {err}. Falling back to heuristic.")

        # 2. Heuristic Safety Fallback Engine (Used only if model file is unavailable)
        lower_text = combined_text.lower()

        # Check for Promotional Spam
        spam_patterns = [
            r"https?://\S+", r"www\.\S+", r"\.com\b", r"\.in\b", r"\.org\b",
            r"\btelegram\b", r"\bwhatsapp\b", r"\bcall me at\b", r"\bcontact me\b",
            r"\bfree recharge\b", r"\bearn money\b", r"\bwork from home\b",
            r"\bcrypto\b", r"\bbitcoin\b", r"\bclick here\b", r"\bdiscount code\b",
            r"\+?\d{10,12}"
        ]
        for pattern in spam_patterns:
            if re.search(pattern, lower_text):
                return {
                    "is_flagged": True,
                    "prediction_type": "PROMOTIONAL_SPAM",
                    "confidence": 0.98,
                    "flag_reason": "Contains external links, contact details, or promotional spam keywords.",
                    "class_probabilities": {},
                    "model_source": "heuristic_fallback"
                }

        # Check for Inappropriate / Toxicity
        inappropriate_words = [
            "shut your mouth", "idiot", "stupid", "bastard", "bitch", "kill", "threat", "hate you", "f***"
        ]
        if any(w in lower_text for w in inappropriate_words):
            return {
                "is_flagged": True,
                "prediction_type": "INAPPROPRIATE",
                "confidence": 0.96,
                "flag_reason": "Violates safety and community standards.",
                "class_probabilities": {},
                "model_source": "heuristic_fallback"
            }

        # Check for Irrelevant / Conversational Off-Topic Chatter
        chat_patterns = [
            r"\bhi guys\b", r"\bhello guys\b", r"\banyone here\b", r"\banybody here\b",
            r"\bwho is from\b", r"\bwhich college\b", r"\bwhat time\b", r"\bexam\b",
            r"\bassignment\b", r"\bteacher\b", r"\bclass\b", r"\bsemester\b",
            r"\bhow are you\b", r"\bwhats up\b", r"\bwhat's up\b", r"\bsup guys\b",
            r"\bmeet me\b", r"\blet's play\b", r"\bgaming group\b", r"\bfollow me\b",
            r"\bcricket\b", r"\bmatch tomorrow\b"
        ]
        if any(re.search(p, lower_text) for p in chat_patterns):
            return {
                "is_flagged": True,
                "prediction_type": "IRRELEVANT",
                "confidence": 0.92,
                "flag_reason": "Conversational chatter detected. Content does not evaluate the product.",
                "class_probabilities": {},
                "model_source": "heuristic_fallback"
            }

        # Otherwise: NORMAL legitimate review
        return {
            "is_flagged": False,
            "prediction_type": "NORMAL",
            "confidence": 0.95,
            "flag_reason": None,
            "class_probabilities": {},
            "model_source": "heuristic_fallback"
        }

classifier = ReviewClassifier()
