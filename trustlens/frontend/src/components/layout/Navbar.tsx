'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Layers,
  Search,
  MessageSquare,
  FileCheck2,
  Radio,
  Code,
  Menu,
  X,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../hooks/useLanguage';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navTabs = [
    { label: t.nav?.overview || 'Overview', href: '/', icon: Layers },
    { label: t.nav?.scanner || 'Scanner', href: '/scanner', icon: Search },
    { label: t.nav?.scamAnalyzer || 'Scam Analyzer', href: '/analyze', icon: MessageSquare },
    { label: t.nav?.web3Verifier || 'Web3 Verifier', href: '/verify', icon: FileCheck2 },
    { label: t.nav?.intelFeed || 'Intel Feed', href: '/feed', icon: Radio },
    { label: t.nav?.apiDocs || 'API Docs', href: '/api-docs', icon: Code },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between z-30 select-none bg-[#0E1520]/70 backdrop-blur-xl border-b border-white/[0.07] sm:rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="w-full flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.09] flex items-center justify-center text-tl-cyan group-hover:border-tl-cyan/40 group-hover:shadow-[0_0_15px_rgba(67,185,219,0.25)] transition-all duration-300">
            <Shield className="w-4 h-4 fill-tl-cyan/20" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-tl-text-primary">
              TrustLens
            </span>
            <span className="text-[10px] font-mono text-tl-text-muted hidden sm:inline">
              v2.4
            </span>
          </div>
        </Link>

        {/* Central Pill-Style Floating Navigation (Reference Image 1) */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] space-x-1 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'bg-[#162235]/95 text-tl-text-bright shadow-[0_0_15px_rgba(67,185,219,0.25)] border border-tl-cyan/40'
                    : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-tl-cyan' : 'text-tl-text-muted'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono shadow-inner">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tl-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tl-emerald" />
            </span>
            <span className="text-tl-text-muted">{t.nav?.securityCore || 'Security Core'}:</span>
            <span className="text-tl-emerald font-semibold">{t.nav?.ready || 'Ready'}</span>
          </div>

          <LanguageSelector />

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] text-tl-text-muted hover:text-tl-text-primary"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0E1520]/95 backdrop-blur-2xl border-b border-white/[0.08] p-4 space-y-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#162235]/90 text-tl-text-bright border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.2)]'
                    : 'text-tl-text-muted hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 text-tl-cyan" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
