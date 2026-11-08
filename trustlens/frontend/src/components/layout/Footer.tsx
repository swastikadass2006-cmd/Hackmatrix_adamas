import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 text-zinc-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>TrustLens Defense Platform</span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-xs">
              Explainable multi-signal threat intelligence engine designed to detect credential-harvesting phishing kits, audit certificate trust anchors, and uncover Fermat-factorable keys.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 text-xs">
              Detection engines
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  Fermat Sieve Cryptanalysis
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  Visual SSIM Brand Impersonation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  CCADB Trust Anchor Linter
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  ASN Infrastructure Clustering
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Intel */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 text-xs">
              Intelligence and API
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  Real-time Threat Feed
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  STIX 2.1 Taxii Integrations
                </Link>
              </li>
              <li>
                <Link href="/org/watchlist" className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75">
                  Enterprise Brand Watchlist
                </Link>
              </li>
              <li>
                <a
                  href="https://ccadb.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75 inline-flex items-center gap-1"
                >
                  <span>CCADB Root Program</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-zinc-200 font-semibold mb-3 text-xs">
              Engine status
            </h4>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Node Pipeline:</span>
                <span className="text-emerald-400 font-mono text-[11px]">ONLINE (4/4)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fermat Factor Sieve:</span>
                <span className="text-zinc-300 font-mono text-[11px]">&lt; 100 iters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SSIM Threshold:</span>
                <span className="text-zinc-300 font-mono text-[11px]">0.85 (Hard Cap)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Active CCADB Baseline:</span>
                <span className="text-zinc-300 font-mono text-[11px]">v2.8 Compliant</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
          <div>© {new Date().getFullYear()} TrustLens Digital Trust Framework. Open Security Intelligence.</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 / Post-Quantum Ready</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

