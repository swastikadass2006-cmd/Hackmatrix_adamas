import math
import os
import re
from urllib.parse import urlparse
from typing import Dict, Any, List

IP_REGEX = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
SUSP_TLDS = (".xyz", ".top", ".tk", ".club", ".work", ".click", ".biz", ".site", ".online")

BRAND_TARGETS = {
    "sbi": ("State Bank of India", "onlinesbi.sbi"),
    "hdfc": ("HDFC Bank", "netbanking.hdfcbank.com"),
    "icici": ("ICICI Bank", "icicibank.com"),
    "uidai": ("UIDAI (Aadhaar)", "myaadhaar.uidai.gov.in"),
    "aadhaar": ("UIDAI (Aadhaar)", "uidai.gov.in"),
    "incometax": ("Income Tax Department", "incometax.gov.in"),
    "pan": ("Income Tax / NSDL PAN Portal", "incometax.gov.in"),
    "gov": ("Government of India", "gov.in"),
}


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    length = len(s)
    return -sum((s.count(c) / length) * math.log2(s.count(c) / length) for c in set(s))


def extract_url_vector(url: str) -> list:
    url = str(url).strip()
    parsed = urlparse(url)
    h = parsed.hostname or ""
    p = parsed.path or ""
    u = url.lower()
    ul = len(url)

    return [
        ul,
        len(h),
        len(p),
        shannon_entropy(url),
        shannon_entropy(h),
        url.count("."),
        url.count("-"),
        url.count("@"),
        url.count("?"),
        url.count("="),
        url.count("//"),
        1 if parsed.scheme == "https" else 0,
        1 if IP_REGEX.match(h) else 0,
        h.count("."),
        sum(c.isdigit() for c in url) / (ul + 1),
        sum(c.isalpha() for c in url) / (ul + 1),
        1 if "xn--" in h else 0,
        1 if any(t in h for t in SUSP_TLDS) else 0,
        url.count("/"),
        1 if "//" in p else 0,
        len(parsed.query),
        sum(c.isdigit() for c in h),
        1 if "-" in h else 0,
        1 if ("login" in u or "signin" in u) else 0,
        1 if ("verify" in u or "secure" in u) else 0,
        1 if ("bank" in u or "update" in u) else 0,
    ]


class PhishingDetector:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        model_paths = [
            os.path.join(
                os.path.dirname(__file__),
                "..",
                "..",
                "engines",
                "phishing",
                "model",
                "models",
                "url_xgboost.joblib",
            ),
            os.path.abspath("engines/phishing/model/models/url_xgboost.joblib"),
            os.path.abspath("../engines/phishing/model/models/url_xgboost.joblib"),
        ]

        for path in model_paths:
            if os.path.exists(path):
                try:
                    import joblib
                    self.model = joblib.load(path)
                    break
                except Exception:
                    pass

    def analyze_url(self, url: str) -> Dict[str, Any]:
        features = extract_url_vector(url)
        url_lower = url.lower()
        parsed = urlparse(url)
        hostname = (parsed.hostname or "").lower()

        evidence: List[Dict[str, str]] = []
        risk_score = 0

        # Heuristic Signal 1: Suspicious TLD
        if any(t in hostname for t in SUSP_TLDS):
            risk_score += 35
            evidence.append({
                "signal": "High-Risk Top Level Domain",
                "severity": "high",
                "explanation": f"Domain utilizes high-abuse disposable TLD ({hostname.split('.')[-1]}).",
            })

        # Heuristic Signal 2: Direct IP in Hostname
        if IP_REGEX.match(hostname):
            risk_score += 45
            evidence.append({
                "signal": "Direct IP Hostname",
                "severity": "critical",
                "explanation": "Target URL connects directly via raw IP address without DNS resolution.",
            })

        # Heuristic Signal 3: Brand Spoofing Check (India-First Banking & Identity)
        for key, (brand_name, canonical_dom) in BRAND_TARGETS.items():
            if key in hostname and canonical_dom not in hostname:
                risk_score += 55
                evidence.append({
                    "signal": f"Brand Lookalike Impersonation ({brand_name})",
                    "severity": "critical",
                    "explanation": f"Hostname mimics protected entity '{brand_name}' on unauthorized host '{hostname}'.",
                })
                break

        # Heuristic Signal 4: Lexical Entropy
        entropy = shannon_entropy(url)
        if entropy > 4.6:
            risk_score += 25
            evidence.append({
                "signal": "High Lexical Entropy",
                "severity": "medium",
                "explanation": f"URL exhibits abnormal character randomness (Shannon entropy {entropy:.2f} bits/char).",
            })

        # Heuristic Signal 5: Phishing Keyword Concatenation
        keywords = ["login", "verify", "update", "pan", "kyc", "otp", "aadhaar", "banking"]
        found_kw = [kw for kw in keywords if kw in url_lower]
        if len(found_kw) >= 2:
            risk_score += 30
            evidence.append({
                "signal": "Suspicious Authentication Keywords",
                "severity": "high",
                "explanation": f"Target concatenates sensitive credential keywords: {', '.join(found_kw)}.",
            })

        # Machine Learning Model Prediction
        ml_probability = None
        if self.model is not None:
            try:
                import numpy as np
                feat_array = np.array(features).reshape(1, -1)
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(feat_array)
                    ml_probability = float(probs[0][1])
                else:
                    pred = self.model.predict(feat_array)
                    ml_probability = float(pred[0])
            except Exception:
                pass

        if ml_probability is not None:
            model_risk = int(ml_probability * 100)
            risk_score = max(risk_score, model_risk)
            if ml_probability > 0.7:
                evidence.append({
                    "signal": "XGBoost Phishing Classifier",
                    "severity": "critical" if ml_probability > 0.85 else "high",
                    "explanation": f"Trained 26-feature XGBoost model predicts phishing with {ml_probability*100:.1f}% confidence.",
                })

        risk_score = min(100, risk_score)
        trust_score = 100 - risk_score
        verdict = "safe" if trust_score >= 75 else "suspicious" if trust_score >= 40 else "malicious"

        if not evidence:
            evidence.append({
                "signal": "Lexical Baseline Clean",
                "severity": "low",
                "explanation": "No suspicious lexical tokens, homoglyphs, or brand impersonation detected in URL.",
            })

        return {
            "score": trust_score,
            "risk": risk_score,
            "verdict": verdict,
            "evidence": evidence,
        }


detector = PhishingDetector()
