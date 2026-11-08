import os
import joblib
import numpy as np
import shap
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from feature_extraction import extract_url_vector

# =====================================================
# TRUSTLENS AI - URL PHISHING DETECTION
# XGBoost + SHAP Explainable AI
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def resolve_path(file_name):
    direct_path = os.path.join(BASE_DIR, file_name)
    subfolder_path = os.path.join(BASE_DIR, "models", file_name)

    if os.path.exists(direct_path):
        return direct_path
    elif os.path.exists(subfolder_path):
        return subfolder_path
    return direct_path

MODEL_PATH = resolve_path("url_xgboost.joblib")
EXPLAINER_PATH = resolve_path("url_shap.joblib")

FEATURE_NAMES = [
    "url_length",
    "hostname_length",
    "path_length",
    "url_entropy",
    "hostname_entropy",
    "dot_count",
    "hyphen_count",
    "at_count",
    "question_count",
    "equals_count",
    "double_slash_count",
    "is_https",
    "hostname_is_ip",
    "hostname_dot_count",
    "digit_ratio",
    "alpha_ratio",
    "has_punycode",
    "has_suspicious_tld",
    "slash_count",
    "double_slash_in_path",
    "query_length",
    "hostname_digit_count",
    "hostname_has_hyphen",
    "has_login_keyword",
    "has_verify_keyword",
    "has_bank_keyword"
]

# =====================================================
# 1. LOAD TRAINED MODEL
# =====================================================
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"URL model not found at {MODEL_PATH}. Run train_model.py first."
    )

model = joblib.load(MODEL_PATH)

if model.n_features_in_ != len(FEATURE_NAMES):
    raise ValueError(
        "Model feature count does not match feature names."
    )

print("TrustLens XGBoost model loaded successfully!")

# =====================================================
# 2. LOAD SHAP EXPLAINER
# =====================================================
explainer = None
if os.path.exists(EXPLAINER_PATH):
    try:
        explainer = joblib.load(EXPLAINER_PATH)
        print("SHAP explainer loaded successfully!")
    except Exception as e:
        print("SHAP explainer could not be loaded:", e)
else:
    print("SHAP explainer not found. Explanations disabled.")

# =====================================================
# 3. SHAP EXPLANATION FUNCTION
# =====================================================
def explain_url(X, top_n=5):
    if explainer is None:
        return []

    try:
        shap_values = explainer.shap_values(X)
        shap_values = np.asarray(shap_values)

        if shap_values.ndim == 3:
            shap_values = shap_values[0, :, 1]
        elif shap_values.ndim == 2:
            shap_values = shap_values[0]

        values = np.asarray(shap_values).flatten()

        if len(values) != len(FEATURE_NAMES):
            raise ValueError("Unexpected SHAP feature count.")

        ranked = np.argsort(np.abs(values))[::-1][:top_n]
        explanations = []

        for index in ranked:
            contribution = float(values[index])
            direction = (
                "toward MALICIOUS"
                if contribution > 0
                else "toward BENIGN"
            )

            item = {
                "feature": FEATURE_NAMES[index],
                "contribution": round(contribution, 5),
                "direction": direction
            }
            explanations.append(item)

        return explanations

    except Exception as e:
        print("SHAP explanation error:", e)
        return []

# =====================================================
# 4. URL PREDICTION FUNCTION
# =====================================================
def predict_url(url: str):
    if not isinstance(url, str) or not url.strip():
        raise ValueError("Please enter a valid URL.")

    url = url.strip()

    if not urlparse(url).scheme:
        url = "https://" + url

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Invalid URL. Enter a valid HTTP/HTTPS URL.")

    features = extract_url_vector(url)
    X = np.asarray([features], dtype=np.float32)

    if X.shape[1] != model.n_features_in_:
        raise ValueError(
            f"Feature mismatch: expected {model.n_features_in_}, "
            f"received {X.shape[1]}"
        )

    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]

    malicious_index = list(model.classes_).index(1)
    benign_index = list(model.classes_).index(0)

    malicious_probability = float(probabilities[malicious_index])
    benign_probability = float(probabilities[benign_index])

    if malicious_probability >= 0.80:
        risk = "HIGH"
    elif malicious_probability >= 0.50:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    explanations = explain_url(X)

    return {
        "url": url,
        "prediction": "MALICIOUS" if prediction == 1 else "BENIGN",
        "malicious_probability": round(malicious_probability * 100, 2),
        "benign_probability": round(benign_probability * 100, 2),
        "risk_level": risk,
        "explanations": explanations
    }

# =====================================================
# 5. FASTAPI APPLICATION SETUP (FOR RENDER DEPLOYMENT)
# =====================================================
app = FastAPI(title="TrustLens ML Phishing Engine")

class ScanRequest(BaseModel):
    url: str

# Support both GET and HEAD for Render Health Checks
@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "engine": "TrustLens ML Model"}

@app.post("/predict")
@app.get("/predict")
def predict_api(url: str = None, body: ScanRequest = None):
    target_url = url or (body.url if body else None)
    if not target_url:
        raise HTTPException(status_code=400, detail="URL parameter or body is required.")
    try:
        return predict_url(target_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
