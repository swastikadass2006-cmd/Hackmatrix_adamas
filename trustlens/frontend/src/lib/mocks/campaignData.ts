import { CampaignCluster } from '../types/threat';

export const MOCK_CAMPAIGNS: CampaignCluster[] = [
  {
    id: 'camp-telephish-in',
    campaignName: 'TelePhish-India Wave IV',
    threatActor: 'TA-505 Affiliate / ShadowLurker',
    firstSeen: '2026-10-14T08:00:00Z',
    lastActive: '2026-11-07T17:42:00Z',
    activeDomainCount: 47,
    primaryTargetBrand: 'State Bank of India',
    primaryRegistrar: 'Hostinger Operations, UAB',
    killChainStage: 'exploitation',
    asnDistribution: [
      { asn: 'AS44050', name: 'PIN LLC (RU)', percentage: 68 },
      { asn: 'AS200052', name: 'Alfa Hosting (SC)', percentage: 22 },
      { asn: 'AS49981', name: 'WorldStream (BG)', percentage: 10 },
    ],
    domains: [
      { domain: 'onlinesbi-kyc-pan-update.top', detectedAt: '2026-11-07T14:11:00Z', status: 'active', trustScore: 4 },
      { domain: 'sbi-reward-points-redeem.online', detectedAt: '2026-11-06T20:30:00Z', status: 'takedown_requested', trustScore: 5 },
      { domain: 'onlinesbi-yono-support.site', detectedAt: '2026-11-05T11:15:00Z', status: 'sinkholed', trustScore: 7 },
      { domain: 'sbi-card-kyc-verification.top', detectedAt: '2026-11-04T18:45:00Z', status: 'active', trustScore: 4 },
    ],
  },
  {
    id: 'camp-fermat-subca',
    campaignName: 'Fermat-Vulnerable Gateway Infrastructure',
    threatActor: 'Misconfigured Enterprise PKI Ecosystems',
    firstSeen: '2026-09-01T00:00:00Z',
    lastActive: '2026-11-07T16:15:00Z',
    activeDomainCount: 19,
    primaryTargetBrand: 'UIDAI & State Portals',
    primaryRegistrar: 'National Informatics Centre (NIC) Delegated',
    killChainStage: 'recon',
    asnDistribution: [
      { asn: 'AS13335', name: 'Cloudflare Proxies', percentage: 75 },
      { asn: 'AS55836', name: 'Reliance Jio Infocomm', percentage: 25 },
    ],
    domains: [
      { domain: 'secure-portal-gov-gateway.in', detectedAt: '2026-11-07T16:15:00Z', status: 'active', trustScore: 12 },
      { domain: 'epfo-passbook-claim-portal.gov.in.cdn-route.in', detectedAt: '2026-11-02T09:12:00Z', status: 'active', trustScore: 18 },
      { domain: 'state-treasury-single-sign-on.in', detectedAt: '2026-10-28T14:00:00Z', status: 'takedown_requested', trustScore: 15 },
    ],
  },
  {
    id: 'camp-tax-refund-sms',
    campaignName: 'Apex Tax Fraud Syndication',
    threatActor: 'FinPhish Operation RedHaze',
    firstSeen: '2026-11-01T02:00:00Z',
    lastActive: '2026-11-07T16:10:00Z',
    activeDomainCount: 31,
    primaryTargetBrand: 'Income Tax Dept (e-Filing)',
    primaryRegistrar: 'NameCheap Inc.',
    killChainStage: 'delivery',
    asnDistribution: [
      { asn: 'AS49981', name: 'WorldStream (BG)', percentage: 80 },
      { asn: 'AS57523', name: 'Biterika LLC (PA)', percentage: 20 },
    ],
    domains: [
      { domain: 'eportal-incometax-refunds.biz', detectedAt: '2026-11-07T16:10:00Z', status: 'active', trustScore: 5 },
      { domain: 'incometax-instant-refund-claim.click', detectedAt: '2026-11-05T09:30:00Z', status: 'active', trustScore: 6 },
      { domain: 'incometaxgov-refund-status.info', detectedAt: '2026-11-03T17:20:00Z', status: 'sinkholed', trustScore: 9 },
    ],
  },
];

