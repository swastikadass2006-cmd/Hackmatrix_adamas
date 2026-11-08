export interface ExtractedIndicator {
  type: 'url' | 'upi' | 'phone' | 'email';
  raw: string;
  defanged: string;
  category: string;
}

export interface LanguageSignal {
  pattern: string;
  category: 'Urgency & Coercion' | 'KYC & Account Threats' | 'Financial & Reward Hooks' | 'Credential Harvesting';
  snippet: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface VerifiedEvidenceSignal {
  indicator: string;
  source: 'Cert Linter' | 'Lexical Model' | 'Brand Watchlist' | 'Threat Graph';
  verdict: 'High Risk' | 'Suspicious' | 'Malicious' | 'Unverified';
  detail: string;
}

export interface ScamAnalysisResult {
  indicators: ExtractedIndicator[];
  languageSignals: LanguageSignal[];
  verifiedEvidence: VerifiedEvidenceSignal[];
  riskSummary: {
    urgencyScore: number;
    financialRiskScore: number;
    overallRecommendation: string;
  };
}

/**
 * Defangs a URL or domain to prevent accidental clicks:
 * https://example.com -> hxxps://example[.]com
 */
export function defangUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, (m) => (m.toLowerCase().startsWith('https') ? 'hxxps://' : 'hxxp://'))
    .replace(/\./g, '[.]');
}

export function defangEmail(email: string): string {
  return email.replace('@', '[at]').replace(/\./g, '[.]');
}

/**
 * Scans a text message for indicators (URLs, UPI, Phone numbers, Emails)
 * and evaluates suspicious social engineering language patterns.
 */
export function analyzeScamMessage(text: string): ScamAnalysisResult {
  const indicators: ExtractedIndicator[] = [];
  const languageSignals: LanguageSignal[] = [];
  const verifiedEvidence: VerifiedEvidenceSignal[] = [];

  // 1. Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|org|net|top|xyz|biz|live|info|club|site|app|click)(?:\/[^\s]*)?)/gi;
  const urlsFound: string[] = text.match(urlRegex) || [];
  for (const url of Array.from(new Set(urlsFound))) {
    indicators.push({
      type: 'url',
      raw: url,
      defanged: defangUrl(url),
      category: 'Target Hyperlink',
    });

    // Check for lookalikes
    const lower = url.toLowerCase();
    if (lower.includes('sbi') || lower.includes('hdfc') || lower.includes('pan') || lower.includes('kyc') || lower.includes('aadhaar')) {
      verifiedEvidence.push({
        indicator: defangUrl(url),
        source: 'Brand Watchlist',
        verdict: 'High Risk',
        detail: 'Lookalike domain impersonating Indian Banking/Statutory identity.',
      });
    }

    if (lower.includes('.top') || lower.includes('.xyz') || lower.includes('.click') || lower.includes('.live')) {
      verifiedEvidence.push({
        indicator: defangUrl(url),
        source: 'Lexical Model',
        verdict: 'Suspicious',
        detail: 'Abused low-reputation top-level domain (TLD) frequently weaponized in spear phishing.',
      });
    }
  }

  // 2. Extract UPI IDs (e.g. user@okhdfcbank, payment@paytm)
  const upiRegex = /[a-zA-Z0-9._-]+@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|upi|freecharge)/gi;
  const upisFound: string[] = text.match(upiRegex) || [];
  for (const upi of Array.from(new Set(upisFound))) {
    indicators.push({
      type: 'upi',
      raw: upi,
      defanged: upi.replace('@', '[@]'),
      category: 'Unified Payments Interface (UPI)',
    });
  }

  // 3. Extract Phone numbers (+91-9876543210, 1800..., 9876543210)
  const phoneRegex = /(?:\+91[\s-]?)?[6789]\d{9}|1800[\s-]?\d{3}[\s-]?\d{3,4}/g;
  const phonesFound: string[] = text.match(phoneRegex) || [];
  for (const phone of Array.from(new Set(phonesFound))) {
    indicators.push({
      type: 'phone',
      raw: phone,
      defanged: phone.slice(0, 3) + '***' + phone.slice(-3),
      category: 'Origin Contact Number',
    });
  }

  // 4. Extract Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailsFound: string[] = text.match(emailRegex) || [];
  for (const email of Array.from(new Set(emailsFound))) {
    if (!upisFound.includes(email)) {
      indicators.push({
        type: 'email',
        raw: email,
        defanged: defangEmail(email),
        category: 'Contact Mailbox',
      });
    }
  }

  // 5. Linguistic Heuristics (Signals, not proof)
  const patterns: Array<{
    regex: RegExp;
    category: LanguageSignal['category'];
    name: string;
    severity: LanguageSignal['severity'];
  }> = [
    {
      regex: /(immediately|within 24 hours|urgent|account suspended|deactivated today|last warning|blocked)/i,
      category: 'Urgency & Coercion',
      name: 'Time Pressure & Coercion Trap',
      severity: 'high',
    },
    {
      regex: /(kyc pending|update pan|pan card|electricity power will be cut|aadhaar update|biometric lock)/i,
      category: 'KYC & Account Threats',
      name: 'Statutory / KYC Threat Theme',
      severity: 'high',
    },
    {
      regex: /(lottery|won rs|reward of|cashback credited|income tax refund approved|crypto gift|congratulations)/i,
      category: 'Financial & Reward Hooks',
      name: 'Enticement & Greed Hook',
      severity: 'medium',
    },
    {
      regex: /(share otp|send 6-digit pin|enter debit card|cvv|netbanking password)/i,
      category: 'Credential Harvesting',
      name: 'Direct Credential / OTP Request',
      severity: 'critical',
    },
  ];

  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) {
      languageSignals.push({
        pattern: p.name,
        category: p.category,
        snippet: `"...${match[0]}..."`,
        severity: p.severity,
        confidence: p.severity === 'critical' ? 0.95 : 0.85,
      });
    }
  }

  return {
    indicators,
    languageSignals,
    verifiedEvidence,
    riskSummary: {
      urgencyScore: languageSignals.filter((s) => s.category === 'Urgency & Coercion').length > 0 ? 85 : 15,
      financialRiskScore: languageSignals.filter((s) => s.category === 'Credential Harvesting').length > 0 ? 95 : 40,
      overallRecommendation:
        languageSignals.some((s) => s.severity === 'critical') || verifiedEvidence.some((e) => e.verdict === 'High Risk')
          ? 'CRITICAL ALERT: High probability social engineering scam. Do not open links or share credentials.'
          : languageSignals.length > 0
          ? 'CAUTION: Message exhibits coercive urgency heuristics. Treat unverified links with caution.'
          : 'Low suspicion detected in message body. Verify any attached links through the Deep Scanner.',
    },
  };
}
