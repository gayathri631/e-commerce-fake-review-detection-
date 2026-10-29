# ML Microservice: Fake & Off-Topic Review Detection

This microservice handles the machine learning inference for classifying e-commerce customer reviews.

## How It Works
When a customer submits a review on the storefront, the FastAPI backend sends a `POST` request to `http://localhost:8001/predict`.

### Request Schema
```json
{
  "review_text": "hey guys who is coming to the cricket match tomorrow?",
  "headline": "Match details",
  "rating": 5,
  "product_title": "Noise ColorFit Pulse Smartwatch",
  "product_category": "Electronics"
}
```

### Response Schema
```json
{
  "is_flagged": true,
  "prediction_type": "OFF_TOPIC_CHAT",
  "confidence": 0.94,
  "flag_reason": "Conversational chatter detected ('cricket match'). Content is not evaluating the product."
}
```

## Prediction Types
- `GENUINE`: Genuine positive or negative product evaluations (e.g. *"Great battery life"*, *"Poor quality zipper"*).
- `OFF_TOPIC_CHAT`: People using the review section as a chat platform or social forum.
- `SPAM`: Promotional messages, external links, scam contact numbers, crypto promo.
- `GIBBERISH`: Keystroke mash, random consonants, or zero-meaning strings.

## How to Plug in Your Friends' Trained ML Model
1. Place your saved model file (e.g., `fake_review_model.pkl`) into this directory (`ml_service/`).
2. Open `classifier.py` and inspect `_load_trained_model_if_exists()`. It automatically loads `fake_review_model.pkl` with `joblib`.
3. If using PyTorch or HuggingFace Transformers, add your tokenizer and inference logic inside `classifier.predict()`.

## Running the Service
```bash
python app.py
```
Interactive Swagger UI: `http://localhost:8001/docs`
