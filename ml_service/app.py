from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from classifier import classifier

app = FastAPI(
    title="Fake & Off-Topic Review Detection ML Microservice",
    description="Standalone Microservice for ML 4-Class Review Classification and Moderation",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    review_text: str
    headline: Optional[str] = ""
    rating: int = 5
    product_title: Optional[str] = ""
    product_category: Optional[str] = ""

class PredictResponse(BaseModel):
    is_flagged: bool
    prediction_type: str
    confidence: float
    flag_reason: Optional[str] = None
    class_probabilities: Optional[Dict[str, float]] = None
    model_source: Optional[str] = None

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Fake Review & Off-Topic Chat Detection ML Microservice",
        "active_model": classifier.model_metadata.get("model_type", "Calibrated Linear SVM"),
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": classifier.trained_model is not None,
        "classes": classifier.model_metadata.get("classes", [])
    }

@app.get("/model-info")
def model_info():
    return {
        "model_architecture": "Word (1,2) + Char (3,5) TF-IDF FeatureUnion + Calibrated Linear SVM",
        "features_dimension": 65000,
        "classes": ["INAPPROPRIATE", "IRRELEVANT", "NORMAL", "PROMOTIONAL_SPAM"],
        "held_out_test_accuracy": 0.9507,
        "macro_f1_score": 0.9507,
        "model_loaded": classifier.trained_model is not None
    }

@app.post("/predict", response_model=PredictResponse)
def predict_review(req: PredictRequest):
    result = classifier.predict(
        review_text=req.review_text,
        headline=req.headline or "",
        rating=req.rating,
        product_title=req.product_title or "",
        product_category=req.product_category or ""
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=True)
