'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  MessageSquare,
  FileCheck2,
  Radio,
  Clock,
  Plus,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  getRecentInvestigations,
  RecentInvestigation,
} from '../../lib/utils/investigationStorage';
import { useLanguage } from '../../hooks/useLanguage';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [recent, setRecent] = useState<RecentInvestigation[]>([]);
  const { t } = useLanguage();

  const loadRecent = () => {
    setRecent(getRecentInvestigations());
  };

  useEffect(() => {
    loadRecent();
    window.addEventListener('trustlens_investigations_updated', loadRecent);
    return () => {
      window.removeEventListener('trustlens_investigations_updated', loadRecent);
    };
  }, []);

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'Confirmed Malicious':
        return 'bg-tl-rose shadow-[0_0_8px_rgba(244,63,94,0.6)]';
      case 'High Risk':
        return 'bg-tl-orange shadow-[0_0_8px_rgba(249,115,22,0.6)]';
      case 'Suspicious':
        return 'bg-tl-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]';
      case 'No indicators found':
        return 'bg-tl-emerald shadow-[0_0_8px_rgba(69,198,155,0.6)]';
      default:
        return 'bg-tl-muted';
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-[#0E1520]/70 backdrop-blur-xl border-r border-white/[0.07] text-tl-text-secondary select-none">
      {/* Sidebar Header / Investigations Count */}
      <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-tl-text-primary">
            {t.sidebar?.recentActivity || 'Investigations'}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[#141E2E]/90 text-tl-cyan border border-white/[0.08] shadow-inner">
            {recent.length}
          </span>
        </div>
        <button
          onClick={() => router.push('/scanner')}
          className="w-7 h-7 rounded-lg bg-[#141E2E]/60 border border-white/[0.08] flex items-center justify-center hover:border-tl-cyan/40 hover:bg-[#1A273D] text-tl-cyan transition-all duration-300"
          title={t.sidebar?.newScan || 'New Investigation'}
          aria-label={t.sidebar?.newScan || 'New Investigation'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        {/* Workspace Navigation */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-tl-text-muted">
            {t.sidebar?.workspace || 'Workspace'}
          </div>
          <Link
            href="/"
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pathname === '/'
                ? 'bg-[#162235]/90 text-tl-text-bright font-medium border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.15)]'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-tl-cyan" />
              <span>{t.nav?.overview || 'Overview'}</span>
            </div>
            {pathname === '/' && <ChevronRight className="w-3 h-3 text-tl-cyan" />}
          </Link>

          <Link
            href="/scanner"
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pathname === '/scanner'
                ? 'bg-[#162235]/90 text-tl-text-bright font-medium border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.15)]'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-tl-emerald" />
              <span>{t.nav?.scanner || 'URL Scanner'}</span>
            </div>
            {pathname === '/scanner' && <ChevronRight className="w-3 h-3 text-tl-cyan" />}
          </Link>

          <Link
            href="/analyze"
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pathname === '/analyze'
                ? 'bg-[#162235]/90 text-tl-text-bright font-medium border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.15)]'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-tl-amber" />
              <span>{t.nav?.scamAnalyzer || 'Scam Analyzer'}</span>
            </div>
            {pathname === '/analyze' && <ChevronRight className="w-3 h-3 text-tl-cyan" />}
          </Link>
        </div>

        {/* Recent Investigations (from real data) */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-tl-text-muted">
            <span>{t.sidebar?.recentActivity || 'Recent Activity'}</span>
            <Clock className="w-3 h-3 text-tl-text-muted" />
          </div>

          {recent.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-[#141E2E]/40 border border-white/[0.06] text-center">
              <p className="text-[11px] text-tl-text-muted">{t.sidebar?.noScans || 'No investigations recorded yet.'}</p>
              <button
                onClick={() => router.push('/scanner')}
                className="mt-1.5 text-[11px] text-tl-cyan hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan"
              >
                {t.overview?.startFirstScan || 'Start first scan'} &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/scan/${inv.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141E2E]/50 hover:bg-[#141E2E]/80 border border-white/[0.06] hover:border-white/[0.14] text-[11px] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(
                        inv.classification
                      )}`}
                    />
                    <span className="truncate text-tl-text-primary group-hover:text-tl-cyan font-mono">
                      {inv.targetUrl.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Intelligence Feeds & Verifier */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-tl-text-muted">
            {t.tabs?.intel || 'Intelligence'}
          </div>
          <Link
            href="/feed"
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pathname === '/feed'
                ? 'bg-[#162235]/90 text-tl-text-bright font-medium border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.15)]'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-tl-rose" />
              <span>{t.nav?.intelFeed || 'Intel Feed'}</span>
            </div>
          </Link>

          <Link
            href="/verify"
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pathname === '/verify'
                ? 'bg-[#162235]/90 text-tl-text-bright font-medium border border-tl-cyan/30 shadow-[0_0_15px_rgba(67,185,219,0.15)]'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-tl-cyan" />
              <span>{t.nav?.web3Verifier || 'Report Verification'}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Access Dock (Reference Image 1 bottom 3 rounded frosted glass buttons) */}
      <div className="p-3.5 border-t border-white/[0.07] bg-[#0E1520]/80 backdrop-blur-md space-y-2">
        <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-tl-text-muted">
          {t.sidebar?.quickActions || 'Quick Access'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => router.push('/scanner')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] hover:border-tl-cyan/40 hover:bg-[#1A273D]/90 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            title={t.sidebar?.newScan || 'Scan Target'}
            aria-label={t.sidebar?.newScan || 'Scan Target'}
          >
            <Search className="w-4 h-4 text-tl-cyan group-hover:scale-110 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full font-medium">Scan</span>
          </button>

          <button
            onClick={() => router.push('/analyze')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] hover:border-tl-amber/40 hover:bg-[#1A273D]/90 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            title={t.sidebar?.analyzeText || 'Analyze Message'}
            aria-label={t.sidebar?.analyzeText || 'Analyze Message'}
          >
            <MessageSquare className="w-4 h-4 text-tl-amber group-hover:scale-110 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full font-medium">Text</span>
          </button>

          <button
            onClick={() => router.push('/verify')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] hover:border-tl-emerald/40 hover:bg-[#1A273D]/90 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            title={t.sidebar?.verifyProof || 'Verify Hash'}
            aria-label={t.sidebar?.verifyProof || 'Verify Hash'}
          >
            <FileCheck2 className="w-4 h-4 text-tl-emerald group-hover:scale-110 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full font-medium">Proof</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
