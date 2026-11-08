export type Severity = 'low' | 'medium' | 'high' | 'critical' | 'info';
export type EvidenceCategory = 'crypto' | 'phishing' | 'hygiene' | 'intel';
export type Verdict = 'safe' | 'suspicious' | 'malicious';
export type TrustGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Five-class classification system replacing binary Safe/Malicious.
 * Rule: NEVER display "Safe" — absence of indicators is not proof of safety.
 */
export type ThreatClassification =
  | 'No indicators found'
  | 'Suspicious'
  | 'High Risk'
  | 'Confirmed Malicious'
  | 'Inconclusive';

export interface EvidenceCoverage {
  completed: number;
  total: number;
  display: string;
}

export interface OnChainRecord {
  registered: boolean;
  txHash?: string;
  reportHash?: string;
  reporter?: string;
  timestamp?: number;
  network?: string;
  contractAddress?: string;
  explorerUrl?: string;
}

export interface EvidenceItem {
  id: string;
  signal: string;
  category: EvidenceCategory;
  severity: Severity;
  explanation: string;
  weight: number;
  source?: string;
  timestamp?: string;
  technicalRef?: string;
  authoritative?: boolean;
}

export interface CertNode {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  keySize: number;
  keyType: 'RSA' | 'ECDSA' | 'Ed25519';
  signatureAlgorithm: string;
  fingerprintSha256: string;
  serialNumber: string;
  isRevoked: boolean;
  isCslDistrusted: boolean;
  isFermatFactorable: boolean;
  rawPem?: string;
  sanList?: string[];
}

export interface CertInspection {
  chain: CertNode[];
  rootCaStatus: 'trusted' | 'untrusted' | 'revoked';
  weakKeyDetected: boolean;
  fermatFactorable: boolean;
  ccadbDistrusted: boolean;
  leafExpiryDays: number;
  details?: {
    factorizationDelta?: string;
    vulnerableComponent?: string;
  };
}

export interface DomSignals {
  externalFormAction: boolean;
  formActionUrl?: string;
  passwordFieldPresent: boolean;
  hiddenIframes: boolean;
  suspiciousScriptCount: number;
  antiDevtoolsDetected?: boolean;
}

export interface VisualImpersonation {
  detected: boolean;
  targetBrand?: string;
  canonicalDomain?: string;
  similarityScore?: number;
  logoOcrMatch?: string;
  screenshotUrl: string;
  canonicalLogoUrl: string;
  ssimPercentage?: number;
}

export interface PhishingDetails {
  lexicalScore: number;
  entropy: number;
  isPunycode: boolean;
  domSignals: DomSignals;
  visualImpersonation: VisualImpersonation;
}

export interface SecurityHeaders {
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
}

export interface WebHygiene {
  securityHeaders: SecurityHeaders;
  deprecatedTls: boolean;
  tlsVersion: string;
  exposedBanners: string[];
  cnameCloakingDetected: boolean;
}

export interface ThreatNode {
  ip: string;
  asn: string;
  asnOrg: string;
  country: string;
  coHostedThreats: number;
  passiveDnsHits: number;
  reputation: 'clean' | 'suspicious' | 'bulletproof';
}

export interface ScanResult {
  id: string;
  targetUrl: string;
  finalUrl: string;
  ipAddress: string;
  asn: string;
  geoCountry: string;
  scannedAt: string;
  classification?: ThreatClassification;
  trustScore: number;
  grade: TrustGrade;
  verdict: Verdict;
  evidenceCoverage?: EvidenceCoverage;
  limitations?: string[];
  overrideActive: boolean;
  overrideReason?: string;
  phishing: PhishingDetails;
  certificate: CertInspection;
  hygiene: WebHygiene;
  threatIntel?: ThreatNode;
  evidence: EvidenceItem[];
  onChain?: OnChainRecord;
  salt?: string;
}
