'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_MONITORED_BRANDS, MOCK_TYPOSQUATS, MOCK_CRT_HITS } from '../../../lib/mocks/orgData';
import { WatchlistTable } from '../../../components/org/WatchlistTable';
import { Card } from '../../../components/ui/Card';
import { Eye, Bell, TrendingUp, Settings, ShieldAlert, Globe, Radio } from 'lucide-react';

export default function OrgWatchlistPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Sub-navigation bar for SOC */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Enterprise Brand Watchlist &amp; crt.sh Monitor
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Proactive early-warning telemetry detecting lookalike registrations and SSL issuance before attack distribution.
          </p>
        </div>

        {/* SOC Subnav */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href="/org/watchlist"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
          >
            Watchlist
          </Link>
          <Link
            href="/org/alerts"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Alerts (3)
          </Link>
          <Link
            href="/org/trends"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Trends
          </Link>
          <Link
            href="/org/settings"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Monitored Brand High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_MONITORED_BRANDS.map((brand) => (
          <Card key={brand.id} className="p-4 bg-zinc-950/70 border border-zinc-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-100">{brand.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                {brand.riskTolerance} Tolerance
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-zinc-400">
              <div className="flex justify-between">
                <span>Canonical Root:</span>
                <span className="text-zinc-200 font-semibold">{brand.canonicalDomain}</span>
              </div>
              <div className="flex justify-between">
                <span>Live Typosquats Flagged:</span>
                <span className="text-rose-400 font-bold">{brand.totalTyposquatsDetected}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Takedown Requests:</span>
                <span className="text-amber-400 font-bold">{brand.activeAlerts}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Watchlist Table (Typosquats & Certificate Transparency) */}
      <WatchlistTable typosquats={MOCK_TYPOSQUATS} crtHits={MOCK_CRT_HITS} />
    </div>
  );
}

