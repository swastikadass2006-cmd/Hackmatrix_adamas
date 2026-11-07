import { MOCK_SCANS } from '../mocks/scanData';
import { MOCK_THREAT_FEED } from '../mocks/feedData';
import { MOCK_CAMPAIGNS } from '../mocks/campaignData';
import { ScanResult } from '../types/scan';
import { ThreatFeedEvent, CampaignCluster } from '../types/threat';

export const apiClient = {
  async getScan(id: string): Promise<ScanResult> {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 250));
    const scan = MOCK_SCANS[id];
    if (scan) return scan;

    // Fallback: derive dynamic scan based on URL/ID
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
          {
            subject: `CN=${id}`,
            issuer: 'CN=GlobalSign Root CA, O=GlobalSign nv-sa, C=BE',
            validFrom: '2026-01-01T00:00:00Z',
            validTo: '2027-01-01T00:00:00Z',
            keySize: 2048,
            keyType: 'RSA',
            signatureAlgorithm: 'sha256WithRSAEncryption',
            fingerprintSha256: '2830192840192840192840192840192840192840192840192840192840192840',
            serialNumber: '92038475029384',
            isRevoked: false,
            isCslDistrusted: false,
            isFermatFactorable: false,
            sanList: [id],
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

