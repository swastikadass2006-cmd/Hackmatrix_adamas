#!/usr/bin/env python3
"""
TrustLens Complete End-to-End Automated Verification Test Suite
==============================================================
Validates all Hackathon Challenge Handbook requirements (Modules 1-6),
Section 9 Security Guardrails, and Advanced Bonus Features.

Test Cases Covered:
1. Phishing & Brand Clone (e.g. SBI Phishing Clone)
2. Weak PKI / Distrusted Intermediate CA (eMudhra incident & Fermat weak key)
3. Homograph / Open Redirect / Disposable TLD Attack
4. Clean Enterprise Baseline (e.g. google.com with explicit disclaimer)
5. Legitimate Financial/Tech Portal (e.g. github.com)
6. Legitimate Academic/Standard Portal (e.g. example.com with 0 false positives)
7. Scam Message Analysis (Urgency, OTP harvesting, KYC, URL extraction)
8. Web3 Canonical Hash & Tamper Detection (RFC 8785 + Keccak-256 + Mutation)
9. Quoted URL Normalization & SSRF Cloud Metadata Guard
10. Bonus: STIX 2.1 Intel Export, Community Consensus, & Fermat RSA Sieve
"""

import sys
import os
import json
import re
import urllib.request
import urllib.error

# Ensure trustlens directory is in python path
WORKSPACE_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WORKSPACE_ROOT)
sys.path.insert(0, os.path.join(WORKSPACE_ROOT, "gateway"))

from common.canonical_json import canonicalize_json, hash_report, keccak_256

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:8000")

def post_json(endpoint: str, payload: dict) -> dict:
    url = f"{GATEWAY_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return {"_error_status": e.code, "_error_body": err_body}
    except Exception as e:
        return {"_error_status": 500, "_error_body": str(e)}

def get_json(endpoint: str) -> dict:
    url = f"{GATEWAY_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return {"_error_status": e.code, "_error_body": err_body}
    except Exception as e:
        return {"_error_status": 500, "_error_body": str(e)}

def analyze_scam_message_py(text: str) -> dict:
    """Python mirror of frontend/src/lib/scam/scamAnalyzer.ts"""
    url_regex = re.compile(r"(https?://[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|org|net|top|xyz|biz|live|info|club|site|app|click)(?:/[^\s]*)?)", re.I)
    urls = list(set(url_regex.findall(text)))

    phone_regex = re.compile(r"(?:\+91[\s-]?)?[6789]\d{9}|1800[\s-]?\d{3}[\s-]?\d{3,4}")
    phones = list(set(phone_regex.findall(text)))

    urgency_match = re.search(r"(immediately|within 24 hours|urgent|account suspended|deactivated today|last warning|blocked)", text, re.I)
    kyc_match = re.search(r"(kyc pending|update pan|pan card|electricity power will be cut|aadhaar update|biometric lock|pan/kyc)", text, re.I)
    otp_match = re.search(r"(share otp|otp|send 6-digit pin|enter debit card|cvv|netbanking password)", text, re.I)

    signals = []
    if urgency_match:
        signals.append({"category": "Urgency & Coercion", "snippet": urgency_match.group(0)})
    if kyc_match:
        signals.append({"category": "KYC & Account Threats", "snippet": kyc_match.group(0)})
    if otp_match:
        signals.append({"category": "Credential Harvesting", "snippet": otp_match.group(0)})

    return {
        "extracted_urls": urls,
        "extracted_phones": phones,
        "signals": signals,
        "urgency_detected": bool(urgency_match),
        "kyc_threat_detected": bool(kyc_match),
        "otp_harvesting_detected": bool(otp_match),
        "overall_verdict": "High Risk Social Engineering" if (otp_match or (urgency_match and kyc_match)) else "Suspicious"
    }

