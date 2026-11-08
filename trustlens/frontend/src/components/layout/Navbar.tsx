'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Radio, Layers, Eye, BookOpen, Code, Menu, X, Lock, MessageSquare, FileCheck2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { LanguageSelector } from './LanguageSelector';

const NAV_LINKS = [
  { label: 'Scanner', href: '/', icon: Shield },
  { label: 'Scam Analyzer', href: '/analyze', icon: MessageSquare },
  { label: 'Web3 Verifier', href: '/verify', icon: FileCheck2 },
  { label: 'Intel Feed', href: '/feed', icon: Radio },
  { label: 'Campaigns', href: '/campaigns', icon: Layers },
  { label: 'SOC Watchlist', href: '/org/watchlist', icon: Eye },
  { label: 'API Docs', href: '/api-docs', icon: Code },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-zinc-950/95 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-80">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-colors">
            <Shield className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100">TrustLens</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 rounded">
                v2.4
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Explainable Threat Intel</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75',
                  isActive
                    ? 'bg-zinc-800/80 text-emerald-400 border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right CTA & Lang */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/org/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SOC Portal</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75 disabled:opacity-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-900 mt-2">
            <Link
              href="/org/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-zinc-900"
            >
              <Lock className="w-4 h-4" />
              <span>SOC Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

