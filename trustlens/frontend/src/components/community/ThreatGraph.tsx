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
    <Card className="p-5 bg-tl-card border border-tl-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-tl-border">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-tl-cyan" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-tl-text">
            Infrastructure & ASN Threat Co-occurrence
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
            isBulletproof
              ? 'bg-tl-rose/10 text-tl-rose border-tl-rose/30'
              : 'bg-tl-emerald/10 text-tl-emerald border-tl-emerald/30'
          }`}
        >
          ASN Reputation: {intel.reputation}
        </span>
      </div>

      {/* Cluster Node Diagram (ASCII / Visual Map) */}
      <div className="p-4 bg-tl-panel border border-tl-border rounded-panel space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          {/* Node 1: Target URL */}
          <div className="p-3 bg-tl-card border border-tl-border rounded-panel w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-tl-muted uppercase font-semibold">Target Node</span>
            <div className="text-xs text-tl-text font-bold truncate">{targetUrl}</div>
            <span className="text-[10px] text-tl-emerald">DNS Resolution</span>
          </div>

          <div className="hidden sm:block text-tl-muted font-bold">&rarr;</div>

          {/* Node 2: Resolving IP */}
          <div className="p-3 bg-tl-card border border-tl-border rounded-panel w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-tl-muted uppercase font-semibold">Resolving IPv4</span>
            <div className="text-xs text-tl-cyan font-bold">{intel.ip}</div>
            <span className="text-[10px] text-tl-muted">Geo: {intel.country}</span>
          </div>

          <div className="hidden sm:block text-tl-muted font-bold">&rarr;</div>

          {/* Node 3: Hosting ASN */}
          <div className="p-3 bg-tl-card border border-tl-border rounded-panel w-full sm:w-1/3 text-center space-y-1">
            <span className="text-[10px] text-tl-muted uppercase font-semibold">BGP Autonomous System</span>
            <div className="text-xs text-tl-amber font-bold">{intel.asn}</div>
            <span className="text-[10px] text-tl-muted truncate block">{intel.asnOrg}</span>
          </div>
        </div>

        {/* Co-hosted Threat Matrix */}
        <div className="pt-3 border-t border-tl-border grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 bg-tl-card border border-tl-border rounded flex items-center justify-between">
            <span className="text-tl-muted text-[11px]">Co-hosted Malicious Portals:</span>
            <span className="text-tl-rose font-bold text-xs">{intel.coHostedThreats} domains</span>
          </div>

          <div className="p-2.5 bg-tl-card border border-tl-border rounded flex items-center justify-between">
            <span className="text-tl-muted text-[11px]">Passive DNS Historic Hits:</span>
            <span className="text-tl-text font-bold text-xs">{intel.passiveDnsHits} records</span>
          </div>
        </div>

        {isBulletproof && (
          <div className="p-2.5 bg-tl-rose/10 border border-tl-rose/30 rounded text-tl-rose text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-tl-rose shrink-0 mt-0.5" />
            <p>
              Hosting ASN is classified as a bulletproof hosting provider frequently abused by criminal syndicates for phishing and malware relays with non-responsive abuse desks.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

