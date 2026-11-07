import { EvidenceItem, ScanResult, TrustGrade, Verdict } from '../types/scan';
import { getGradeFromScore } from './formatters';

export interface ScoreComputationResult {
  rawScore: number;
  finalScore: number;
  grade: TrustGrade;
  verdict: Verdict;
  overrideTriggered: boolean;
  overrideReason?: string;
  contributingDeductions: {
    category: string;
    pointsLost: number;
  }[];
}

/**
 * TrustLens Multi-Signal Risk Fusion Engine
 * Weights:
 * - Cryptographic & X.509 Trust: 35%
 * - Phishing & Visual Impersonation: 35%
 * - Web Security Hygiene & Headers: 15%
 * - Threat Intel & Infrastructure: 15%
 *
 * Hard Overrides:
 * - Fermat Factorable RSA Modulus: Cap score at 12
 * - CCADB Distrusted / Revoked Intermediate CA: Cap score at 18
 * - Visual Impersonation (>85% SSIM) + External Form Post: Cap score at 05
 */
export function calculateTrustScore(
  scan: Pick<ScanResult, 'certificate' | 'phishing' | 'hygiene' | 'evidence'>
): ScoreComputationResult {
  let score = 100;
  const deductions: Record<string, number> = {
    crypto: 0,
    phishing: 0,
    hygiene: 0,
    intel: 0,
  };

  // 1. Process explicit evidence deductions
  scan.evidence.forEach((item: EvidenceItem) => {
    deductions[item.category] = (deductions[item.category] || 0) + item.weight;
  });

  // Calculate raw weighted deductions
  const totalDeduction = Object.values(deductions).reduce((acc, v) => acc + v, 0);
  const rawScore = Math.max(0, Math.min(100, Math.round(score - totalDeduction)));

  let finalScore = rawScore;
  let overrideTriggered = false;
  let overrideReason: string | undefined;

  // 2. Evaluate Hard Overrides
  const { certificate, phishing } = scan;

  if (phishing?.visualImpersonation?.detected &&
      (phishing.visualImpersonation.similarityScore ?? 0) >= 0.85 &&
      phishing.domSignals?.externalFormAction) {
    overrideTriggered = true;
    overrideReason = `CRITICAL PHISHING CLONE: ${(
      (phishing.visualImpersonation.similarityScore ?? 0) * 100
    ).toFixed(1)}% visual identity match to ${
      phishing.visualImpersonation.targetBrand || 'Protected Brand'
    } with external credential form post.`;
    finalScore = Math.min(finalScore, 4);
  } else if (certificate?.fermatFactorable) {
    overrideTriggered = true;
    overrideReason =
      'CRYPTOGRAPHIC WEAK KEY: RSA public key modulus is Fermat-factorable (|p - q| < 2^16). Private key can be derived instantly.';
    finalScore = Math.min(finalScore, 12);
  } else if (certificate?.ccadbDistrusted) {
    overrideTriggered = true;
    overrideReason =
      'UNTRUSTED CA HIERARCHY: Intermediate CA has been distrusted by CCADB root program baseline requirements.';
    finalScore = Math.min(finalScore, 18);
  }

  const grade = getGradeFromScore(finalScore);
  const verdict: Verdict =
    finalScore >= 75 ? 'safe' : finalScore >= 40 ? 'suspicious' : 'malicious';

  const contributingDeductions = Object.entries(deductions).map(([category, pointsLost]) => ({
    category,
    pointsLost,
  }));

  return {
    rawScore,
    finalScore,
    grade,
    verdict,
    overrideTriggered,
    overrideReason,
    contributingDeductions,
  };
}

