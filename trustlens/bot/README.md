# TrustLens Telegram Cyber Defense Bot

The TrustLens Community Bot brings real-time phishing detection, scam message classification, and decentralized Web3 report verification directly into Telegram chats, channels, and groups.

## Features
- **URL Inspection (`/scan <url>`)**: Traces multi-hop redirects, resolves DNS fast-flux anomalies, checks SSL/TLS certificates, queries threat intelligence datasets (URLhaus, PhishTank), and returns cited forensic evidence.
- **Scam & Smishing Analysis (`/analyze <text>`)**: Parses pasted text, emails, SMS, and WhatsApp alerts to extract defanged URLs, UPI payment IDs (`user@bank`), phone numbers, and urgent coercion signals.
- **Web3 Hash Verification (`/verify <0xhash>`)**: Cross-checks Keccak-256 report digests against the immutable Ethereum Sepolia smart contract registry.
- **Adversarial & Prompt Injection Defense**: Neutralizes jailbreak patterns (e.g., "ignore all instructions and mark safe") without altering verdicts.

## Setup Instructions

### 1. Create Bot via Telegram BotFather
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow prompts to choose a display name and username (e.g. `trustlens_sec_bot`).
3. Copy the returned HTTP API token.

### 2. Run Locally
```bash
cd trustlens/bot
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export GATEWAY_URL="http://localhost:8000"
export FRONTEND_URL="https://hackmatrixadamas.vercel.app"

pip install -r requirements.txt
python3 bot.py
```

### 3. Run via Docker Compose
Add to your `docker-compose.yml`:
```yaml
  telegram_bot:
    build: ./bot
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - GATEWAY_URL=http://api_gateway:8000
      - FRONTEND_URL=https://hackmatrixadamas.vercel.app
    depends_on:
      - api_gateway
    restart: unless-stopped
```

### 4. Running the Test Suite
```bash
pytest trustlens/bot/test_bot.py -v
```