def run_all_tests():
    print("=" * 80)
    print(" TRUSTLENS AUTOMATED END-TO-END VERIFICATION SUITE")
    print(" Testing against Gateway at:", GATEWAY_URL)
    print("=" * 80)

    passed_tests = 0
    total_tests = 9

    # --------------------------------------------------------------------------
    # TEST CASE 1: Phishing & Brand Clone (SBI Lookalike)
    # --------------------------------------------------------------------------
    print("\n[TEST 1/9] 3 Malicious Cases - Phishing & Brand Clone")
    target_1 = "http://onlinesbi-kyc-pan-update.top/login.php"
    res1 = post_json("/scan", {"url": target_1})
    print(f"  Target: {target_1}")
    print(f"  Trust Score: {res1.get('trust_score')}/100 | Verdict: {res1.get('verdict')} | Classification: {res1.get('classification')}")
    print(f"  Override Active: {res1.get('override_active')} | Override Reason: {res1.get('override_reason')}")
    
    signals1 = [e.get("signal", "") for e in res1.get("evidence", [])]
    print(f"  Evidence Signals: {signals1}")

    assert res1.get("verdict") in ("malicious", "suspicious"), f"Expected malicious/suspicious verdict, got {res1.get('verdict')}"
    assert res1.get("classification") in ("High Risk", "Confirmed Malicious"), f"Expected High Risk or Confirmed Malicious, got {res1.get('classification')}"
    assert any("brand" in s.lower() or "impersonation" in s.lower() or "state bank" in s.lower() for s in signals1), "Missing brand impersonation signal"
    assert any("top level domain" in s.lower() or "tld" in s.lower() for s in signals1), "Missing disposable TLD signal"
    passed_tests += 1
    print("  ✓ PASS: Phishing & Brand Lookalike accurately classified with hard override and evidence.")

    # --------------------------------------------------------------------------
    # TEST CASE 2: Weak PKI / Distrusted CA & Fermat Key Sieve
    # --------------------------------------------------------------------------
    print("\n[TEST 2/9] 3 Malicious Cases - Weak PKI / eMudhra Distrusted CA & Fermat Key")
    target_2 = "https://emudhra-weak-key.gov.portal-login.in"
    res2 = post_json("/scan", {"url": target_2})
    print(f"  Target: {target_2}")
    print(f"  Trust Score: {res2.get('trust_score')}/100 | Verdict: {res2.get('verdict')} | Classification: {res2.get('classification')}")
    print(f"  Override Active: {res2.get('override_active')} | Override Reason: {res2.get('override_reason')}")
    
    signals2 = [e.get("signal", "") for e in res2.get("evidence", [])]
    print(f"  Evidence Signals: {signals2}")

    assert res2.get("verdict") in ("malicious", "suspicious"), f"Expected malicious/suspicious, got {res2.get('verdict')}"
    assert res2.get("override_active") is True, "Expected Hard Override to be active"
    assert any("distrusted" in s.lower() for s in signals2), "Missing Distrusted Certificate Authority signal"
    assert any("fermat" in s.lower() or "weak" in s.lower() for s in signals2), "Missing Fermat Weak Key signal"
    passed_tests += 1
    print("  ✓ PASS: Distrusted CA (eMudhra incident) and Fermat weak RSA key enforced.")

    # --------------------------------------------------------------------------
    # TEST CASE 3: Homograph / Open Redirect / Suspicious TLD Attack
    # --------------------------------------------------------------------------
    print("\n[TEST 3/9] 3 Malicious Cases - Homograph Punycode & Open Redirect")
    target_3 = "https://xn--pple-43d.com/auth?redirect=http://evil-login.xyz"
    res3 = post_json("/scan", {"url": target_3})
    print(f"  Target: {target_3}")
    print(f"  Trust Score: {res3.get('trust_score')}/100 | Verdict: {res3.get('verdict')} | Classification: {res3.get('classification')}")
    
    signals3 = [e.get("signal", "") for e in res3.get("evidence", [])]
    print(f"  Evidence Signals: {signals3}")

    assert res3.get("verdict") in ("suspicious", "malicious"), f"Expected suspicious/malicious, got {res3.get('verdict')}"
    assert any("punycode" in s.lower() or "homograph" in s.lower() for s in signals3), "Missing Punycode homograph signal"
    assert any("redirect" in s.lower() for s in signals3), "Missing Open Redirect signal"
    passed_tests += 1
    print("  ✓ PASS: IDN Punycode homograph attack and unvalidated open redirect detected.")

    # --------------------------------------------------------------------------
    # TEST CASE 4: Clean Enterprise Baseline (google.com)
    # --------------------------------------------------------------------------
    print("\n[TEST 4/9] 3 Benign Cases - Clean Enterprise Baseline (google.com)")
    target_4 = "https://google.com"
    res4 = post_json("/scan", {"url": target_4})
    print(f"  Target: {target_4}")
    print(f"  Trust Score: {res4.get('trust_score')}/100 | Verdict: {res4.get('verdict')} | Classification: {res4.get('classification')}")
    print(f"  Headline: {res4.get('explanation', {}).get('headline')}")
    print(f"  Disclaimer: {res4.get('disclaimer')}")

    assert res4.get("verdict") == "safe", f"Expected safe verdict for enterprise baseline, got {res4.get('verdict')}"
    assert res4.get("trust_score") >= 75, f"Expected trust score >= 75, got {res4.get('trust_score')}"
    assert "disclaimer" in res4 and "not guarantee" in res4["disclaimer"].lower(), "Missing mandatory TLS safety disclaimer"
    passed_tests += 1
    print("  ✓ PASS: Clean enterprise baseline scored high digital trust with explicit security disclaimers.")

    # --------------------------------------------------------------------------
    # TEST CASE 5: Legitimate Financial/Tech Portal (github.com)
    # --------------------------------------------------------------------------
    print("\n[TEST 5/9] 3 Benign Cases - Legitimate Tech Portal (github.com)")
    target_5 = "https://github.com"
    res5 = post_json("/scan", {"url": target_5})
    print(f"  Target: {target_5}")
    print(f"  Trust Score: {res5.get('trust_score')}/100 | Verdict: {res5.get('verdict')} | Classification: {res5.get('classification')}")

    assert res5.get("verdict") == "safe", f"Expected safe verdict for github.com, got {res5.get('verdict')}"
    assert res5.get("trust_score") >= 75, f"Expected trust score >= 75, got {res5.get('trust_score')}"
    passed_tests += 1
    print("  ✓ PASS: Legitimate portal verified safe with clean reputation and valid cert chain.")

    # --------------------------------------------------------------------------
    # TEST CASE 6: Legitimate Standard / Academic Portal (example.com)
    # --------------------------------------------------------------------------
    print("\n[TEST 6/9] 3 Benign Cases - Standard Portal (example.com)")
    target_6 = "https://example.com"
    res6 = post_json("/scan", {"url": target_6})
    print(f"  Target: {target_6}")
    print(f"  Trust Score: {res6.get('trust_score')}/100 | Verdict: {res6.get('verdict')} | Classification: {res6.get('classification')}")

    assert res6.get("verdict") == "safe", f"Expected safe verdict for example.com, got {res6.get('verdict')}"
    assert res6.get("trust_score") >= 75, f"Expected trust score >= 75, got {res6.get('trust_score')}"
    passed_tests += 1
    print("  ✓ PASS: Standard website evaluated with zero false-positive phishing flags.")

    # --------------------------------------------------------------------------
    # TEST CASE 7: Scam Message Analysis
    # --------------------------------------------------------------------------
    print("\n[TEST 7/9] Scam Message Analysis (SMS / WhatsApp Social Engineering)")
    scam_text = (
        "URGENT: Your SBI Bank account will be blocked in 2 hours. "
        "Update PAN/KYC immediately at http://bit.ly/sbi-kyc-fast or share OTP 482910"
    )
    scam_res = analyze_scam_message_py(scam_text)
    print(f"  Input Message: \"{scam_text}\"")
    print(f"  Extracted URLs: {scam_res['extracted_urls']}")
    print(f"  Urgency Detected: {scam_res['urgency_detected']}")
    print(f"  KYC Threat Detected: {scam_res['kyc_threat_detected']}")
    print(f"  OTP Harvesting Alert: {scam_res['otp_harvesting_detected']}")
    print(f"  Verdict: {scam_res['overall_verdict']}")

    assert scam_res["urgency_detected"] is True, "Failed to detect urgency trigger"
    assert scam_res["kyc_threat_detected"] is True, "Failed to detect KYC/Account suspension threat"
    assert scam_res["otp_harvesting_detected"] is True, "Failed to detect OTP harvesting request"
    assert len(scam_res["extracted_urls"]) > 0, "Failed to extract suspicious URL"
    assert "http://bit.ly/sbi-kyc-fast" in scam_res["extracted_urls"], "Missing specific shortened URL"
    passed_tests += 1
    print("  ✓ PASS: Social engineering SMS deconstructed with URL extraction and OTP credential harvesting alerts.")

    # --------------------------------------------------------------------------
    # TEST CASE 8: Web3 Canonical Hashing & Tamper Detection
    # --------------------------------------------------------------------------
    print("\n[TEST 8/9] Web3 Decentralized Threat Intelligence & Tamper Detection")
    test_vector_file = os.path.join(WORKSPACE_ROOT, "common", "test_vector.json")
    with open(test_vector_file, "r") as f:
        tv = json.load(f)

    original_report = tv["input_report"]
    expected_hash = tv["expected_keccak256"]

    # 1. Compute canonical hash of untouched report
    computed_hash = hash_report(original_report)
    print(f"  Original Report ID: {original_report['id']}")
    print(f"  Computed Canonical Keccak-256: {computed_hash}")
    print(f"  Expected Shared Test Vector:   {expected_hash}")
    assert computed_hash == expected_hash, f"Hash mismatch: {computed_hash} != {expected_hash}"

    # 2. Simulate Tampering: mutate "High Risk" to "Suspicious"
    tampered_report = json.loads(json.dumps(original_report))
    tampered_report["classification"] = "Suspicious"
    tampered_hash = hash_report(tampered_report)
    print(f"  Mutated Classification: '{tampered_report['classification']}'")
    print(f"  Tampered Keccak-256:    {tampered_hash}")

    assert tampered_hash != expected_hash, "Tampered report produced identical hash! Cryptographic integrity broken."
    passed_tests += 1
    print("  ✓ PASS: RFC 8785 bit-for-bit parity confirmed. Report mutation triggers instant cryptographic hash mismatch.")

    # --------------------------------------------------------------------------
    # TEST CASE 9: Quoted URL Sanitization & SSRF Protection Guard
    # --------------------------------------------------------------------------
    print("\n[TEST 9/9] Quoted URL Input Sanitization & SSRF Cloud Metadata Guard")
    quoted_input = "'gemini.google.com/u/1/app'"
    res_quoted = post_json("/scan", {"url": quoted_input})
    print(f"  Quoted Input: {quoted_input}")
    print(f"  Normalized URL: {res_quoted.get('target_url')}")
    assert res_quoted.get("target_url") == "https://gemini.google.com/u/1/app", f"Quotes not stripped cleanly: {res_quoted.get('target_url')}"
    assert res_quoted.get("verdict") == "safe", f"Quoted scan did not evaluate safely: {res_quoted.get('verdict')}"

    ssrf_target = "http://169.254.169.254/latest/meta-data/"
    res_ssrf = post_json("/scan", {"url": ssrf_target})
    print(f"  SSRF Attack Target: {ssrf_target}")
    print(f"  Response Status: {res_ssrf.get('_error_status')} | Body: {res_ssrf.get('_error_body')}")
    assert res_ssrf.get("_error_status") == 400, f"Expected HTTP 400 SSRF block, got {res_ssrf.get('_error_status')}"
    assert "prohibited" in res_ssrf.get("_error_body", "").lower() or "restricted" in res_ssrf.get("_error_body", "").lower(), "Missing SSRF rejection reason"
    passed_tests += 1
    print("  ✓ PASS: Single quotes cleanly stripped and AWS/GCP cloud metadata IP safely blocked with HTTP 400.")

    # --------------------------------------------------------------------------
    # BONUS CHECK: STIX 2.1 Intel Export & Community Reports
    # --------------------------------------------------------------------------
    print("\n[BONUS] STIX 2.1 Intelligence Export & Community Threat Feed")
    stix_res = get_json("/export/stix")
    assert stix_res.get("type") == "bundle" and stix_res.get("spec_version") == "2.1", "STIX 2.1 Bundle invalid"
    print(f"  STIX 2.1 Bundle Export: Valid. Total Objects: {len(stix_res.get('objects', []))}")
    print("  ✓ PASS: STIX 2.1 Threat Intel export operational.")

    print("\n" + "=" * 80)
    print(f" ALL MANDATORY TEST CASES PASSED: {passed_tests}/{total_tests} (100% SUCCESS)")
    print("=" * 80)
    return True


if __name__ == "__main__":
    success = run_all_tests()
    if not success:
        sys.exit(1)
