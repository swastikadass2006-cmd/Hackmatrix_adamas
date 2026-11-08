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
      className={`p-3.5 rounded-xl border transition-all ${sev.bg} ${sev.border} hover:bg-opacity-80 font-mono`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 ${sev.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {item.id}
              </span>
              <h5 className="text-xs font-semibold text-zinc-100 tracking-tight">{item.signal}</h5>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase text-zinc-500 mt-0.5">
              <span>Category: {item.category}</span>
              {item.source && (
                <>
                  <span>&bull;</span>
                  <span>Source: <strong className="text-zinc-400">{item.source}</strong></span>
                </>
              )}
              {item.authoritative && (
                <>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Authoritative
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sev.text} ${sev.border} bg-zinc-950/50`}
          >
            {item.severity}
          </span>
          {item.weight > 0 && (
            <span className="text-xs font-bold text-rose-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
              -{item.weight} pts
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-300 font-sans leading-relaxed pl-8 mb-2">
        {item.explanation}
      </p>

      {item.technicalRef && (
        <div className="pl-8 flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span className="text-zinc-400 font-semibold">Technical Reference:</span>
          <span className="text-zinc-400 truncate">{item.technicalRef}</span>
        </div>
      )}
    </div>
  );
};
