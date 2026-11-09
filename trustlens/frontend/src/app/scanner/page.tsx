'use client';

import React from 'react';
import Link from 'next/link';
import { UrlScannerInput } from '../../components/scan/UrlScannerInput';
import { Globe, Shield, Lock, Cpu, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { QUICK_DEMO_SCANS } from '../../lib/mocks/scanData';

export default function ScannerPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-tl-border/60">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-tl-cyan" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tl-text-primary">
            {t.scanner?.title || 'Target URL & Infrastructure Scanner'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-tl-text-secondary">
          {t.scanner?.subtitle || 'Execute multi-engine cryptographic validation, brand lookalike classification, and passive transport hygiene analysis.'}
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="p-6 bg-tl-card border border-tl-border rounded-panel shadow-panel space-y-6">
        <UrlScannerInput />

        {/* Interactive Threat Scenarios */}
        <div className="pt-4 border-t border-tl-border/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-tl-text-secondary font-mono">
            <Sparkles className="w-3.5 h-3.5 text-tl-cyan" />
            <span>INTERACTIVE THREAT SCENARIOS (1-CLICK AUDIT PRESETS)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {QUICK_DEMO_SCANS.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/scan/${scenario.id}`}
                className="p-3.5 rounded-xl bg-tl-elevated/70 hover:bg-tl-hover border border-tl-border hover:border-tl-border-active transition group flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        scenario.badgeColor === 'rose'
                          ? 'bg-tl-rose/15 text-tl-rose border border-tl-rose/30'
                          : scenario.badgeColor === 'amber'
                          ? 'bg-tl-amber/15 text-tl-amber border border-tl-amber/30'
                          : 'bg-tl-emerald/15 text-tl-emerald border border-tl-emerald/30'
                      }`}
                    >
                      {scenario.badge}
                    </span>
                    <span className="text-[11px] font-mono text-tl-text-muted font-bold">
                      {scenario.score}/100
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-tl-text-primary group-hover:text-tl-cyan transition">
                    {scenario.label}
                  </h4>
                  <p className="text-[11px] text-tl-text-muted leading-tight font-sans">
                    {scenario.desc}
                  </p>
                </div>
                <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-tl-cyan group-hover:underline">
                  <span>Inspect Pre-computed Dossier</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Engine Capabilities Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-tl-text-secondary">
        <div className="p-4 bg-tl-card/50 border border-tl-border rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-tl-cyan font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Fermat RSA Linter</span>
          </div>
          <p className="text-[11px] text-tl-text-muted leading-relaxed font-sans">
            Tests RSA public keys for the ROCA / Fermat vulnerability and cross-references root programs for distrusted intermediates.
          </p>
        </div>

        <div className="p-4 bg-tl-card/50 border border-tl-border rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-tl-emerald font-semibold">
            <Eye className="w-4 h-4" />
            <span>Lexical &amp; Brand AI</span>
          </div>
          <p className="text-[11px] text-tl-text-muted leading-relaxed font-sans">
            Evaluates 26 lexical entropy features, Punycode confusable characters, and brand lookalikes across major financial institutions.
          </p>
        </div>

        <div className="p-4 bg-tl-card/50 border border-tl-border rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-tl-amber font-semibold">
            <Lock className="w-4 h-4" />
            <span>Passive Transport Audit</span>
          </div>
          <p className="text-[11px] text-tl-text-muted leading-relaxed font-sans">
            Audits HSTS, CSP, and TLS parameters via standard network handshake without intrusive port scanning.
          </p>
        </div>
      </div>
    </div>
  );
}

