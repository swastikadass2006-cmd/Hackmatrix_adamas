import React from 'react';
import { EvidenceItem } from '../../lib/types/scan';
import { getSeverityColor } from '../../lib/utils/formatters';
import { ShieldAlert, Shield, Cpu, Eye, AlertTriangle } from 'lucide-react';

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
      className={`p-3.5 rounded-xl border transition-colors ${sev.bg} ${sev.border} hover:bg-opacity-80`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 ${sev.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-zinc-100 tracking-tight">{item.signal}</h5>
            <span className="text-xs text-zinc-500">
              Category: {item.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border ${sev.text} ${sev.border} bg-zinc-950/50`}
          >
            {item.severity}
          </span>
          <span className="text-xs font-bold text-rose-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
            <span className="font-mono">-{item.weight}</span> pts
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed pl-8 mb-2">
        {item.explanation}
      </p>

      {item.technicalRef && (
        <div className="pl-8 flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-zinc-400 font-semibold">Ref:</span>
          <span className="text-zinc-400 font-mono truncate">{item.technicalRef}</span>
        </div>
      )}
    </div>
  );
};

