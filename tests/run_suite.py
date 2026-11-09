#!/usr/bin/env python3
"""
TrustLens Automated Test Suite & Metric Evaluation Harness
Executes all ground-truth cases defined in tests/cases.yaml against the TrustLens pipeline.
Calculates Accuracy, Precision, Recall, F1-Score, False Positive Rate, and Ablation Study.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from typing import Dict, Any, List
import yaml

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://127.0.0.1:8000").rstrip("/")
CASES_FILE = os.path.join(os.path.dirname(__file__), "cases.yaml")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

def http_post(endpoint: str, payload: dict) -> Dict[str, Any]:
    url = f"{GATEWAY_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "TrustLens-Test-Runner/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return {
                "status_code": resp.getcode(),
                "body": json.loads(resp.read().decode("utf-8"))
            }
    except urllib.error.HTTPError as e:
        error_body = {}
        try:
            error_body = json.loads(e.read().decode("utf-8"))
        except Exception:
            pass
        return {
            "status_code": e.code,
            "body": error_body,
            "error": str(e)
        }
    except Exception as e:
        return {
            "status_code": 0,
            "body": {},
            "error": str(e)
        }

def evaluate_case(case: dict) -> dict:
    cat = case["category"]
    inp = case["input"]
    case_id = case["id"]
    start_time = time.perf_counter()

    if cat in ("suspicious_urls", "benign_urls"):
        res = http_post("/api/v1/scan", {"url": inp})
    elif cat in ("scam_messages", "benign_urgent_messages"):
        res = http_post("/api/v1/analyze", {"message": inp})
    elif cat == "ssrf_fixtures":
        res = http_post("/api/v1/scan", {"url": inp})
    else:
        res = {"status_code": 0, "body": {}, "error": f"Unknown category {cat}"}

    elapsed_ms = (time.perf_counter() - start_time) * 1000
    body = res.get("body", {})
    status = res.get("status_code", 0)

    # Classification extraction
    if cat == "ssrf_fixtures":
        actual_class = "Blocked" if status in (400, 422, 403) else body.get("classification", "Allowed")
        actual_score = 100 if actual_class == "Blocked" else body.get("risk_score", 0)
    else:
        actual_class = body.get("classification", "Error")
        if "risk_score" in body:
            actual_score = body["risk_score"]
        elif "trust_score" in body:
            actual_score = max(0, 100 - body["trust_score"])
        else:
            actual_score = body.get("confidence", 0)

    expected_class = case.get("expected_classification")
    expected_min = case.get("expected_risk_min", 0)
    expected_max = case.get("expected_risk_max", 100)

    # Determine pass/fail
    passed = False
    if cat == "ssrf_fixtures":
        passed = (actual_class == "Blocked")
    elif cat in ("suspicious_urls", "scam_messages"):
        passed = actual_class in ("Confirmed Malicious", "High Risk", "Suspicious") and actual_score >= expected_min
    elif cat in ("benign_urls", "benign_urgent_messages"):
        passed = (actual_class == "No indicators found") and actual_score <= expected_max

    return {
        "id": case_id,
        "category": cat,
        "input": inp,
        "expected_classification": expected_class,
        "actual_classification": actual_class,
        "expected_risk_min": expected_min,
        "expected_risk_max": expected_max,
        "actual_score": actual_score,
        "passed": passed,
        "latency_ms": round(elapsed_ms, 2),
        "status_code": status,
        "raw_response": body
    }

def main():
    print("=" * 75)
    print("  TrustLens Automated Test Suite & Multi-Signal Metric Verification")
    print(f"  Target Gateway : {GATEWAY_URL}")
    print(f"  Cases File     : {CASES_FILE}")
    print("=" * 75)

    with open(CASES_FILE, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    cases = config.get("cases", [])
    results = []

    tp = 0  # Malicious correctly flagged as Malicious/High Risk/Suspicious
    fn = 0  # Malicious incorrectly flagged as Clean/No Indicators
    tn = 0  # Benign correctly flagged as No Indicators
    fp = 0  # Benign incorrectly flagged as Malicious/High Risk/Suspicious

    print(f"\nExecuting {len(cases)} Test Cases...\n")
    print(f"{'ID':<10} | {'Category':<22} | {'Expected':<18} | {'Actual':<18} | {'Score':<5} | {'Result'}")
    print("-" * 88)

    for case in cases:
        r = evaluate_case(case)
        results.append(r)

        cat = r["category"]
        is_malicious_ground_truth = cat in ("suspicious_urls", "scam_messages")
        is_benign_ground_truth = cat in ("benign_urls", "benign_urgent_messages")

        pred_malicious = r["actual_classification"] in ("Confirmed Malicious", "High Risk", "Suspicious")
        pred_benign = (r["actual_classification"] == "No indicators found")

        if is_malicious_ground_truth:
            if pred_malicious:
                tp += 1
            else:
                fn += 1
        elif is_benign_ground_truth:
            if pred_benign:
                tn += 1
            else:
                fp += 1

        status_str = "✓ PASS" if r["passed"] else "✗ FAIL"
        color_start = "\033[92m" if r["passed"] else "\033[91m"
        color_end = "\033[0m"

        print(
            f"{r['id']:<10} | {cat:<22} | {str(r['expected_classification']):<18} | "
            f"{str(r['actual_classification']):<18} | {r['actual_score']:<5} | "
            f"{color_start}{status_str}{color_end}"
        )

    # Performance Metrics
    total_samples = tp + fp + tn + fn
    accuracy = (tp + tn) / total_samples if total_samples > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0

    print("\n" + "=" * 75)
    print("  CONFUSION MATRIX & PERFORMANCE METRICS")
    print("=" * 75)
    print(f"  True Positives  (TP) : {tp}")
    print(f"  False Positives (FP) : {fp}")
    print(f"  True Negatives  (TN) : {tn}")
    print(f"  False Negatives (FN) : {fn}")
    print("-" * 75)
    print(f"  Accuracy             : {accuracy * 100:.2f}%")
    print(f"  Precision            : {precision * 100:.2f}%")
    print(f"  Recall (Detection)   : {recall * 100:.2f}%")
    print(f"  F1 Score             : {f1 * 100:.2f}%")
    print(f"  False Positive Rate  : {fpr * 100:.2f}%")
    print("=" * 75)

    # Save artifact
    output_path = os.path.join(RESULTS_DIR, "evaluation_results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "metrics": {
                "accuracy": round(accuracy, 4),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4),
                "false_positive_rate": round(fpr, 4),
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn,
            },
            "cases": results
        }, f, indent=2)

    print(f"\n✓ Saved evaluation artifact to: {output_path}")

    # Return exit code based on failures
    failures = [r for r in results if not r["passed"]]
    if failures:
        print(f"\n⚠️  {len(failures)} test case(s) failed out of {len(cases)}.")
        sys.exit(1)
    else:
        print(f"\n🎉 All {len(cases)} test cases passed successfully with 100% compliance!")
        sys.exit(0)

if __name__ == "__main__":
    main()
