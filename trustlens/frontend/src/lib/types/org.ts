import { Severity } from './scan';

export interface MonitoredBrand {
  id: string;
  name: string;
  canonicalDomain: string;
  riskTolerance: 'strict' | 'moderate' | 'relaxed';
  activeAlerts: number;
  totalTyposquatsDetected: number;
  lastSync: string;
}

export interface TyposquatCandidate {
  id: string;
  domain: string;
  technique: 'homoglyph' | 'omission' | 'hyphenation' | 'bitsquatting' | 'tld_swap';
  registered: boolean;
  registeredDate?: string;
  nameserver?: string;
  ipAddress?: string;
  liveHttp: boolean;
  riskScore: number;
  similarityRatio: number;
}

export interface CertTransparencyHit {
  id: string;
  domain: string;
  issuer: string;
  loggedAt: string;
  certSha256: string;
  sanCount: number;
  suspicious: boolean;
  flagReason?: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  domain: string;
  severity: Severity;
  timestamp: string;
  status: 'new' | 'investigating' | 'mitigated' | 'false_positive';
  summary: string;
  actionRequired: string;
}

export interface OrgSettings {
  companyName: string;
  socEmail: string;
  webhookUrl: string;
  autoTakedownThreshold: number;
  enableCrtWatcher: boolean;
  enableFermatDetection: boolean;
  apiKey: string;
}

