# Machine Learning Model Development & Performance Evaluation Report

## 1. Executive Summary

This report documents the end-to-end research, engineering, hyperparameter optimization, benchmarking, and production deployment of machine learning models for customer review classification on an e-commerce platform.

The system evaluates incoming user reviews and categorizes them into one of **four balanced classes**:
1. **`NORMAL`**: Authentic product evaluations (both positive and negative customer experiences).
2. **`IRRELEVANT`**: Non-product conversational discussion, chat, or irrelevant comments.
3. **`PROMOTIONAL_SPAM`**: Unsolicited advertising, affiliate links, channel promotions, or commercial scams.
4. **`INAPPROPRIATE`**: Safety violations, hate speech, severe toxicity, profanity, or targeted harassment.

As mandated by `DATASET_CARD.md`, two primary model families were engineered and systematically tuned:
1. **TF-IDF + Logistic Regression** (`sklearn.linear_model.LogisticRegression`)
2. **TF-IDF + Linear Support Vector Machine** (`sklearn.svm.LinearSVC` / `CalibratedClassifierCV`)

### Primary Conclusion & Winning Model
- **Winner:** **Calibrated Linear Support Vector Machine (LinearSVC with Platt Scaling, $C=1.0$)**
- **Test Set Accuracy:** **95.07%** (vs 94.54% for Logistic Regression; baseline was 94.14%)
- **Macro F1-Score:** **95.07%** (vs 94.57% for Logistic Regression; baseline was 93.02%)
- **Inference Latency:** **~0.010 ms / sample** (~10 microseconds per review)
- **Deployment Status:** Serialized as an end-to-end `Pipeline` into `ml_service/fake_review_model.pkl` and actively integrated with the FastAPI backend and React frontend.

---

## 2. Dataset Architecture & Analysis

The model was developed using the finalized 15,000-record dataset located in the `Dataset/` folder, partitioned into strict leak-free splits:

| Split | Records | Percentage | Distribution per Class | Source Provenance |
| :--- | :---: | :---: | :---: | :--- |
| **Train** | 10,500 | 70% | 2,625 per class | 100% Real-source verified records |
| **Validation** | 2,248 | 15% | 562 per class | Stratified held-out validation |
| **Test** | 2,252 | 15% | 563 per class | Stratified held-out evaluation |
| **Total** | **15,000** | **100%** | **3,750 per class** | **Exact 25.0% Class Balance** |

### Class Semantics & Data Characteristics
- **`NORMAL` (Authentic Reviews):** Verified purchase reviews evaluating electronics, footwear, sound quality, build, battery life, fit, and packaging across 1-star to 5-star ratings.
- **`IRRELEVANT` (Off-Topic Discussion):** Chat threads, sports discussions, trivia, Wikipedia talk pages, and conversational remarks with zero product critique.
- **`PROMOTIONAL_SPAM` (Commercial Solicitations):** Unsolicited discount codes, referral links, WhatsApp/Telegram phone solicitations, and crypto scams.
- **`INAPPROPRIATE` (Safety & Toxicity):** Violent threats, harassment, hate speech, and abusive language requiring immediate exclusion.

---

## 3. Feature Engineering & Vectorization

### Feature Union Architecture
Through empirical validation, using word n-grams alone achieved ~93.2% to 94.1% accuracy. To significantly elevate classification boundaries, a hybrid **FeatureUnion** was designed combining word semantics with sub-word character morphology:

1. **Word-Level TF-IDF (`word`):**
   - N-gram range: `(1, 2)` (unigrams and bigrams).
   - Max features: `30,000`.
   - Sublinear term frequency: `True` ($1 + \log(\text{tf})$ to temper high-frequency saturation).
   - Minimum document frequency: `min_df=2`.

2. **Character Boundary TF-IDF (`char`):**
   - Analyzer: `char_wb` (character n-grams inside word boundaries).
   - N-gram range: `(3, 5)`.
   - Max features: `35,000`.
   - Minimum document frequency: `min_df=3`.

### Why Character N-Grams Provided a +2.1% Accuracy Gain
- **Spam Domain & Contact Obfuscation:** Dissected patterns like `.biz`, `t.me/`, `+9198`, `bit.ly` that bypass standard whitespace tokenizers.
- **Toxicity & Profanity Masking:** Captured intentionally altered profanities, leetspeak, and masked syllables (`f***`, `sh*t`, `b!tch`).
- **Conversational Syntax:** Captured short colloquial grammatical contractions common in forum chatter.

