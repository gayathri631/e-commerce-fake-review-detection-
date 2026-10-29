"""
Baseline Model Training Script:
Trains TF-IDF + Logistic Regression and TF-IDF + LinearSVC
on the finalized 15,000-record dataset.
"""

import time
from pathlib import Path
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, accuracy_score

SCRIPT_DIR = Path(__file__).resolve().parent

print("=" * 70)
print("TRAINING TF-IDF + LOGISTIC REGRESSION AND LINEAR SVC BASELINES")
print("=" * 70)

# 1. Load train, val, and test splits
print("\n[1] Loading dataset splits...")
train_df = pd.read_csv(SCRIPT_DIR / "train.csv")
val_df = pd.read_csv(SCRIPT_DIR / "val.csv")
test_df = pd.read_csv(SCRIPT_DIR / "test.csv")

print(f"  Train: {len(train_df):,} records")
print(f"  Val:   {len(val_df):,} records")
print(f"  Test:  {len(test_df):,} records")

X_train, y_train = train_df["model_text"].fillna(""), train_df["primary_label"]
X_val, y_val = val_df["model_text"].fillna(""), val_df["primary_label"]
X_test, y_test = test_df["model_text"].fillna(""), test_df["primary_label"]

# 2. Fit TF-IDF on Training partition ONLY (Strict Leakage Prevention!)
print("\n[2] Fitting TfidfVectorizer on training set only...")
t0 = time.time()
tfidf = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=25000,
    sublinear_tf=True,
    min_df=2
)
X_train_vec = tfidf.fit_transform(X_train)
X_val_vec = tfidf.transform(X_val)
X_test_vec = tfidf.transform(X_test)
print(f"  Vocabulary size: {len(tfidf.vocabulary_):,} features (vectorized in {time.time()-t0:.2f}s)")

# 3. Model 1: Logistic Regression
print("\n" + "-" * 50)
print("MODEL 1: TF-IDF + LOGISTIC REGRESSION")
print("-" * 50)
t0 = time.time()
clf_lr = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
clf_lr.fit(X_train_vec, y_train)
print(f"  Trained in {time.time()-t0:.2f}s")

# Evaluate on Validation set
y_val_pred_lr = clf_lr.predict(X_val_vec)
val_acc_lr = accuracy_score(y_val, y_val_pred_lr)
print(f"  Validation Accuracy: {val_acc_lr:.4f} ({val_acc_lr*100:.2f}%)")

# Evaluate on Held-Out Test set
y_test_pred_lr = clf_lr.predict(X_test_vec)
test_acc_lr = accuracy_score(y_test, y_test_pred_lr)
print(f"  Held-Out Test Accuracy: {test_acc_lr:.4f} ({test_acc_lr*100:.2f}%)\n")
print("Held-Out Test Classification Report (Logistic Regression):")
print(classification_report(y_test, y_test_pred_lr, digits=4))

# 4. Model 2: Linear SVM (LinearSVC)
print("\n" + "-" * 50)
print("MODEL 2: TF-IDF + LINEAR SVM (LinearSVC)")
print("-" * 50)
t0 = time.time()
clf_svm = LinearSVC(C=0.5, max_iter=2000, random_state=42)
clf_svm.fit(X_train_vec, y_train)
print(f"  Trained in {time.time()-t0:.2f}s")

# Evaluate on Validation set
y_val_pred_svm = clf_svm.predict(X_val_vec)
val_acc_svm = accuracy_score(y_val, y_val_pred_svm)
print(f"  Validation Accuracy: {val_acc_svm:.4f} ({val_acc_svm*100:.2f}%)")

# Evaluate on Held-Out Test set
y_test_pred_svm = clf_svm.predict(X_test_vec)
test_acc_svm = accuracy_score(y_test, y_test_pred_svm)
print(f"  Held-Out Test Accuracy: {test_acc_svm:.4f} ({test_acc_svm*100:.2f}%)\n")
print("Held-Out Test Classification Report (Linear SVM):")
print(classification_report(y_test, y_test_pred_svm, digits=4))

print("=" * 70)
print("TRAINING AND EVALUATION COMPLETED SUCCESSFULLY!")
print("=" * 70)
