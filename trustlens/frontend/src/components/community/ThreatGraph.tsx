import React from 'react';
import { ThreatNode } from '../../lib/types/scan';
import { Card } from '../ui/Card';
import { Network, Server, Globe, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface ThreatGraphProps {
  threatIntel?: ThreatNode;
  targetUrl: string;
}

export const ThreatGraph: React.FC<ThreatGraphProps> = ({ threatIntel, targetUrl }) => {
  const intel = threatIntel || {
    ip: '194.135.33.109',
    asn: 'AS44050',
    asnOrg: 'Petersburg Internet Network LLC',
    country: 'RU',
    coHostedThreats: 14,
    passiveDnsHits: 41,
    reputation: 'bulletproof',
  };

  const isBulletproof = intel.reputation === 'bulletproof';

  return (
    <div className="p-5 glass-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#43B9DB]" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F1F5F9]">
            Infrastructure & ASN Threat Co-occurrence
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
            isBulletproof
              ? 'bg-[#E11D48]/15 text-[#E11D48] border-[#E11D48]/30'
              : 'bg-[#45C69B]/15 text-[#45C69B] border-[#45C69B]/30'
          }`}
        >
          ASN Reputation: {intel.reputation}
        </span>
      </div>

      {/* Cluster Node Diagram (ASCII / Visual Map) */}
      <div className="p-4 bg-[#141E2E]/60 border border-white/[0.08] rounded-xl space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          {/* Node 1: Target URL */}
          <div className="p-3 bg-[#0E1520]/80 border border-white/[0.08] rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-[#778496] uppercase font-semibold">Target Node</span>
            <div className="text-xs text-[#F1F5F9] font-bold truncate">{targetUrl}</div>
            <span className="text-[10px] text-[#45C69B]">DNS Resolution</span>
          </div>

          <div className="hidden sm:block text-[#778496] font-bold">&rarr;</div>

          {/* Node 2: Resolving IP */}
          <div className="p-3 bg-[#0E1520]/80 border border-white/[0.08] rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-[#778496] uppercase font-semibold">Resolving IPv4</span>
            <div className="text-xs text-[#43B9DB] font-bold">{intel.ip}</div>
            <span className="text-[10px] text-[#778496]">Geo: {intel.country}</span>
          </div>

          <div className="hidden sm:block text-[#778496] font-bold">&rarr;</div>

          {/* Node 3: Hosting ASN */}
          <div className="p-3 bg-[#0E1520]/80 border border-white/[0.08] rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-[#778496] uppercase font-semibold">BGP Autonomous System</span>
            <div className="text-xs text-[#F59E0B] font-bold">{intel.asn}</div>
            <span className="text-[10px] text-[#778496] truncate block">{intel.asnOrg}</span>
          </div>
        </div>

        {/* Co-hosted Threat Matrix */}
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 bg-[#0E1520]/60 border border-white/[0.06] rounded-xl flex items-center justify-between">
            <span className="text-[#778496] text-[11px]">Co-hosted Malicious Portals:</span>
            <span className="text-[#E11D48] font-bold text-xs">{intel.coHostedThreats} domains</span>
          </div>

          <div className="p-2.5 bg-[#0E1520]/60 border border-white/[0.06] rounded-xl flex items-center justify-between">
            <span className="text-[#778496] text-[11px]">Passive DNS Historic Hits:</span>
            <span className="text-[#F1F5F9] font-bold text-xs">{intel.passiveDnsHits} records</span>
          </div>
        </div>

        {isBulletproof && (
          <div className="p-2.5 bg-[#E11D48]/10 border border-[#E11D48]/30 rounded-xl text-[#E11D48] text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
            <p>
              Hosting ASN is classified as a bulletproof hosting provider frequently abused by criminal syndicates for phishing and malware relays with non-responsive abuse desks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

