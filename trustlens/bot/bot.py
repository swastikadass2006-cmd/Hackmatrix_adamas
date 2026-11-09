#!/usr/bin/env python3
"""
TrustLens Community Cyber-Threat Telegram Bot
Provides automated threat intelligence, suspicious message triage, URL scanning,
and Web3 hash verification directly in Telegram.
"""

import os
import sys
import re
import html
import asyncio
import logging
from typing import Optional, Dict, Any
import httpx

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("trustlens-bot")

# Configuration from environment
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://127.0.0.1:8000").rstrip("/")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://hackmatrixadamas.vercel.app").rstrip("/")

def check_token() -> bool:
    if not TELEGRAM_BOT_TOKEN:
        print("\n" + "="*70)
        print("  TRUSTLENS TELEGRAM BOT - CONFIGURATION REQUIRED")
        print("="*70)
        print("Error: TELEGRAM_BOT_TOKEN environment variable is not set.\n")
        print("How to set up your bot with Telegram BotFather:")
        print("1. Open Telegram and search for @BotFather")
        print("2. Send /newbot and choose a name (e.g. 'TrustLens Security Bot')")
        print("3. Choose a unique username ending in 'bot' (e.g. 'trustlens_adamas_bot')")
        print("4. Copy the HTTP API token provided by BotFather")
        print("5. Export the token into your environment:")
        print("   export TELEGRAM_BOT_TOKEN=\"<YOUR_API_TOKEN>\"")
        print("6. Run the bot:")
        print("   python3 trustlens/bot/bot.py\n")
        print("="*70 + "\n")
        return False
    return True

def defang(target: str) -> str:
    """Safely defangs dangerous links and domain names for display."""
    if not target:
        return ""
    d = target.replace("http://", "hxxp://").replace("https://", "hxxps://")
    if "://" in d:
        scheme, rest = d.split("://", 1)
        if "/" in rest:
            host, path = rest.split("/", 1)
            return f"{scheme}://{host.replace('.', '[.]')}/{path}"
        else:
            return f"{scheme}://{rest.replace('.', '[.]')}"
    return d.replace(".", "[.]")

def format_start_message() -> str:
    return (
        "<b>🛡️ Welcome to TrustLens Cyber Defense Bot</b>\n\n"
        "TrustLens is your decentralized, multi-engine cybersecurity assistant "
        "designed to protect against phishing, credential theft, and UPI/SMS scams.\n\n"
        "<b>Available Commands:</b>\n"
        "• <code>/scan &lt;url&gt;</code> — In-depth multi-engine scan of a website\n"
        "• <code>/analyze &lt;message&gt;</code> — Analyze SMS / email / WhatsApp / UPI alert\n"
        "• <code>/verify &lt;0xhash&gt;</code> — Verify immutable Web3 proof on Sepolia\n"
        "• <code>/help</code> — Show this usage guide\n\n"
        "<i>Or simply paste any suspicious text or link directly here!</i>\n\n"
        "<b>Governance & Safety Rule:</b>\n"
        "TrustLens operates under the principle of positive evidence. "
        "Absence of detected threats is reported as <i>'No indicators found'</i>, "
        "never as an absolute guarantee of safety."
    )

