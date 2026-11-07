import { describe, it, expect } from 'vitest';
import { calculateTrustScore } from '../src/lib/utils/trustScore';
import { MOCK_SCANS } from '../src/lib/mocks/scanData';

describe('TrustLens Risk Fusion Engine & Hard Overrides', () => {
  it('activates hard override when high similarity brand clone has external form action', () => {
    const sbiMock = MOCK_SCANS['scan-sbi-phish'];
    const result = calculateTrustScore(sbiMock);

    expect(result.overrideTriggered).toBe(true);
    expect(result.finalScore).toBeLessThanOrEqual(5);
    expect(result.verdict).toBe('malicious');
    expect(result.grade).toBe('F');
    expect(result.overrideReason).toContain('CRITICAL PHISHING CLONE');
  });

  it('caps trust score at 12 when RSA key is Fermat-factorable', () => {
    const cryptoMock = MOCK_SCANS['scan-emudhra-crypto'];
    const result = calculateTrustScore(cryptoMock);

    expect(result.overrideTriggered).toBe(true);
    expect(result.finalScore).toBeLessThanOrEqual(15);
    expect(result.grade).toBe('F');
    expect(result.overrideReason).toContain('CRYPTOGRAPHIC WEAK KEY');
  });

  it('correctly scores pristine enterprise domains above 90 with Grade A', () => {
    const cleanMock = MOCK_SCANS['scan-github-clean'];
    const result = calculateTrustScore(cleanMock);

    expect(result.overrideTriggered).toBe(false);
    expect(result.finalScore).toBeGreaterThanOrEqual(90);
    expect(result.verdict).toBe('safe');
    expect(result.grade).toBe('A');
  });
});