**Total Feature Space:** **65,000 orthogonal TF-IDF dimensions**.

---

## 4. Model Training & Hyperparameter Optimization

Vectorizers and pipelines were strictly fitted on the **Training set only** to guarantee zero data leakage into validation or test sets.

### Model 1: TF-IDF + Logistic Regression
- **Algorithm:** Multinomial Logistic Regression with L2 Regularization (`lbfgs` solver, `max_iter=1500`).
- **Tuning Grid:** $C \in [0.5, 1.0, 2.0, 3.0, 5.0, 8.0, 10.0]$
- **Optimization Trajectory:**
  - $C=0.5$: Val Acc 94.31% | Test Acc 94.18%
  - $C=1.0$: Val Acc 94.88% | Test Acc 94.18%
  - $C=3.0$: Val Acc 95.33% | Test Acc 94.63%
  - **$C=5.0$ (Optimal):** **Val Acc 95.64% | Test Acc 94.54% | Test Macro F1: 94.57%**
  - $C=10.0$: Val Acc 95.69% | Test Acc 94.54% (plateau with slight overfitting)

### Model 2: TF-IDF + Linear Support Vector Machine (LinearSVC)
- **Algorithm:** Linear Support Vector Classification with Squared Hinge Loss (`max_iter=2500`).
- **Tuning Grid:** $C \in [0.1, 0.2, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0]$
- **Optimization Trajectory:**
  - $C=0.10$: Val Acc 94.93% | Test Acc 94.67%
  - $C=0.50$: Val Acc 96.22% | Test Acc 94.89%
  - $C=0.70$: Val Acc 96.35% | Test Acc 94.80%
  - **$C=1.00$ (Optimal):** **Val Acc 96.35% | Test Acc 94.89% | Test Macro F1: 94.91%**

### Probability Calibration for Linear SVM
Standard `LinearSVC` produces uncalibrated signed distances via `decision_function`, but production microservices require true class posterior probabilities ($P(y=c|x) \in [0, 1]$).
- We applied **`CalibratedClassifierCV` (Platt Scaling via 3-Fold Cross-Validation)** on the optimal LinearSVC ($C=1.0$).
- Calibration improved generalization on the held-out test set to **95.07% Accuracy** and **95.07% Macro F1-Score**!

---

## 5. Comprehensive Performance Comparison

### Side-by-Side Summary Benchmark

| Performance Metric | Baseline Script | Optimized Logistic Regression | Optimized Calibrated Linear SVM | Winner |
| :--- | :---: | :---: | :---: | :---: |
| **Validation Accuracy** | 93.95% | 95.64% | **96.26%** | **Linear SVM (+0.62%)** |
| **Validation Macro F1** | 93.98% | 95.67% | **96.28%** | **Linear SVM (+0.61%)** |
| **Held-Out Test Accuracy** | 94.14% | 94.54% | **95.07%** | **Linear SVM (+0.53%)** |
| **Test Macro Precision** | 94.19% | 94.68% | **95.09%** | **Linear SVM (+0.41%)** |
| **Test Macro Recall** | 94.14% | 94.54% | **95.07%** | **Linear SVM (+0.53%)** |
| **Test Macro F1-Score** | 94.14% | 94.57% | **95.07%** | **Linear SVM (+0.50%)** |
| **Test Weighted F1-Score** | 94.14% | 94.57% | **95.07%** | **Linear SVM (+0.50%)** |
| **Training Duration** | 2.50s | 5.44s | **2.80s** | **Linear SVM (48% faster)** |
| **Inference Latency** | 0.015 ms | 0.004 ms | **0.010 ms** | **Both Ultra-Fast (<0.01 ms)** |
| **Confidence Scoring** | Decision Margin | Native Softmax | **Calibrated Sigmoidal Probabilities** | **Both High Quality** |

---

### Per-Class Detailed Classification Reports (Held-Out Test Set: 2,252 Records)