async def scan_url_api(url: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(f"{GATEWAY_URL}/api/v1/scan", json={"url": url})
        resp.raise_for_status()
        return resp.json()

async def analyze_message_api(message: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(f"{GATEWAY_URL}/api/v1/analyze", json={"message": message})
        resp.raise_for_status()
        return resp.json()

def format_scan_response(data: Dict[str, Any]) -> str:
    classification = data.get("classification", "Inconclusive")
    risk_score = data.get("risk_score", 0)
    target_url = defang(data.get("url", ""))

    badge_map = {
        "Confirmed Malicious": "🚨 <b>CONFIRMED MALICIOUS</b>",
        "High Risk": "⛔ <b>HIGH RISK THREAT</b>",
        "Suspicious": "⚠️ <b>SUSPICIOUS ACTIVITY</b>",
        "No indicators found": "ℹ️ <b>NO INDICATORS FOUND</b>",
        "Inconclusive": "🔍 <b>INCONCLUSIVE</b>"
    }
    badge = badge_map.get(classification, f"<b>{classification.upper()}</b>")

    findings = data.get("findings", [])
    top_findings = findings[:3]
    evidence_text = ""
    for f in top_findings:
        fid = f.get("id", "EVID")
        signal = html.escape(f.get("signal", "Signal"))
        exp = html.escape(f.get("explanation", ""))
        evidence_text += f"• [<code>{fid}</code>] <b>{signal}</b>: {exp}\n"

    if not evidence_text:
        evidence_text = "• No overt malicious patterns detected in target URL structure.\n"

    limitations = data.get("limitations", [])
    limitations_text = ""
    for lim in limitations[:2]:
        limitations_text += f"• <i>{html.escape(lim)}</i>\n"

    report_id = data.get("scan_id", "")
    portal_link = f"{FRONTEND_URL}/threat-console"

    msg = (
        f"{badge}\n\n"
        f"<b>Target:</b> <code>{target_url}</code>\n"
        f"<b>Risk Score:</b> {risk_score}/100\n"
        f"<b>Timestamp:</b> {data.get('timestamp', 'N/A')}\n\n"
        f"<b>Key Evidence (Deterministic):</b>\n{evidence_text}\n"
    )

    if limitations_text:
        msg += f"<b>Analysis Limitations:</b>\n{limitations_text}\n"

    msg += (
        f"<b>Notice:</b> Clean scans reflect absence of known indicators, NOT a guarantee of safety.\n"
        f"🔗 <a href=\"{portal_link}\">View Interactive Forensic Threat Graph</a>"
    )
    return msg

def format_analyze_response(data: Dict[str, Any]) -> str:
    classification = data.get("classification", "Inconclusive")
    confidence = data.get("confidence", 0)
    summary = html.escape(data.get("plain_language_summary", ""))

    badge_map = {
        "Confirmed Malicious": "🚨 <b>CONFIRMED SCAM / FRAUD</b>",
        "High Risk": "⛔ <b>HIGH RISK FINANCIAL SCAM</b>",
        "Suspicious": "⚠️ <b>SUSPICIOUS MESSAGE</b>",
        "No indicators found": "ℹ️ <b>NO OVERT SCAM INDICATORS DETECTED</b>",
        "Inconclusive": "🔍 <b>INCONCLUSIVE</b>"
    }
    badge = badge_map.get(classification, f"<b>{classification.upper()}</b>")

    indicators = data.get("extracted_indicators", {})
    defanged_urls = indicators.get("urls_defanged", [])
    upis = indicators.get("upi_ids", [])
    phones = indicators.get("phone_numbers", [])

    ind_text = ""
    if defanged_urls:
        ind_text += f"• <b>URLs:</b> {', '.join(f'<code>{u}</code>' for u in defanged_urls[:3])}\n"
    if upis:
        ind_text += f"• <b>UPI IDs:</b> {', '.join(f'<code>{u}</code>' for u in upis[:3])}\n"
    if phones:
        ind_text += f"• <b>Phone Numbers:</b> {', '.join(f'<code>{p}</code>' for p in phones[:3])}\n"

    signals = data.get("language_signals", [])
    sig_text = ""
    for s in signals[:3]:
        flag = html.escape(s.get("flag", ""))
        desc = html.escape(s.get("description", ""))
        sig_text += f"• <i>{flag}</i>: {desc}\n"

    msg = (
        f"{badge}\n\n"
        f"<b>Confidence:</b> {confidence}%\n\n"
        f"<b>Assessment:</b>\n{summary}\n\n"
    )

    if ind_text:
        msg += f"<b>Extracted Indicators:</b>\n{ind_text}\n"

    if sig_text:
        msg += f"<b>Heuristic Signals (Signals, not proof):</b>\n{sig_text}\n"

    msg += (
        "<b>Important:</b> Urgency or banking vocabulary alone does not confirm fraud; "
        "always cross-verify via your official banking application."
    )
    return msg

async def send_telegram_message(client: httpx.AsyncClient, chat_id: int, text: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    try:
        r = await client.post(url, json=payload)
        r.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to send telegram message to {chat_id}: {e}")

async def handle_update(client: httpx.AsyncClient, update: Dict[str, Any]):
    message = update.get("message")
    if not message:
        return
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text", "").strip()
    if not text or not chat_id:
        return

    logger.info(f"Received message from chat {chat_id}: {text[:50]}...")

    if text in ("/start", "/help"):
        await send_telegram_message(client, chat_id, format_start_message())
        return

    if text.startswith("/scan"):
        url = text[len("/scan"):].strip()
        if not url:
            await send_telegram_message(
                client, chat_id, "<b>Usage:</b> <code>/scan https://example.com</code>"
            )
            return
        await send_telegram_message(client, chat_id, f"🔍 <i>Analyzing target {defang(url)} across multi-signal layers...</i>")
        try:
            result = await scan_url_api(url)
            await send_telegram_message(client, chat_id, format_scan_response(result))
        except Exception as e:
            logger.error(f"Scan API error: {e}")
            await send_telegram_message(client, chat_id, f"❌ <b>Scan Error:</b> {html.escape(str(e))}")
        return

    if text.startswith("/verify"):
        report_hash = text[len("/verify"):].strip()
        if not report_hash or not report_hash.startswith("0x") or len(report_hash) != 66:
            await send_telegram_message(
                client, chat_id,
                "<b>Usage:</b> <code>/verify 0x&lt;64_hex_chars&gt;</code>\n"
                "Example: <code>/verify 0xc04031a7ae4138079beefb150468f6d2c17059f775561ebc4a8edfc3227dff10</code>"
            )
            return

        verifier_url = f"{FRONTEND_URL}/verify?hash={report_hash}"
        msg = (
            f"<b>⛓️ Web3 Immutable Report Verification</b>\n\n"
            f"<b>Target Digest:</b> <code>{report_hash}</code>\n"
            f"<b>Registry Contract:</b> Sepolia Testnet\n\n"
            f"🔗 <a href=\"{verifier_url}\">Open Cryptographic Proof on TrustLens Verifier</a>"
        )
        await send_telegram_message(client, chat_id, msg)
        return

    # Check if text contains a raw URL
    url_match = re.search(r"https?://[^\s]+", text)
    if url_match and len(text) < 150:
        url = url_match.group(0)
        await send_telegram_message(client, chat_id, f"🔍 <i>Detected URL: Analyzing {defang(url)}...</i>")
        try:
            result = await scan_url_api(url)
            await send_telegram_message(client, chat_id, format_scan_response(result))
            return
        except Exception as e:
            logger.warning(f"Scan fallback failed, running message analyzer: {e}")

    # Default to Scam / Message analysis for general text / SMS
    await send_telegram_message(client, chat_id, "🤖 <i>Evaluating message for cyber-threats & financial scams...</i>")
    try:
        result = await analyze_message_api(text)
        await send_telegram_message(client, chat_id, format_analyze_response(result))
    except Exception as e:
        logger.error(f"Message analysis error: {e}")
        await send_telegram_message(client, chat_id, f"❌ <b>Analysis Error:</b> {html.escape(str(e))}")

async def run_bot_loop():
    if not check_token():
        sys.exit(0)

    offset = 0
    poll_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    logger.info("TrustLens Telegram Bot service initiated. Listening for updates...")

    async with httpx.AsyncClient(timeout=35.0) as client:
        while True:
            try:
                resp = await client.get(poll_url, params={"offset": offset, "timeout": 25})
                if resp.status_code == 200:
                    data = resp.json()
                    for update in data.get("result", []):
                        offset = max(offset, update["update_id"] + 1)
                        await handle_update(client, update)
                elif resp.status_code == 401:
                    logger.error("Invalid TELEGRAM_BOT_TOKEN provided.")
                    break
                else:
                    await asyncio.sleep(2.0)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Polling error: {e}")
                await asyncio.sleep(3.0)

if __name__ == "__main__":
    try:
        asyncio.run(run_bot_loop())
    except KeyboardInterrupt:
        print("\nBot stopped by user.")
