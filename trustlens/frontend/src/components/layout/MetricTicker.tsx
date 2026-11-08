'use client';

import React from 'react';
import { ShieldAlert, KeyRound, Building2, Activity } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const MetricTicker: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-zinc-950/90 border-b border-zinc-900 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            {t.common.liveEngine}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 text-xs">Worker v2.4 (Fermat Sieve active)</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-zinc-200 font-semibold font-mono">14,291</span>
            <span className="text-zinc-500">Phish Neutralized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-200 font-semibold font-mono">84</span>
            <span className="text-zinc-500">Fermat Weak Keys</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-zinc-200 font-semibold font-mono">310</span>
            <span className="text-zinc-500">Brands Guarded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-200 font-semibold font-mono">99.98%</span>
            <span className="text-zinc-500">SLA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

