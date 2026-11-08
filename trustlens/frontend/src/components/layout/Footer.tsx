'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-tl-panel border-t border-tl-border py-4 px-6 text-xs text-tl-text-muted select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-tl-cyan" />
          <span className="text-tl-text-secondary font-medium">TrustLens Intelligence Platform</span>
          <span>&bull;</span>
          <span className="font-mono text-[11px]">Passive &amp; Non-Intrusive Security Audit</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/about" className="hover:text-tl-text-primary transition">
            Methodology
          </Link>
          <Link href="/api-docs" className="hover:text-tl-text-primary transition">
            API Reference
          </Link>
          <Link href="/verify" className="hover:text-tl-text-primary transition">
            Web3 Verification
          </Link>
        </div>
      </div>
    </footer>
  );
};
