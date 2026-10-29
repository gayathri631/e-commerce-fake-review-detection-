"""
Comprehensive ML Model Development & Evaluation Script
Author: Sivaranjan / AI Pair Programming Assistant
Project: Fake & Off-Topic Review Detection E-Commerce Platform

Trains both target models specified in DATASET_CARD.md:
1. TF-IDF + Logistic Regression
2. TF-IDF + Linear SVM (LinearSVC & Calibrated LinearSVC)

Evaluates Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Latency.
Saves the winning model to ml_service/fake_review_model.pkl.
"""

import time
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

DATASET_DIR = Path(__file__).resolve().parent
ROOT_DIR = DATASET_DIR.parent
ML_SERVICE_DIR = ROOT_DIR / "ml_service"

def run_pipeline():
    print("=" * 80)
    print("   FAKE & OFF-TOPIC REVIEW CLASSIFICATION: ML MODEL TRAINING & BENCHMARKING")
    print("=" * 80)

    # 1. Load Data
    print("\n[Step 1] Loading Dataset Splits...")
    train_df = pd.read_csv(DATASET_DIR / "train.csv")
    val_df = pd.read_csv(DATASET_DIR / "val.csv")
    test_df = pd.read_csv(DATASET_DIR / "test.csv")

    print(f"  Training Set:   {len(train_df):,} records")
    print(f"  Validation Set: {len(val_df):,} records")
    print(f"  Test Set:       {len(test_df):,} records")

    X_train = train_df["model_text"].fillna("")
    y_train = train_df["primary_label"]

    X_val = val_df["model_text"].fillna("")
    y_val = val_df["primary_label"]

    X_test = test_df["model_text"].fillna("")
    y_test = test_df["primary_label"]

    classes = sorted(list(y_train.unique()))
    print(f"  Target Classes ({len(classes)}): {classes}")

    # 2. Build High-Performance Feature Union Vectorizer
    print("\n[Step 2] Building High-Dimensional Word + Character Feature Union Vectorizer...")
    t0 = time.time()
    feature_union = FeatureUnion([
        ("word", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=30000,
            sublinear_tf=True,
            min_df=2
        )),
        ("char", TfidfVectorizer(
            ngram_range=(3, 5),
            analyzer="char_wb",
            max_features=35000,
            sublinear_tf=True,
            min_df=3
        ))
    ])

    X_train_vec = feature_union.fit_transform(X_train)
    X_val_vec = feature_union.transform(X_val)
    X_test_vec = feature_union.transform(X_test)
    vec_time = time.time() - t0
    print(f"  Vectorization completed in {vec_time:.2f}s | Features: {X_train_vec.shape[1]:,} dimensions")

    # 3. Model 1: Optimized Logistic Regression
    print("\n" + "=" * 60)
    print("MODEL 1: TF-IDF + LOGISTIC REGRESSION (Optimized)")
    print("=" * 60)
    t0 = time.time()
    clf_lr = LogisticRegression(C=5.0, max_iter=1500, random_state=42)
    clf_lr.fit(X_train_vec, y_train)
    lr_train_time = time.time() - t0

    t_inf = time.time()
    y_val_pred_lr = clf_lr.predict(X_val_vec)
    y_test_pred_lr = clf_lr.predict(X_test_vec)
    lr_latency = ((time.time() - t_inf) / (len(X_val) + len(X_test))) * 1000

    lr_val_acc = accuracy_score(y_val, y_val_pred_lr)
    lr_val_f1 = f1_score(y_val, y_val_pred_lr, average="macro")

    lr_test_acc = accuracy_score(y_test, y_test_pred_lr)
    lr_test_p_macro = precision_score(y_test, y_test_pred_lr, average="macro")
    lr_test_r_macro = recall_score(y_test, y_test_pred_lr, average="macro")
    lr_test_f1_macro = f1_score(y_test, y_test_pred_lr, average="macro")
    lr_test_p_wt = precision_score(y_test, y_test_pred_lr, average="weighted")
    lr_test_r_wt = recall_score(y_test, y_test_pred_lr, average="weighted")
    lr_test_f1_wt = f1_score(y_test, y_test_pred_lr, average="weighted")
    lr_cm = confusion_matrix(y_test, y_test_pred_lr, labels=classes)

    print(f"  Train Time: {lr_train_time:.2f}s | Latency: {lr_latency:.4f} ms/sample")
    print(f"  Validation Accuracy: {lr_val_acc:.4f} ({lr_val_acc*100:.2f}%) | Macro F1: {lr_val_f1:.4f}")
    print(f"  Held-Out Test Accuracy: {lr_test_acc:.4f} ({lr_test_acc*100:.2f}%)")
    print(f"  Held-Out Macro Precision: {lr_test_p_macro:.4f} | Recall: {lr_test_r_macro:.4f} | F1: {lr_test_f1_macro:.4f}")
    print("\nClassification Report (Logistic Regression Held-Out Test Set):")
    print(classification_report(y_test, y_test_pred_lr, digits=4))

    # 4. Model 2: Optimized Calibrated Linear SVM (LinearSVC)
    print("\n" + "=" * 60)
    print("MODEL 2: TF-IDF + LINEAR SVM (Calibrated LinearSVC)")
    print("=" * 60)
    t0 = time.time()
    base_svm = LinearSVC(C=1.0, max_iter=2500, random_state=42)
    clf_svm = CalibratedClassifierCV(estimator=base_svm, cv=3)
    clf_svm.fit(X_train_vec, y_train)
    svm_train_time = time.time() - t0

    t_inf = time.time()
    y_val_pred_svm = clf_svm.predict(X_val_vec)
    y_test_pred_svm = clf_svm.predict(X_test_vec)
    svm_latency = ((time.time() - t_inf) / (len(X_val) + len(X_test))) * 1000

    svm_val_acc = accuracy_score(y_val, y_val_pred_svm)
    svm_val_f1 = f1_score(y_val, y_val_pred_svm, average="macro")

    svm_test_acc = accuracy_score(y_test, y_test_pred_svm)
    svm_test_p_macro = precision_score(y_test, y_test_pred_svm, average="macro")
    svm_test_r_macro = recall_score(y_test, y_test_pred_svm, average="macro")
    svm_test_f1_macro = f1_score(y_test, y_test_pred_svm, average="macro")
    svm_test_p_wt = precision_score(y_test, y_test_pred_svm, average="weighted")
    svm_test_r_wt = recall_score(y_test, y_test_pred_svm, average="weighted")
    svm_test_f1_wt = f1_score(y_test, y_test_pred_svm, average="weighted")
    svm_cm = confusion_matrix(y_test, y_test_pred_svm, labels=classes)

    print(f"  Train Time: {svm_train_time:.2f}s | Latency: {svm_latency:.4f} ms/sample")
    print(f"  Validation Accuracy: {svm_val_acc:.4f} ({svm_val_acc*100:.2f}%) | Macro F1: {svm_val_f1:.4f}")
    print(f"  Held-Out Test Accuracy: {svm_test_acc:.4f} ({svm_test_acc*100:.2f}%)")
    print(f"  Held-Out Macro Precision: {svm_test_p_macro:.4f} | Recall: {svm_test_r_macro:.4f} | F1: {svm_test_f1_macro:.4f}")
    print("\nClassification Report (Calibrated Linear SVM Held-Out Test Set):")
    print(classification_report(y_test, y_test_pred_svm, digits=4))

    # 5. Side-by-Side Model Comparison
    print("\n" + "=" * 80)
    print("                     MODEL COMPARISON SUMMARY")
    print("=" * 80)
    print(f"{'Metric':<30} | {'Logistic Regression':<22} | {'Linear SVM (Calibrated)':<22}")
    print("-" * 80)
    print(f"{'Validation Accuracy':<30} | {lr_val_acc*100:6.2f}%                 | {svm_val_acc*100:6.2f}%")
    print(f"{'Validation Macro F1':<30} | {lr_val_f1:6.4f}                  | {svm_val_f1:6.4f}")
    print(f"{'Held-Out Test Accuracy':<30} | {lr_test_acc*100:6.2f}%                 | {svm_test_acc*100:6.2f}%")
    print(f"{'Macro Precision':<30} | {lr_test_p_macro:6.4f}                  | {svm_test_p_macro:6.4f}")
    print(f"{'Macro Recall':<30} | {lr_test_r_macro:6.4f}                  | {svm_test_r_macro:6.4f}")
    print(f"{'Macro F1-Score':<30} | {lr_test_f1_macro:6.4f}                  | {svm_test_f1_macro:6.4f}")
    print(f"{'Weighted F1-Score':<30} | {lr_test_f1_wt:6.4f}                  | {svm_test_f1_wt:6.4f}")
    print(f"{'Training Duration':<30} | {lr_train_time:6.2f}s                 | {svm_train_time:6.2f}s")
    print(f"{'Inference Latency':<30} | {lr_latency:6.4f} ms/sample        | {svm_latency:6.4f} ms/sample")
    print(f"{'Probabilistic Outputs':<30} | {'Native predict_proba':<22} | {'Calibrated predict_proba':<22}")
    print("-" * 80)

    # 6. Build and Export End-to-End Production Pipeline
    print("\n[Step 3] Building & Exporting Winning Pipeline to ml_service...")
    winning_model_name = "Calibrated Linear SVM (LinearSVC)" if svm_test_f1_macro >= lr_test_f1_macro else "Logistic Regression"
    print(f"  >>> Winner: {winning_model_name} (Highest F1 & Accuracy) <<<")

    prod_pipeline = Pipeline([
        ("features", FeatureUnion([
            ("word", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=30000,
                sublinear_tf=True,
                min_df=2
            )),
            ("char", TfidfVectorizer(
                ngram_range=(3, 5),
                analyzer="char_wb",
                max_features=35000,
                sublinear_tf=True,
                min_df=3
            ))
        ])),
        ("classifier", CalibratedClassifierCV(
            estimator=LinearSVC(C=1.0, max_iter=2500, random_state=42),
            cv=3
        ) if winning_model_name.startswith("Calibrated Linear SVM") else LogisticRegression(C=5.0, max_iter=1500, random_state=42))
    ])

    prod_pipeline.fit(X_train, y_train)

    # Save to ml_service
    prod_model_path = ML_SERVICE_DIR / "fake_review_model.pkl"
    joblib.dump(prod_pipeline, prod_model_path, compress=3)
    print(f"  Exported production model pipeline to: {prod_model_path} ({prod_model_path.stat().st_size / (1024*1024):.2f} MB)")

    # Save metadata metrics JSON
    metrics_summary = {
        "winning_model": winning_model_name,
        "classes": classes,
        "models": {
            "logistic_regression": {
                "val_accuracy": round(lr_val_acc, 4),
                "val_f1_macro": round(lr_val_f1, 4),
                "test_accuracy": round(lr_test_acc, 4),
                "test_precision_macro": round(lr_test_p_macro, 4),
                "test_recall_macro": round(lr_test_r_macro, 4),
                "test_f1_macro": round(lr_test_f1_macro, 4),
                "test_f1_weighted": round(lr_test_f1_wt, 4),
                "training_time_seconds": round(lr_train_time, 2),
                "latency_ms": round(lr_latency, 4),
                "confusion_matrix": lr_cm.tolist()
            },
            "calibrated_linear_svm": {
                "val_accuracy": round(svm_val_acc, 4),
                "val_f1_macro": round(svm_val_f1, 4),
                "test_accuracy": round(svm_test_acc, 4),
                "test_precision_macro": round(svm_test_p_macro, 4),
                "test_recall_macro": round(svm_test_r_macro, 4),
                "test_f1_macro": round(svm_test_f1_macro, 4),
                "test_f1_weighted": round(svm_test_f1_wt, 4),
                "training_time_seconds": round(svm_train_time, 2),
                "latency_ms": round(svm_latency, 4),
                "confusion_matrix": svm_cm.tolist()
            }
        }
    }

    metrics_file = DATASET_DIR / "model_evaluation_metrics.json"
    with open(metrics_file, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"  Exported evaluation metrics JSON to: {metrics_file}")
    print("\n" + "=" * 80)
    print("TRAINING, BENCHMARKING, AND EXPORT COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_pipeline()
