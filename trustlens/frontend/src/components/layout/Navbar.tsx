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
  Activity,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

const NAV_TABS = [
  { label: 'Overview', href: '/', icon: Layers },
  { label: 'Scanner', href: '/scanner', icon: Search },
  { label: 'Scam Analyzer', href: '/analyze', icon: MessageSquare },
  { label: 'Web3 Verifier', href: '/verify', icon: FileCheck2 },
  { label: 'Intel Feed', href: '/feed', icon: Radio },
  { label: 'API Docs', href: '/api-docs', icon: Code },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-tl-panel border-b border-tl-border flex items-center px-4 sm:px-6 z-30 select-none">
      <div className="w-full flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-tl-card border border-tl-border flex items-center justify-center text-tl-cyan group-hover:border-tl-border-active transition">
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

        {/* Central Pill-Style Horizontal Navigation (Reference Image 1) */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-tl-card border border-tl-border space-x-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-tl-elevated text-tl-text-primary shadow-sm border border-tl-border-active'
                    : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-hover/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-tl-cyan' : 'text-tl-text-muted'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-tl-card border border-tl-border text-[11px] font-mono">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tl-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tl-emerald" />
            </span>
            <span className="text-tl-text-secondary">Security Core:</span>
            <span className="text-tl-emerald font-medium">Ready</span>
          </div>

          <LanguageSelector />

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-tl-card border border-tl-border text-tl-text-secondary hover:text-tl-text-primary"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-tl-panel border-b border-tl-border p-4 space-y-2 z-50">
          {NAV_TABS.map((tab) => {
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-tl-card text-tl-text-primary border border-tl-border'
                    : 'text-tl-text-secondary hover:bg-tl-card/60'
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
