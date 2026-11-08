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
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  getRecentInvestigations,
  RecentInvestigation,
} from '../../lib/utils/investigationStorage';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [recent, setRecent] = useState<RecentInvestigation[]>([]);

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
        return 'bg-rose-500';
      case 'High Risk':
        return 'bg-orange-500';
      case 'Suspicious':
        return 'bg-amber-400';
      case 'No indicators found':
        return 'bg-teal-400';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-tl-panel border-r border-tl-border text-tl-text-secondary select-none">
      {/* Sidebar Header / Investigations Count */}
      <div className="p-4 border-b border-tl-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-tl-text-primary">
            Investigations
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-tl-card text-tl-cyan border border-tl-border">
            {recent.length}
          </span>
        </div>
        <button
          onClick={() => router.push('/scanner')}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-tl-card text-tl-text-secondary hover:text-tl-text-primary transition"
          title="New Investigation"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        {/* Workspace Navigation */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono font-medium uppercase tracking-wider text-tl-text-muted">
            Workspace
          </div>
          <Link
            href="/"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              pathname === '/'
                ? 'bg-tl-card text-tl-text-primary font-medium border border-tl-border'
                : 'hover:bg-tl-card/60 hover:text-tl-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-tl-cyan" />
              <span>Overview</span>
            </div>
            {pathname === '/' && <ChevronRight className="w-3 h-3 text-tl-text-muted" />}
          </Link>

          <Link
            href="/scanner"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              pathname === '/scanner'
                ? 'bg-tl-card text-tl-text-primary font-medium border border-tl-border'
                : 'hover:bg-tl-card/60 hover:text-tl-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-tl-emerald" />
              <span>URL Scanner</span>
            </div>
            {pathname === '/scanner' && <ChevronRight className="w-3 h-3 text-tl-text-muted" />}
          </Link>

          <Link
            href="/analyze"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              pathname === '/analyze'
                ? 'bg-tl-card text-tl-text-primary font-medium border border-tl-border'
                : 'hover:bg-tl-card/60 hover:text-tl-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-tl-amber" />
              <span>Scam Analyzer</span>
            </div>
            {pathname === '/analyze' && <ChevronRight className="w-3 h-3 text-tl-text-muted" />}
          </Link>
        </div>

        {/* Recent Investigations (from real data) */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono font-medium uppercase tracking-wider text-tl-text-muted">
            <span>Recent Activity</span>
            <Clock className="w-3 h-3 text-tl-text-muted" />
          </div>

          {recent.length === 0 ? (
            <div className="p-3 rounded-lg bg-tl-card/40 border border-tl-border/60 text-center">
              <p className="text-[11px] text-tl-text-muted">No investigations recorded yet.</p>
              <button
                onClick={() => router.push('/scanner')}
                className="mt-1.5 text-[11px] text-tl-cyan hover:underline inline-flex items-center gap-1"
              >
                Start first scan &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/scan/${inv.id}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-tl-card/40 hover:bg-tl-card border border-tl-border/50 text-[11px] transition group"
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
          <div className="px-2 pb-1 text-[10px] font-mono font-medium uppercase tracking-wider text-tl-text-muted">
            Intelligence
          </div>
          <Link
            href="/feed"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              pathname === '/feed'
                ? 'bg-tl-card text-tl-text-primary font-medium border border-tl-border'
                : 'hover:bg-tl-card/60 hover:text-tl-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-tl-rose" />
              <span>Intel Feed</span>
            </div>
          </Link>

          <Link
            href="/verify"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              pathname === '/verify'
                ? 'bg-tl-card text-tl-text-primary font-medium border border-tl-border'
                : 'hover:bg-tl-card/60 hover:text-tl-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-3.5 h-3.5 text-tl-cyan" />
              <span>Report Verification</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Access Grid (inspired by Reference Image 1 bottom 3 rounded buttons) */}
      <div className="p-3 border-t border-tl-border bg-tl-panel/80 space-y-2">
        <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-tl-text-muted font-medium">
          Quick Actions
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => router.push('/scanner')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-center transition group"
            title="Scan URL"
          >
            <Search className="w-4 h-4 text-tl-cyan group-hover:scale-105 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full">Scan</span>
          </button>

          <button
            onClick={() => router.push('/analyze')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-center transition group"
            title="Analyze Message"
          >
            <MessageSquare className="w-4 h-4 text-tl-amber group-hover:scale-105 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full">Message</span>
          </button>

          <button
            onClick={() => router.push('/verify')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-center transition group"
            title="Verify Hash"
          >
            <FileCheck2 className="w-4 h-4 text-tl-emerald group-hover:scale-105 transition-transform" />
            <span className="text-[10px] mt-1 text-tl-text-secondary truncate w-full">Verify</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

