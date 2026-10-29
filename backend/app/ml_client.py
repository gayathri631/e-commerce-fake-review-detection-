import os
import sys
from pathlib import Path
import httpx
from typing import Dict, Any

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001/predict")

async def score_review_with_ml(
    review_text: str,
    headline: str = "",
    rating: int = 5,
    product_title: str = "",
    product_category: str = ""
) -> Dict[str, Any]:
    """
    Dispatches a review to our standalone ML microservice.
    If the microservice is temporarily offline, falls back seamlessly to the
    integrated ML classifier loaded directly from disk or heuristic safety guardrail.
    """
    payload = {
        "review_text": review_text,
        "headline": headline,
        "rating": rating,
        "product_title": product_title,
        "product_category": product_category
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(ML_SERVICE_URL, json=payload)
            if response.status_code == 200:
                data = response.json()
                return {
                    "is_flagged": bool(data.get("is_flagged", False)),
                    "prediction_type": data.get("prediction_type", "NORMAL"),
                    "confidence": float(data.get("confidence", 0.95)),
                    "flag_reason": data.get("flag_reason")
                }
    except Exception as e:
        print(f"[Backend ML Client] Standalone ML service not reachable at {ML_SERVICE_URL}: {e}")

    # Fallback: Directly load and invoke classifier from ml_service directory
    try:
        root_dir = Path(__file__).resolve().parent.parent.parent
        ml_service_dir = root_dir / "ml_service"
        if str(ml_service_dir) not in sys.path:
            sys.path.insert(0, str(ml_service_dir))
        
        from classifier import classifier
        return classifier.predict(
            review_text=review_text,
            headline=headline,
            rating=rating,
            product_title=product_title,
            product_category=product_category
        )
    except Exception as local_err:
        print(f"[Backend ML Client] Local direct classifier fallback failed: {local_err}")

    # Safety inline fallback
    lower_text = f"{headline} {review_text}".lower()
    is_spam = any(w in lower_text for w in ["http", "www.", ".com", "telegram", "whatsapp", "crypto", "free money", "earn money"])
    is_inappropriate = any(w in lower_text for w in ["shut up", "idiot", "stupid", "bastard", "bitch", "kill", "threat"])
    is_chat = any(w in lower_text for w in ["anyone here", "what time", "hi guys", "hello guys", "assignment", "exam", "cricket"])

    if is_inappropriate:
        return {
            "is_flagged": True,
            "prediction_type": "INAPPROPRIATE",
            "confidence": 0.95,
            "flag_reason": "Contains abusive, toxic, or policy-violating language."
        }
    if is_spam:
        return {
            "is_flagged": True,
            "prediction_type": "PROMOTIONAL_SPAM",
            "confidence": 0.95,
            "flag_reason": "Contains promotional spam keywords or external links."
        }
    if is_chat:
        return {
            "is_flagged": True,
            "prediction_type": "IRRELEVANT",
            "confidence": 0.90,
            "flag_reason": "Conversational off-topic chat detected."
        }

    return {
        "is_flagged": False,
        "prediction_type": "NORMAL",
        "confidence": 0.95,
        "flag_reason": None
    }
