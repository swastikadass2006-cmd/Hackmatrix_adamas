'use client';

import React from 'react';
import { UrlScannerInput } from '../../components/scan/UrlScannerInput';
import { Globe, Shield, Lock, Cpu, Eye } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function ScannerPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 sm:space-y-8 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#43B9DB]/10 border border-[#43B9DB]/20 text-[#43B9DB]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
              {t.scanner?.title || 'Target URL & Infrastructure Scanner'}
            </h1>
            <p className="text-xs sm:text-sm text-[#778496]">
              {t.scanner?.subtitle || 'Execute multi-engine cryptographic validation, brand lookalike classification, and passive transport hygiene analysis.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="p-6 sm:p-8 glass-card space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <UrlScannerInput />
      </div>

      {/* Analysis Engine Capabilities Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#141E2E]/70 hover:bg-[#162235]/80 border border-white/[0.08] hover:border-[#43B9DB]/40 rounded-xl space-y-2 transition duration-200">
          <div className="flex items-center gap-2 text-[#43B9DB] font-semibold">
            <Cpu className="w-4 h-4" />
            <span className="tracking-wide">Fermat RSA Linter</span>
          </div>
          <p className="text-[11px] text-[#778496] leading-relaxed font-sans">
            Tests RSA public keys for the ROCA / Fermat vulnerability and cross-references root programs for distrusted intermediates.
          </p>
        </div>

        <div className="p-4 bg-[#141E2E]/70 hover:bg-[#162235]/80 border border-white/[0.08] hover:border-[#45C69B]/40 rounded-xl space-y-2 transition duration-200">
          <div className="flex items-center gap-2 text-[#45C69B] font-semibold">
            <Eye className="w-4 h-4" />
            <span className="tracking-wide">Lexical &amp; Brand AI</span>
          </div>
          <p className="text-[11px] text-[#778496] leading-relaxed font-sans">
            Evaluates 26 lexical entropy features, Punycode confusable characters, and brand lookalikes across major financial institutions.
          </p>
        </div>

        <div className="p-4 bg-[#141E2E]/70 hover:bg-[#162235]/80 border border-white/[0.08] hover:border-[#F59E0B]/40 rounded-xl space-y-2 transition duration-200">
          <div className="flex items-center gap-2 text-[#F59E0B] font-semibold">
            <Lock className="w-4 h-4" />
            <span className="tracking-wide">Passive Transport Audit</span>
          </div>
          <p className="text-[11px] text-[#778496] leading-relaxed font-sans">
            Audits HSTS, CSP, and TLS parameters via standard network handshake without intrusive port scanning.
          </p>
        </div>
      </div>
    </div>
  );
}

