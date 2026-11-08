'use client';

import React from 'react';
import Link from 'next/link';
import { UrlScannerInput } from '../components/scan/UrlScannerInput';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldCheck, Cpu, Eye, Network, ArrowRight, Lock, Radio } from 'lucide-react';
import { MOCK_THREAT_FEED } from '../lib/mocks/feedData';
import { formatRelativeTime } from '../lib/utils/formatters';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-b border-zinc-900 cyber-grid overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            <span>Zero-Trust Architecture / Explainable Multi-Signal Linter</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            Deterministic web trust intelligence.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            Cryptographic, visual, and behavioral inspection in one deterministic score.
          </p>

          {/* Scanner Input with Demo Pills */}
          <div className="pt-6">
            <UrlScannerInput />
          </div>
        </div>
      </section>

      {/* Live Stream Telemetry Marquee */}
      <section className="py-4 bg-zinc-950/90 border-b border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium shrink-0">
            <Radio className="w-4 h-4 text-rose-400 motion-safe:animate-pulse" />
            <span>Zero-Day Detection Stream:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 text-xs text-zinc-400">
            {MOCK_THREAT_FEED.slice(0, 4).map((feed) => (
              <Link
                key={feed.id}
                href={`/scan/${feed.url.includes('sbi') ? 'scan-sbi-phish' : feed.url.includes('gov') ? 'scan-emudhra-crypto' : 'scan-sbi-phish'}`}
                className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0 hover:border-zinc-700 transition-colors"
              >
                <span className="text-rose-400 font-bold">[{feed.verdict}]</span>
                <span className="text-zinc-300 truncate max-w-[180px] font-mono">{feed.url.replace('https://', '')}</span>
                <span className="text-zinc-500 text-[10px]">{formatRelativeTime(feed.detectedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The Three Core Pillars of TrustLens */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
            Engineered for Ground-Truth Explainability
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Unlike opaque machine learning models that generate ungrounded percentages, TrustLens scores are directly provable through mathematical and cryptographic evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              1. Cryptographic Rigor &amp; Fermat Sieve
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time audit of RSA public keys for the ROCA / Fermat vulnerability ($|p - q| &lt; 2^{16}$), flagging subordinate intermediate CAs distrusted under the CCADB root program (such as the recent eMudhra incident).
            </p>
            <div className="pt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
              <span>Proof-backed X.509 linting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              2. Computer Vision Anti-Phishing
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Compares headless Chromium screenshot captures against high-value banking and government brands (SBI, HDFC, UIDAI) using Structural Similarity (SSIM). Triggers hard overrides when paired with external form targets.
            </p>
            <div className="pt-2 text-xs font-medium text-rose-400 flex items-center gap-1">
              <span>&gt;85% SSIM threshold defense</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              3. Threat Infrastructure Clustering
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Traces resolving IP addresses and BGP Autonomous Systems (ASNs) to expose criminal infrastructure, bulletproof hosts, and lookalike domain clusters orchestrated by active threat campaigns.
            </p>
            <div className="pt-2 text-xs font-medium text-sky-400 flex items-center gap-1">
              <span>STIX 2.1 &amp; Suricata ready</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

