import os
import sys
import json
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from services.canonical_hasher import canonicalize_json_report, hash_report, keccak_256


def get_test_vector_path():
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "common", "test_vector.json")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "common", "test_vector.json")),
        "/app/common/test_vector.json",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def test_canonical_json_and_keccak256_conformance():
    test_vector_path = get_test_vector_path()
    assert test_vector_path is not None, "Test vector file not found"

    with open(test_vector_path, "r", encoding="utf-8") as f:
        tv = json.load(f)

    input_report = tv["input_report"]
    expected_canonical = tv["expected_canonical_json"]
    expected_hash = tv["expected_keccak256"]

    # 1. Verify RFC 8785 Canonical JSON output
    canon_str = canonicalize_json_report(input_report)
    assert canon_str == expected_canonical, "Canonical JSON string does not match RFC 8785 specification"

    # 2. Verify Keccak-256 Digest output
    computed_hash = hash_report(input_report)
    assert computed_hash == expected_hash, f"Hash mismatch: expected {expected_hash}, got {computed_hash}"

def test_tamper_detection():
    test_vector_path = get_test_vector_path()
    assert test_vector_path is not None, "Test vector file not found"

    with open(test_vector_path, "r", encoding="utf-8") as f:
        tv = json.load(f)


    original_report = tv["input_report"]
    original_hash = hash_report(original_report)

    # Tamper with single classification field
    tampered_report = json.loads(json.dumps(original_report))
    tampered_report["classification"] = "Suspicious"
    tampered_hash = hash_report(tampered_report)

    assert tampered_hash != original_hash, "Tampered report must produce a distinct cryptographic digest"