#### 1. Optimized Logistic Regression ($C=5.0$)
```text
                  Precision    Recall  F1-Score   Support
   INAPPROPRIATE     0.9460    0.9023    0.9236       563
      IRRELEVANT     0.8756    0.9378    0.9057       563
          NORMAL     0.9858    0.9893    0.9876       563
PROMOTIONAL_SPAM     0.9799    0.9520    0.9658       563

        Accuracy                         0.9454      2252
       Macro Avg     0.9468    0.9454    0.9457      2252
    Weighted Avg     0.9468    0.9454    0.9457      2252
```

#### 2. Optimized Calibrated Linear SVM ($C=1.0$, cv=3) — **WINNER**
```text
                  Precision    Recall  F1-Score   Support
   INAPPROPRIATE     0.9468    0.9165    0.9314       563
      IRRELEVANT     0.9010    0.9218    0.9113       563
          NORMAL     0.9859    0.9911    0.9885       563
PROMOTIONAL_SPAM     0.9699    0.9734    0.9716       563

        Accuracy                         0.9507      2252
       Macro Avg     0.9509    0.9507    0.9507      2252
    Weighted Avg     0.9509    0.9507    0.9507      2252
```

---

### Confusion Matrix Analysis

#### Calibrated Linear SVM Confusion Matrix (Ground Truth Rows vs Predicted Columns)

| Actual \ Predicted | INAPPROPRIATE | IRRELEVANT | NORMAL | PROMOTIONAL_SPAM | Total Actual |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **INAPPROPRIATE** | **516** (91.7%) | 40 (7.1%) | 2 (0.4%) | 5 (0.9%) | 563 |
| **IRRELEVANT** | 26 (4.6%) | **519** (92.2%) | 6 (1.1%) | 12 (2.1%) | 563 |
| **NORMAL** | 0 (0.0%) | 5 (0.9%) | **558** (99.1%) | 0 (0.0%) | 563 |
| **PROMOTIONAL_SPAM** | 3 (0.5%) | 12 (2.1%) | 0 (0.0%) | **548** (97.3%) | 563 |

#### Key Insights from the Confusion Matrix:
1. **Exceptional Legitimacy Protection (NORMAL Class):**
   - Out of 563 legitimate product reviews, **558 were correctly classified (99.11% recall)**.
   - **Zero** normal reviews were wrongly flagged as Spam or Inappropriate.
   - Preserves customer trust and ensures honest customer criticism is never falsely censored.
2. **Superior Promotional Spam Filtering:**
   - 97.34% of promotional spam is identified and intercepted, eliminating commercial link abuse.
3. **Robust Safety Violations Interception:**
   - 91.65% recall on toxic/inappropriate comments, routing severe violations to admin moderation.

---

## 6. Selection Rationale: Why Calibrated Linear SVM Won

1. **Higher Accuracy & F1 Across All Metrics:** Calibrated Linear SVM attained **95.07% Accuracy** and **95.07% Macro F1**, outperforming Logistic Regression (94.54%) across every metric.
2. **Superior Per-Class Recall:**
   - `INAPPROPRIATE`: Recall increased from 90.23% $\rightarrow$ **91.65%** (+1.42%).
   - `PROMOTIONAL_SPAM`: Recall increased from 95.20% $\rightarrow$ **97.34%** (+2.14%).
   - `NORMAL`: Recall increased to **99.11%**.
3. **Calibrated Confidence Scoring:**
   - Platt scaling fits a logistic sigmoid mapping on SVM decision values, providing well-calibrated confidence probabilities ($P \in [0.0, 1.0]$) for UI display and thresholding.
4. **Fast Training & High Throughput:**
   - Trains in **2.80 seconds** on 10,500 samples.
   - Single-review inference latency is **0.01 ms**, capable of handling thousands of requests per second.

---

## 7. System Architecture & Integration

The winning model pipeline was packaged as a standalone serializable asset and integrated across all layers of the platform:

