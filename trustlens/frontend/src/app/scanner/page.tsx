'use client';

import React from 'react';
import { UrlScannerInput } from '../../components/scan/UrlScannerInput';
import { Globe, Shield, Lock, Cpu, Eye } from 'lucide-react';

export default function ScannerPage() {
  return (
    <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-tl-border/60">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-tl-cyan" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tl-text-primary">
            Target URL &amp; Infrastructure Scanner
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-tl-text-secondary">
          Execute multi-engine cryptographic validation, brand lookalike classification, and passive transport hygiene analysis.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="p-6 bg-tl-card border border-tl-border rounded-panel shadow-panel space-y-6">
        <UrlScannerInput />
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

