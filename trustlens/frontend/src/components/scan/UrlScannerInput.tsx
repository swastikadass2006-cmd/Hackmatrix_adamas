'use client';

import React, { useState } from 'react';
import { Search, Globe, ArrowRight, ShieldCheck, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';
import { QUICK_DEMO_SCANS } from '../../lib/mocks/scanData';
import { Button } from '../ui/Button';
import { useScan } from '../../hooks/useScan';
import { ScanProgressStream } from '../progress/ScanProgressStream';

export const UrlScannerInput: React.FC = () => {
  const [url, setUrl] = useState('');
  const { isScanning, workerSteps, startScan, error } = useScan();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    startScan(url.trim());
  };

  const handleSelectDemo = (scanId: string) => {
    const demo = QUICK_DEMO_SCANS.find((d) => d.id === scanId);
    if (!demo) return;
    if (scanId === 'scan-sbi-phish') setUrl('https://onlinesbi-kyc-pan-update.top/login.php');
    else if (scanId === 'scan-emudhra-crypto') setUrl('https://secure-portal-gov-gateway.in');
    else setUrl('https://github.com');

    startScan(demo.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-zinc-900 border-2 border-zinc-700/80 rounded-2xl p-2 transition-colors focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <div className="pl-3 pr-2 text-zinc-500 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span className="text-zinc-500 text-xs hidden sm:inline">target://</span>
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL, FQDN or IP (e.g. onlinesbi-kyc-verify.top or github.com)..."
            disabled={isScanning}
            className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-500 font-mono text-sm sm:text-base focus:outline-none px-2 py-2"
          />

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isScanning}
            disabled={!url.trim()}
            className="shrink-0 rounded-xl px-5 sm:px-6"
          >
            <span>Analyze</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Worker Pipeline Streaming Logs if Scanning */}
      {isScanning && (
        <div className="mt-4">
          <ScanProgressStream steps={workerSteps} />
        </div>
      )}

      {/* Quick Demo Scenarios */}
      {!isScanning && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Threat Scenarios (Click to test directly):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {QUICK_DEMO_SCANS.map((demo) => {
              const isRose = demo.badgeColor === 'rose';
              const isAmber = demo.badgeColor === 'amber';
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectDemo(demo.id)}
                  className={`text-left p-3 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-80 disabled:opacity-50 flex flex-col justify-between ${
                    isRose
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/40'
                      : isAmber
                      ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/40'
                      : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-200">{demo.label}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${
                        isRose
                          ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                          : isAmber
                          ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {demo.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {demo.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

