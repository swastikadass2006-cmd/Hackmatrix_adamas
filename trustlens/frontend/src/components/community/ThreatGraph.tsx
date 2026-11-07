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
    <Card className="p-5 bg-zinc-950/80 border border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
            Infrastructure & ASN Threat Co-occurrence
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
            isBulletproof
              ? 'bg-rose-950 text-rose-400 border-rose-500/40'
              : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
          }`}
        >
          ASN Reputation: {intel.reputation}
        </span>
      </div>

      {/* Cluster Node Diagram (ASCII / Visual Map) */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          {/* Node 1: Target URL */}
          <div className="p-3 bg-zinc-950 border border-zinc-700 rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Target Node</span>
            <div className="text-xs text-zinc-100 font-bold truncate">{targetUrl}</div>
            <span className="text-[10px] text-emerald-400">DNS Resolution</span>
          </div>

          <div className="hidden sm:block text-zinc-600 font-bold">&rarr;</div>

          {/* Node 2: Resolving IP */}
          <div className="p-3 bg-zinc-950 border border-zinc-700 rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Resolving IPv4</span>
            <div className="text-xs text-sky-400 font-bold">{intel.ip}</div>
            <span className="text-[10px] text-zinc-400">Geo: {intel.country}</span>
          </div>

          <div className="hidden sm:block text-zinc-600 font-bold">&rarr;</div>

          {/* Node 3: Hosting ASN */}
          <div className="p-3 bg-zinc-950 border border-zinc-700 rounded-xl w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">BGP Autonomous System</span>
            <div className="text-xs text-amber-400 font-bold">{intel.asn}</div>
            <span className="text-[10px] text-zinc-400 truncate block">{intel.asnOrg}</span>
          </div>
        </div>

        {/* Co-hosted Threat Matrix */}
        <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-lg flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Co-hosted Malicious Portals:</span>
            <span className="text-rose-400 font-bold text-xs">{intel.coHostedThreats} domains</span>
          </div>

          <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-lg flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Passive DNS Historic Hits:</span>
            <span className="text-zinc-200 font-bold text-xs">{intel.passiveDnsHits} records</span>
          </div>
        </div>

        {isBulletproof && (
          <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Hosting ASN is classified as a bulletproof hosting provider frequently abused by criminal syndicates for phishing and malware relays with non-responsive abuse desks.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

