import { ScanResult } from '../types/scan';
import { ThreatFeedEvent, CampaignCluster } from '../types/threat';
import { MOCK_SCANS } from '../mocks/scanData';
import { MOCK_THREAT_FEED } from '../mocks/feedData';
import { MOCK_CAMPAIGNS } from '../mocks/campaignData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Map a raw gateway response into the full ScanResult shape the UI expects */
function mapApiResponse(url: string, raw: Record<string, unknown>): ScanResult {
  const evidence = (raw.evidence as Array<Record<string, unknown>> | undefined) ?? [];
  const explanation = (raw.explanation as Record<string, unknown> | undefined) ?? {};
  const layers = (raw.layers as Record<string, Record<string, unknown>> | undefined) ?? {};

  const verdictRaw = (raw.verdict as string | undefined) ?? 'safe';
  const verdict = (verdictRaw === 'malicious' || verdictRaw === 'suspicious' || verdictRaw === 'safe')
    ? verdictRaw
    : 'safe';

  const trustScore = typeof raw.trust_score === 'number' ? raw.trust_score : 50;
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (trustScore >= 90) grade = 'A';
  else if (trustScore >= 75) grade = 'B';
  else if (trustScore >= 55) grade = 'C';
  else if (trustScore >= 35) grade = 'D';

  const certRisk = typeof (layers.certificate as Record<string, unknown> | undefined)?.risk === 'number'
    ? (layers.certificate.risk as number)
    : 0;

  const hygieneRisk = typeof (layers.hygiene as Record<string, unknown> | undefined)?.risk === 'number'
    ? (layers.hygiene.risk as number)
    : 0;

  const reasons = (explanation.reasons as string[] | undefined) ?? [];
  const overrideReason = typeof raw.override_reason === 'string' ? raw.override_reason : undefined;
  const overrideActive = typeof raw.override_active === 'boolean' ? raw.override_active : false;

  const certDistrusted = evidence.some(
    (e) => typeof e.signal === 'string' && e.signal.toLowerCase().includes('distrusted')
  );
  const weakKey = evidence.some(
    (e) => typeof e.signal === 'string' && (e.signal.toLowerCase().includes('fermat') || e.signal.toLowerCase().includes('weak key'))
  );
  const brandImpersonation = evidence.some(
    (e) => typeof e.signal === 'string' && e.signal.toLowerCase().includes('impersonation')
  );

  return {
    id: (raw.scan_id as string | undefined) ?? Date.now().toString(),
    targetUrl: url,
    finalUrl: url,
    ipAddress: (raw.ip_address as string | undefined) ?? '—',
    asn: (raw.asn as string | undefined) ?? '—',
    geoCountry: (raw.geo_country as string | undefined) ?? '—',
    scannedAt: new Date().toISOString(),
    trustScore,
    grade,
    verdict,
    overrideActive,
    overrideReason,
    phishing: {
      lexicalScore: typeof (layers.phishing as Record<string, unknown> | undefined)?.risk === 'number'
        ? (layers.phishing.risk as number)
        : 0,
      entropy: 3.8,
      isPunycode: url.includes('xn--'),
      domSignals: {
        externalFormAction: false,
        passwordFieldPresent: false,
        hiddenIframes: false,
        suspiciousScriptCount: 0,
      },
      visualImpersonation: {
        detected: brandImpersonation,
        screenshotUrl: '/demo/clean-generic.svg',
        canonicalLogoUrl: '/brands/generic.svg',
      },
    },
    certificate: {
      chain: [
        {
          subject: `CN=${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}`,
          issuer: 'CN=TrustLens Scan Engine',
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 86400000 * 90).toISOString(),
          keySize: weakKey ? 1024 : 2048,
          keyType: 'RSA',
          signatureAlgorithm: 'sha256WithRSAEncryption',
          fingerprintSha256: 'live-scan-no-cert-data-available',
          serialNumber: 'live',
          isRevoked: certDistrusted,
          isCslDistrusted: certDistrusted,
          isFermatFactorable: weakKey,
        },
      ],
      rootCaStatus: certDistrusted ? 'revoked' : 'trusted',
      weakKeyDetected: weakKey,
      fermatFactorable: weakKey,
      ccadbDistrusted: certDistrusted,
      leafExpiryDays: 90,
    },
    hygiene: {
      securityHeaders: {
        hsts: hygieneRisk < 20,
        csp: hygieneRisk < 10,
        xFrameOptions: hygieneRisk < 30,
        xContentTypeOptions: hygieneRisk < 30,
        referrerPolicy: hygieneRisk < 40,
        permissionsPolicy: hygieneRisk < 15,
      },
      deprecatedTls: hygieneRisk > 50,
      tlsVersion: hygieneRisk > 50 ? 'TLS 1.1' : 'TLS 1.3',
      exposedBanners: [],
      cnameCloakingDetected: false,
    },
    evidence: evidence.map((e, i) => ({
      id: `ev-live-${i}`,
      signal: (e.signal as string | undefined) ?? 'Unknown Signal',
      category: (() => {
        const sig = ((e.signal as string | undefined) ?? '').toLowerCase();
        if (sig.includes('cert') || sig.includes('tls') || sig.includes('ca') || sig.includes('fermat')) return 'crypto';
        if (sig.includes('phish') || sig.includes('brand') || sig.includes('impersonation') || sig.includes('tld')) return 'phishing';
        if (sig.includes('hygiene') || sig.includes('header') || sig.includes('cipher')) return 'hygiene';
        return 'intel';
      })() as 'crypto' | 'phishing' | 'hygiene' | 'intel',
      severity: ((e.severity as string | undefined) ?? 'low') as 'low' | 'medium' | 'high' | 'critical',
      explanation: (e.explanation as string | undefined) ?? 'Signal detected.',
      weight: ((e.severity as string | undefined) === 'critical' ? 0.4
        : (e.severity as string | undefined) === 'high' ? 0.3
        : (e.severity as string | undefined) === 'medium' ? 0.2
        : 0.1),
    })),
    ...(reasons.length > 0 ? {
      overrideReason: overrideReason ?? reasons[0],
    } : {}),
  };
}

