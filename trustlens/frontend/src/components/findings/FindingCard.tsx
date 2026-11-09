import React from 'react';
import { EvidenceItem } from '../../lib/types/scan';
import { getSeverityColor } from '../../lib/utils/formatters';
import { ShieldAlert, Shield, Cpu, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface FindingCardProps {
  item: EvidenceItem;
}

export const FindingCard: React.FC<FindingCardProps> = ({ item }) => {
  const sev = getSeverityColor(item.severity);

  const categoryIcons = {
    crypto: Cpu,
    phishing: Eye,
    hygiene: Shield,
    intel: AlertTriangle,
  };

  const Icon = categoryIcons[item.category] || ShieldAlert;

  return (
    <div
      className={`p-3.5 rounded-panel border transition-colors ${sev.bg} ${sev.border}`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded bg-tl-panel border border-tl-border ${sev.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-tl-muted bg-tl-canvas px-1.5 py-0.5 rounded border border-tl-border">
                {item.id}
              </span>
              <h5 className="text-xs font-semibold text-tl-text tracking-tight">{item.signal}</h5>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-tl-muted mt-0.5">
              <span>Category: {item.category}</span>
              {item.source && (
                <>
                  <span className="inline-block w-px h-2.5 bg-tl-border" />
                  <span>Source: <strong className="text-tl-text">{item.source}</strong></span>
                </>
              )}
              {item.authoritative && (
                <>
                  <span className="inline-block w-px h-2.5 bg-tl-border" />
                  <span className="text-tl-emerald flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Authoritative
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sev.text} ${sev.border} bg-tl-canvas/60`}
          >
            {item.severity}
          </span>
          {item.weight > 0 && (
            <span className="text-xs font-bold text-tl-rose bg-tl-canvas px-2 py-0.5 rounded border border-tl-border">
              -{item.weight} pts
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-tl-text font-sans leading-relaxed pl-8 mb-2">
        {item.explanation}
      </p>

      {item.technicalRef && (
        <div className="pl-8 flex items-center gap-1.5 text-[10px] text-tl-muted">
          <span className="text-tl-muted font-semibold">Technical Reference:</span>
          <span className="text-tl-text font-mono truncate">{item.technicalRef}</span>
        </div>
      )}
    </div>
  );
};
