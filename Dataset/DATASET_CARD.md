# Final Model Training Dataset Card

## 1. Overview

This is the finalized, balanced, quality-controlled **15,000-record dataset** for training the e-commerce review moderation models.

### Target Models
1. **TF-IDF + Logistic Regression** (`sklearn.linear_model.LogisticRegression`)
2. **TF-IDF + Linear SVM** (`sklearn.svm.LinearSVC`)

## 2. Four Primary Classes (Exact Balance)

| Primary Class | Total Records | Train (70%) | Val (15%) | Test (15%) | Source Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`NORMAL`** | 3,750 | 2,625 | 563 | 562 | Authentic Amazon Electronics verified purchase reviews across 1-star to 5-star ratings. |
| **`IRRELEVANT`** | 3,750 | 2,625 | 562 | 563 | Authentic non-product discussion comments (history, sports, weather, Wikipedia talk) with zero product feedback. |
| **`PROMOTIONAL_SPAM`** | 3,750 | 2,625 | 563 | 562 | Authentic unsolicited commercial promotion, affiliate redirection links, discount codes, and channel ads. |
| **`INAPPROPRIATE`** | 3,750 | 2,625 | 562 | 563 | Authentic safety violations including violent threats, hate speech, severe toxicity, and targeted harassment. |
| **TOTAL** | **15,000** | **10,500** | **2,250** | **2,250** | **100% Real-Source Records (`REAL_SOURCE_RECORD`)** |

