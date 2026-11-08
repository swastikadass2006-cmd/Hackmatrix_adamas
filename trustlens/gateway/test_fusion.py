from services.fusion_engine import classify_website

engine_results = [
    {
        "engine": "AI Engine",
        "findings": [
            {
                "id": "AI-001",
                "signal": "Suspicious URL pattern",
                "severity": "medium",
                "evidence": "Suspicious keywords found"
            }
        ],
        "coverage": {
            "completed": 4,
            "total": 4
        },
        "limitations": []
    },
    {
        "engine": "Rust Security Engine",
        "findings": [],
        "coverage": {
            "completed": 3,
            "total": 4
        },
        "limitations": ["OCSP check unavailable"]
    }
]

result = classify_website(engine_results)

print(result)
