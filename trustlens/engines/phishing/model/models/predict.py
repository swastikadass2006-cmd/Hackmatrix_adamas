
import os
import joblib
import numpy as np
import shap

from urllib.parse import urlparse
from feature_extraction import extract_url_vector

# =====================================================
# TRUSTLENS AI - URL PHISHING DETECTION
# XGBoost + SHAP Explainable AI
# =====================================================

MODEL_PATH = "models/url_xgboost.joblib"
EXPLAINER_PATH = "models/url_shap.joblib"

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
        "URL model not found. Run train_model.py first."
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
        print("\nSHAP explanation unavailable.")
        return []

    try:
        shap_values = explainer.shap_values(X)

        # Handle different SHAP output formats.
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

        print("\n========== SHAP EXPLANATION ==========")

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

            print(
                f"{item['feature']}: "
                f"{item['contribution']} "
                f"({item['direction']})"
            )

        print("======================================")

        return explanations

    except Exception as e:
        print("SHAP explanation error:", e)
        return []


# =====================================================
# 4. URL PREDICTION FUNCTION
# =====================================================

def predict_url(url):

    if not isinstance(url, str) or not url.strip():
        raise ValueError("Please enter a valid URL.")

    url = url.strip()

    # Add HTTPS if scheme is missing.
    if not urlparse(url).scheme:
        url = "https://" + url

    parsed = urlparse(url)

    if (
        parsed.scheme not in ("http", "https")
        or not parsed.hostname
    ):
        raise ValueError(
            "Invalid URL. Enter a valid HTTP/HTTPS URL."
        )

    # Extract the same 26 features used during training.
    features = extract_url_vector(url)

    X = np.asarray([features], dtype=np.float32)

    if X.shape[1] != model.n_features_in_:
        raise ValueError(
            f"Feature mismatch: expected {model.n_features_in_}, "
            f"received {X.shape[1]}"
        )

    # Predict class.
    prediction = int(model.predict(X)[0])

    probabilities = model.predict_proba(X)[0]

    malicious_index = list(model.classes_).index(1)
    benign_index = list(model.classes_).index(0)

    malicious_probability = float(
        probabilities[malicious_index]
    )

    benign_probability = float(
        probabilities[benign_index]
    )

    # Risk classification based on model probability.
    if malicious_probability >= 0.80:
        risk = "HIGH"
    elif malicious_probability >= 0.50:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    # Generate explainable AI output.
    explanations = explain_url(X)

    result = {
        "url": url,
        "prediction": (
            "MALICIOUS" if prediction == 1 else "BENIGN"
        ),
        "malicious_probability": round(
            malicious_probability * 100, 2
        ),
        "benign_probability": round(
            benign_probability * 100, 2
        ),
        "risk_level": risk,
        "explanations": explanations
    }

    return result


# =====================================================
# 5. COMMAND LINE URL SCANNER
# =====================================================

if __name__ == "__main__":

    print("\n======================================")
    print("       TRUSTLENS AI URL SCANNER")
    print("======================================")

    while True:

        url = input(
            "\nEnter URL (or type exit): "
        ).strip()

        if url.lower() == "exit":
            print("\nTrustLens scanner closed.")
            break

        try:

            result = predict_url(url)

            print("\n========== SCAN RESULT ==========")

            print("URL:", result["url"])
            print("Prediction:", result["prediction"])

            print(
                "Malicious Probability:",
                str(result["malicious_probability"]) + "%"
            )

            print(
                "Benign Probability:",
                str(result["benign_probability"]) + "%"
            )

            print("Risk Level:", result["risk_level"])

            print("================================")

        except Exception as e:
            print("\nScan error:", e)