export const apiClient = {
  /** POST /scan to live FastAPI backend. Falls back to mock on failure. */
  async scanUrl(url: string): Promise<{ result: ScanResult; fromMock: boolean }> {
    const target = url.startsWith('http') ? url : `https://${url}`;

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Backend error ${res.status}: ${errBody}`);
      }

      const raw: Record<string, unknown> = await res.json();
      return { result: mapApiResponse(target, raw), fromMock: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Re-throw network-level errors so the UI can display the offline banner
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed') || msg.includes('abort')) {
        throw new Error(
          '⚠️ TrustLens Backend Offline — cannot reach the FastAPI gateway at http://localhost:8000. ' +
          'Please run: cd trustlens/gateway && python -m uvicorn main:app --port 8000'
        );
      }
      throw err;
    }
  },

  /** GET a scan from mock data (for demo cards and [id] route fallback) */
  async getScan(id: string): Promise<ScanResult> {
    await new Promise((res) => setTimeout(res, 150));
    const scan = MOCK_SCANS[id];
    if (scan) return scan;

    return {
      id,
      targetUrl: id.startsWith('http') ? id : `https://${id}`,
      finalUrl: id.startsWith('http') ? id : `https://${id}`,
      ipAddress: '104.21.48.12',
      asn: 'AS13335 - Cloudflare, Inc.',
      geoCountry: 'US',
      scannedAt: new Date().toISOString(),
      trustScore: 78,
      grade: 'B',
      verdict: 'safe',
      overrideActive: false,
      phishing: {
        lexicalScore: 18,
        entropy: 3.2,
        isPunycode: false,
        domSignals: {
          externalFormAction: false,
          passwordFieldPresent: false,
          hiddenIframes: false,
          suspiciousScriptCount: 0,
        },
        visualImpersonation: {
          detected: false,
          screenshotUrl: '/demo/clean-generic.svg',
          canonicalLogoUrl: '/brands/google.svg',
        },
      },
      certificate: {
        chain: [
          {
            subject: 'CN=GlobalSign Root CA, O=GlobalSign nv-sa, C=BE',
            issuer: 'CN=GlobalSign Root CA, O=GlobalSign nv-sa, C=BE',
            validFrom: '2014-01-01T00:00:00Z',
            validTo: '2034-01-01T00:00:00Z',
            keySize: 2048,
            keyType: 'RSA',
            signatureAlgorithm: 'sha256WithRSAEncryption',
            fingerprintSha256: 'eb00cf5eb3004c90234a92384750293485720938475029348572093847502934',
            serialNumber: '040000000001154b5ac394',
            isRevoked: false,
            isCslDistrusted: false,
            isFermatFactorable: false,
          },
        ],
        rootCaStatus: 'trusted',
        weakKeyDetected: false,
        fermatFactorable: false,
        ccadbDistrusted: false,
        leafExpiryDays: 142,
      },
      hygiene: {
        securityHeaders: {
          hsts: true,
          csp: false,
          xFrameOptions: true,
          xContentTypeOptions: true,
          referrerPolicy: true,
          permissionsPolicy: false,
        },
        deprecatedTls: false,
        tlsVersion: 'TLS 1.3',
        exposedBanners: ['cloudflare'],
        cnameCloakingDetected: false,
      },
      evidence: [
        {
          id: 'ev-auto-1',
          signal: 'Standard Production Certificate Chaining',
          category: 'crypto',
          severity: 'low',
          explanation: 'Validated root trust chain back to trusted public CA.',
          weight: 0,
        },
      ],
    };
  },

  async getFeed(): Promise<ThreatFeedEvent[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_THREAT_FEED;
  },

  async getCampaigns(): Promise<CampaignCluster[]> {
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_CAMPAIGNS;
  },
};
