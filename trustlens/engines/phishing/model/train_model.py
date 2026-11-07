
import os
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
import shap

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

os.makedirs("models", exist_ok=True)

# =====================================================
# STEP 1: LOAD EXTRACTED URL FEATURES
# =====================================================

print("\nLoading extracted URL features...")

data = np.load("dataset/test_split.npz")

X_train = data["X_train"]
y_train = data["y_train"]
X_test = data["X_test"]
y_test = data["y_test"]

print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)

# Calculate class imbalance weight
w = np.sum(y_train == 0) / max(np.sum(y_train == 1), 1)

# =====================================================
# STEP 2: TRAIN URL XGBOOST MODEL
# =====================================================

print("\n1/2 Training URL XGBoost model on CPU...")

clf = xgb.XGBClassifier(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    scale_pos_weight=w,
    tree_method="hist",
    device="cpu",
    random_state=42,
    eval_metric="logloss",
    n_jobs=-1
)

clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)

tn, fp, fn, tp = confusion_matrix(
    y_test, y_pred, labels=[0, 1]
).ravel()

print("\nURL MODEL RESULTS")
print("-------------------------")
print("Accuracy :", round(accuracy_score(y_test, y_pred), 4))
print("Precision:", round(precision_score(y_test, y_pred, zero_division=0), 4))
print("Recall   :", round(recall_score(y_test, y_pred, zero_division=0), 4))
print("F1 Score :", round(f1_score(y_test, y_pred, zero_division=0), 4))
print("FPR      :", round(fp / max(fp + tn, 1), 4))

joblib.dump(clf, "models/url_xgboost.joblib")
print("\nSaved URL model.")

# Save SHAP explainer separately
try:
    print("Creating SHAP explainer...")
    explainer = shap.TreeExplainer(clf)
    joblib.dump(explainer, "models/url_shap.joblib")
    print("Saved SHAP explainer.")
except Exception as e:
    print("SHAP explainer could not be saved:", e)

# =====================================================
# STEP 3: TRAIN HTML DOM MODEL
# =====================================================

print("\n2/2 Training HTML DOM model...")

cols = [
    "LineOfCode", "HasTitle", "HasFavicon", "IsResponsive",
    "NoOfURLRedirect", "NoOfSelfRedirect", "HasDescription",
    "NoOfPopup", "NoOfiFrame", "HasExternalFormSubmit",
    "HasSocialNet", "HasSubmitButton", "HasHiddenFields",
    "HasPasswordField", "Bank", "Pay", "Crypto", "NoOfImage",
    "NoOfCSS", "NoOfJS", "NoOfSelfRef", "NoOfEmptyRef",
    "NoOfExternalRef"
]

csv_path = "dataset/raw/PhiUSIIL_Phishing_URL_Dataset.csv"

df_p = pd.read_csv(csv_path, usecols=cols + ["label"])

# Match the label convention used by the URL model:
# 0 = Benign, 1 = Malicious
df_p["label"] = df_p["label"].map({1: 0, 0: 1})

df_p = df_p.dropna(subset=cols + ["label"])

X_html = df_p[cols].values
y_html = df_p["label"].values

X_html_train, X_html_test, y_html_train, y_html_test = train_test_split(
    X_html,
    y_html,
    test_size=0.20,
    random_state=42,
    stratify=y_html
)

print("HTML training data:", X_html_train.shape)
print("HTML testing data:", X_html_test.shape)

clf_h = xgb.XGBClassifier(
    n_estimators=250,
    max_depth=6,
    learning_rate=0.05,
    tree_method="hist",
    device="cpu",
    random_state=42,
    eval_metric="logloss",
    n_jobs=-1
)

clf_h.fit(X_html_train, y_html_train)

html_pred = clf_h.predict(X_html_test)

print("\nHTML DOM MODEL RESULTS")
print("-------------------------")
print("Accuracy :", round(accuracy_score(y_html_test, html_pred), 4))
print("Precision:", round(precision_score(y_html_test, html_pred, zero_division=0), 4))
print("Recall   :", round(recall_score(y_html_test, html_pred, zero_division=0), 4))
print("F1 Score :", round(f1_score(y_html_test, html_pred, zero_division=0), 4))

joblib.dump(clf_h, "models/html_phiusiil_xgboost.joblib")

print("\nHTML DOM model saved.")

# =====================================================
# COMPLETION
# =====================================================

print("\n===================================")
print("MODEL TRAINING COMPLETED!")
print("===================================")
print("Saved models:")
print("1. models/url_xgboost.joblib")
print("2. models/url_shap.joblib (if SHAP succeeded)")
print("3. models/html_phiusiil_xgboost.joblib")