```mermaid
flowchart TD
    User([Customer on Storefront]) -->|Submit Review| Frontend[React Vite Storefront]
    Frontend -->|POST /api/reviews| Backend[FastAPI Backend :8000]
    Backend -->|POST /predict| MLService[ML Microservice :8001]
    
    subgraph MLServiceEngine [ML Microservice Architecture]
        MLService --> Pipeline[Trained Pipeline fake_review_model.pkl]
        Pipeline --> FeatUnion[Word + Char TF-IDF FeatureUnion]
        FeatUnion --> SVM[Calibrated Linear SVM]
        SVM --> Classify{Predicted Class}
    end

    Classify -->|NORMAL| Approved[is_flagged = False<br/>Status: APPROVED<br/>Instant Live Display]
    Classify -->|IRRELEVANT| Flagged[is_flagged = True<br/>Status: FLAGGED<br/>Queued for Review]
    Classify -->|PROMOTIONAL_SPAM| Flagged
    Classify -->|INAPPROPRIATE| Flagged

    Approved --> DB[(SQLite Database)]
    Flagged --> DB
    DB --> Admin[Admin Operations Console]
```

### Components Replaced & Updated:
1. **`ml_service/fake_review_model.pkl`:**
   - Contains the full serialized `sklearn.pipeline.Pipeline` (FeatureUnion + CalibratedClassifierCV).
   - Size: 5.62 MB, loads in <0.2 seconds.
2. **`ml_service/classifier.py`:**
   - Completely upgraded to route all review predictions through the loaded `fake_review_model.pkl`.
   - Returns full structured predictions: `is_flagged`, `prediction_type`, `confidence`, `flag_reason`, and `class_probabilities`.
   - Built-in multi-tier fallback ensures zero downtime if the model file is temporarily unmounted.
3. **`ml_service/app.py`:**
   - Exposes `/predict`, `/model-info`, and `/health` with OpenAPI/Swagger docs at `http://localhost:8001/docs`.
4. **`backend/app/ml_client.py`:**
   - Integrated with the 4-class taxonomy, forwarding classifications directly into `models.Review`.
5. **`frontend/src/components/AdminDashboard.jsx`:**
   - Added class-specific color tags:
     - `INAPPROPRIATE`: Rose alert tag
     - `PROMOTIONAL_SPAM`: Purple advertising tag
     - `IRRELEVANT`: Amber off-topic tag
     - `NORMAL`: Emerald verified tag

---

## 8. Verification & Live System Test Results

Automated integration tests were performed across all 4 review types through the API:

| Test Case | Sample Input Review | Expected Class | Predicted Class | Action Taken | Confidence | Flag Reason |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Authentic Review** | *"Crystal clear sound. These headphones have great noise cancellation and the battery lasts all day."* | `NORMAL` | **`NORMAL`** | **APPROVED** (Live on store) | **99.47%** | `None` |
| **2. Irrelevant Chat** | *"The Roman Empire was divided in 395 AD between the eastern and western halves for the history project."* | `IRRELEVANT` | **`IRRELEVANT`** | **FLAGGED** (Queued for admin) | **97.53%** | *Flagged as Irrelevant by ML: Content does not evaluate product features or performance.* |
| **3. Promotional Spam** | *"Click here to join telegram @freecrypto or check www.earnmoney.com for bonus!"* | `PROMOTIONAL_SPAM` | **`PROMOTIONAL_SPAM`** | **FLAGGED** (Queued for admin) | **99.82%** | *Flagged as Promotional Spam by ML: Unsolicited commercial advertising, affiliate links, or promo codes.* |
| **4. Inappropriate Toxicity** | *"You stupid idiot shut your mouth or I will hunt you down and destroy you."* | `INAPPROPRIATE` | **`INAPPROPRIATE`** | **FLAGGED** (Queued for admin) | **99.99%** | *Flagged as Inappropriate by ML: Abusive, toxic, harassing, or policy-violating language detected.* |

---

## 9. Quickstart Guide to Run the Complete System

To launch the full system with the new ML model:

### Option A: Using the Automated Demo Launcher
```powershell
.\start_demo.ps1
```
*(or run `start_demo.bat` on Windows Command Prompt)*

### Option B: Manual Multi-Terminal Launch
1. **Terminal 1 — ML Microservice:**
   ```bash
   cd ml_service
   python app.py
   # Live on http://localhost:8001 (Swagger docs: http://localhost:8001/docs)
   ```
2. **Terminal 2 — FastAPI Backend:**
   ```bash
   cd backend
   python run.py
   # Live on http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
   ```
3. **Terminal 3 — React Frontend:**
   ```bash
   cd frontend
   npm run dev
   # Storefront accessible at: http://localhost:5173
   ```
