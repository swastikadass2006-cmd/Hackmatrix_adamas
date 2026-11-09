#!/usr/bin/env python3
"""
TrustLens Latency Benchmarking Harness
Measures p50, p90, p95, and max latency across core microservices and routes.
Generates structured performance logs in results/latency_benchmark.json.
"""

import os
import sys
import json
import time
import statistics
import urllib.request
import urllib.error

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://127.0.0.1:8000").rstrip("/")
RUST_ENGINE_URL = os.getenv("RUST_ENGINE_URL", "http://127.0.0.1:8001").rstrip("/")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

def measure_endpoint(url: str, method: str = "GET", payload: dict = None, iterations: int = 15) -> dict:
    latencies = []
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"} if payload else {}

    # Warmup ping
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
    except Exception:
        pass

    for _ in range(iterations):
        t0 = time.perf_counter()
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp.read()
            elapsed_ms = (time.perf_counter() - t0) * 1000
            latencies.append(elapsed_ms)
        except Exception as e:
            # Record failed request with large latency or skip
            pass
        time.sleep(0.05)

    if not latencies:
        return {"error": "All requests failed", "samples": 0}

    latencies.sort()
    n = len(latencies)
    p50 = statistics.median(latencies)
    p90 = latencies[int(n * 0.90)]
    p95 = latencies[int(n * 0.95)] if int(n * 0.95) < n else latencies[-1]
    mean = statistics.mean(latencies)

    return {
        "samples": n,
        "min_ms": round(latencies[0], 2),
        "mean_ms": round(mean, 2),
        "p50_ms": round(p50, 2),
        "p90_ms": round(p90, 2),
        "p95_ms": round(p95, 2),
        "max_ms": round(latencies[-1], 2),
    }

def main():
    print("=" * 70)
    print("  TrustLens Microservices Latency Benchmarking (p50 / p95)")
    print("=" * 70)

    benchmarks = {}

    # 1. Gateway Health Check
    print("Benchmarking: Gateway Health (/health)...")
    benchmarks["gateway_health"] = measure_endpoint(f"{GATEWAY_URL}/health", "GET", iterations=20)

    # 2. Rust Security Engine Health Check
    print("Benchmarking: Rust Security Engine Health (/health)...")
    benchmarks["rust_engine_health"] = measure_endpoint(f"{RUST_ENGINE_URL}/health", "GET", iterations=20)

    # 3. Rust Security Engine RFC 8785 Canonicalization & Keccak-256
    print("Benchmarking: RFC 8785 Canonicalizer (/canonicalize)...")
    sample_payload = {
        "id": "BENCH-01",
        "target": "https://example.com",
        "timestamp": "2026-11-09T20:00:00Z",
        "classification": "No indicators found",
        "risk_score": 0,
        "findings": [{"id": "EVID-1", "signal": "Clean"}],
    }
    benchmarks["rust_canonicalize"] = measure_endpoint(
        f"{RUST_ENGINE_URL}/canonicalize", "POST", sample_payload, iterations=25
    )

    # 4. Message Scam Analyzer (/api/v1/analyze)
    print("Benchmarking: Message Scam Analyzer (/api/v1/analyze)...")
    msg_payload = {"message": "Dear customer, your bank account is suspended. Update at http://scam.xyz"}
    benchmarks["message_analyzer"] = measure_endpoint(
        f"{GATEWAY_URL}/api/v1/analyze", "POST", msg_payload, iterations=15
    )

    # 5. Full Multi-Signal Website Scanner (/api/v1/scan)
    print("Benchmarking: Full Multi-Signal URL Scan (/api/v1/scan)...")
    url_payload = {"url": "https://example.com"}
    benchmarks["url_scanner_benign"] = measure_endpoint(
        f"{GATEWAY_URL}/api/v1/scan", "POST", url_payload, iterations=10
    )

    print("\n" + "=" * 70)
    print("  BENCHMARK RESULTS SUMMARY (in milliseconds)")
    print("=" * 70)
    print(f"{'Endpoint / Service':<32} | {'p50 (ms)':<10} | {'p90 (ms)':<10} | {'p95 (ms)':<10} | {'Mean (ms)'}")
    print("-" * 75)

    for name, m in benchmarks.items():
        if "error" in m:
            print(f"{name:<32} | FAILED ({m['error']})")
        else:
            print(f"{name:<32} | {m['p50_ms']:<10} | {m['p90_ms']:<10} | {m['p95_ms']:<10} | {m['mean_ms']}")

    print("=" * 70)

    output_file = os.path.join(RESULTS_DIR, "latency_benchmark.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "benchmarks": benchmarks
        }, f, indent=2)

    print(f"\n✓ Saved latency benchmark report to: {output_file}\n")

if __name__ == "__main__":
    main()
