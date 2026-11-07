import { Severity, Verdict } from './scan';

export interface ThreatFeedEvent {
  id: string;
  url: string;
  detectedAt: string;
  targetBrand?: string;
  verdict: Verdict;
  trustScore: number;
  threatType: 'credential_harvesting' | 'weak_key' | 'untrusted_ca' | 'typosquat';
  originCountry: string;
  asn: string;
  ip: string;
  tags: string[];
}

export interface CampaignCluster {
  id: string;
  campaignName: string;
  threatActor?: string;
  firstSeen: string;
  lastActive: string;
  activeDomainCount: number;
  primaryTargetBrand: string;
  asnDistribution: { asn: string; name: string; percentage: number }[];
  primaryRegistrar: string;
  domains: {
    domain: string;
    detectedAt: string;
    status: 'active' | 'sinkholed' | 'takedown_requested';
    trustScore: number;
  }[];
  killChainStage: 'recon' | 'weaponization' | 'delivery' | 'exploitation';
}

export interface ThreatGraphNode {
  id: string;
  label: string;
  type: 'target' | 'ip' | 'asn' | 'nameserver' | 'cert' | 'campaign';
  severity?: Severity;
  metadata?: Record<string, string | number>;
}

export interface ThreatGraphLink {
  source: string;
  target: string;
  relationship: string;
}

