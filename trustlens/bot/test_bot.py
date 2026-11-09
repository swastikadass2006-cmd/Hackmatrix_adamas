#!/usr/bin/env python3
"""
Unit and Integration Test Suite for TrustLens Telegram Bot
Mocks the Telegram HTTP API to test all bot handlers end-to-end.
"""

import os
import sys
import pytest
import asyncio
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import bot

def test_defang_utility():
    assert bot.defang("https://bad-domain.top/path") == "hxxps://bad-domain[.]top/path"
    assert bot.defang("http://phish.xyz") == "hxxp://phish[.]xyz"
    assert bot.defang("example.com") == "example[.]com"

def test_start_message_invariants():
    msg = bot.format_start_message()
    assert "/scan" in msg
    assert "/analyze" in msg
    assert "/verify" in msg
    assert "No indicators found" in msg
    assert "never as an absolute guarantee of safety" in msg

def test_scan_response_formatting_phishing():
    mock_scan_data = {
        "url": "https://secure-sbi-update.top",
        "classification": "Confirmed Malicious",
        "risk_score": 96,
        "timestamp": "2026-11-09T20:00:00Z",
        "findings": [
            {
                "id": "SEC-PHISH-01",
                "signal": "Brand Impersonation Target",
                "explanation": "URL targets 'sbi' with unverified apex domain.",
                "severity": "critical"
            }
        ],
        "limitations": ["OCSP endpoint not queried in passive mode"],
        "scan_id": "TL-SCAN-12345"
    }

    formatted = bot.format_scan_response(mock_scan_data)
    assert "CONFIRMED MALICIOUS" in formatted
    assert "96/100" in formatted
    assert "hxxps://secure-sbi-update[.]top" in formatted
    assert "SEC-PHISH-01" in formatted
    assert "NOT a guarantee of safety" in formatted

def test_scan_response_formatting_benign():
    mock_clean_data = {
        "url": "https://example.com",
        "classification": "No indicators found",
        "risk_score": 0,
        "timestamp": "2026-11-09T20:00:00Z",
        "findings": [],
        "limitations": ["Passive inspection only"],
        "scan_id": "TL-SCAN-67890"
    }

    formatted = bot.format_scan_response(mock_clean_data)
    assert "NO INDICATORS FOUND" in formatted
    assert "Safe" not in formatted or "NOT a guarantee of safety" in formatted
    assert "0/100" in formatted

def test_analyze_response_formatting_scam():
    mock_analyze_data = {
        "classification": "High Risk",
        "confidence": 92,
        "plain_language_summary": "Extracted fake SBI KYC link targeting credentials.",
        "extracted_indicators": {
            "urls_defanged": ["hxxps://sbi-pan-kyc[.]top"],
            "upi_ids": ["scammer@okhdfcbank"],
            "phone_numbers": ["+919876543210"]
        },
        "language_signals": [
            {"flag": "Urgency Trigger", "description": "Demands action within 24 hours."}
        ]
    }

    formatted = bot.format_analyze_response(mock_analyze_data)
    assert "HIGH RISK FINANCIAL SCAM" in formatted
    assert "92%" in formatted
    assert "hxxps://sbi-pan-kyc[.]top" in formatted
    assert "scammer@okhdfcbank" in formatted
    assert "Signals, not proof" in formatted
    assert "Urgency or banking vocabulary alone does not confirm fraud" in formatted

def test_bot_update_handler():
    sent_messages = []

    async def _async_test():
        async def mock_post(url, json=None, **kwargs):
            if "sendMessage" in str(url):
                sent_messages.append(json)
                mock_resp = AsyncMock()
                mock_resp.raise_for_status = lambda: None
                mock_resp.status_code = 200
                return mock_resp
            return AsyncMock()

        mock_client = AsyncMock()
        mock_client.post = mock_post

        update = {
            "update_id": 1,
            "message": {
                "chat": {"id": 12345},
                "text": "/start"
            }
        }
        with patch.object(bot, "TELEGRAM_BOT_TOKEN", "mock_token_123"):
            await bot.handle_update(mock_client, update)

    asyncio.run(_async_test())

    assert len(sent_messages) == 1
    assert "Welcome to TrustLens" in sent_messages[0]["text"]
