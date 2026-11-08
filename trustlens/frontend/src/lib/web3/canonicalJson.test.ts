import { describe, it, expect } from 'vitest';
import { canonicalizeJson, hashReport } from './canonicalJson';

describe('RFC 8785 Canonical JSON & Keccak-256 Parity', () => {
  const testReport = {
    id: 'TL-2026-TEST01',
    timestamp: '2026-11-08T12:00:00Z',
    target: 'https://secure-login-hdfc.phish-alert.top',
    classification: 'High Risk',
    evidence_coverage: {
      completed: 7,
      total: 8,
      display: '7 of 8 checks completed',
    },
    findings: [
      {
        id: 'AI-001',
        signal: 'Domain Typosquatting',
        severity: 'high',
        source: 'Lexical Model',
      },
    ],
    limitations: ['OCSP endpoint unreachable'],
    salt: 'a9f182c4-0000-4b6e-9271-trustlens',
    tx_hash: '0xexcluded_post_hash_field_should_not_affect_hash',
  };

  const expectedCanonicalJson =
    '{"classification":"High Risk","evidence_coverage":{"completed":7,"display":"7 of 8 checks completed","total":8},"findings":[{"id":"AI-001","severity":"high","signal":"Domain Typosquatting","source":"Lexical Model"}],"id":"TL-2026-TEST01","limitations":["OCSP endpoint unreachable"],"salt":"a9f182c4-0000-4b6e-9271-trustlens","target":"https://secure-login-hdfc.phish-alert.top","timestamp":"2026-11-08T12:00:00Z"}';

  const expectedHash = '0xc04031a7ae4138079beefb150468f6d2c17059f775561ebc4a8edfc3227dff10';

  it('produces exact RFC 8785 canonical JSON matching Python backend', () => {
    const canon = canonicalizeJson(testReport);
    expect(canon).toBe(expectedCanonicalJson);
  });

  it('computes exact keccak256 hash matching Python backend and Solidity', () => {
    const computedHash = hashReport(testReport);
    expect(computedHash).toBe(expectedHash);
  });

  it('detects tampering when one character is modified', () => {
    const tampered = { ...testReport, classification: 'High risk' }; // lowercase 'r'
    const tamperedHash = hashReport(tampered);
    expect(tamperedHash).not.toBe(expectedHash);
  });
});
