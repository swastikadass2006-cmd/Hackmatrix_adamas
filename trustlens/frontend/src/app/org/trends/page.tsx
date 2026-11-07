'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { TrendingUp, ShieldAlert, Cpu, Eye, BarChart3 } from 'lucide-react';

export default function OrgTrendsPage() {
  const trendMetrics = [
    { month: 'Jun', phishingHits: 24, weakKeys: 2, avgScore: 78 },
    { month: 'Jul', phishingHits: 38, weakKeys: 5, avgScore: 71 },
    { month: 'Aug', phishingHits: 45, weakKeys: 8, avgScore: 68 },
    { month: 'Sep', phishingHits: 72, weakKeys: 14, avgScore: 62 },
    { month: 'Oct', phishingHits: 95, weakKeys: 18, avgScore: 54 },
    { month: 'Nov', phishingHits: 142, weakKeys: 23, avgScore: 49 },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Sub-nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Phishing &amp; Cryptographic Threat Evolution Trends
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Historical trajectory of lookalike domain campaigns, Fermat weak key proliferation, and mean trust score degradation.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href="/org/watchlist"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Watchlist
          </Link>
          <Link
            href="/org/alerts"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Alerts
          </Link>
          <Link
            href="/org/trends"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
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

      {/* Historical Bar Chart Display */}
      <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-6 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-200 text-sm">
              6-Month Incident Trajectory (Phishing vs Cryptographic Flaws)
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Updated Hourly</span>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-6 gap-3 items-end h-56 pt-8 pb-4 border-b border-zinc-800">
          {trendMetrics.map((item) => {
            const phishHeight = (item.phishingHits / 150) * 100;
            const weakKeyHeight = (item.weakKeys / 30) * 100;

            return (
              <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Phishing bar */}
                  <div
                    className="w-1/2 max-w-[20px] bg-rose-500 rounded-t transition-all group-hover:bg-rose-400"
                    style={{ height: `${phishHeight}%` }}
                    title={`${item.phishingHits} Phishing Domains`}
                  />
                  {/* Weak key bar */}
                  <div
                    className="w-1/2 max-w-[20px] bg-amber-500 rounded-t transition-all group-hover:bg-amber-400"
                    style={{ height: `${weakKeyHeight}%` }}
                    title={`${item.weakKeys} Weak Keys`}
                  />
                </div>
                <span className="text-zinc-400 font-bold">{item.month}</span>
                <span className="text-[10px] text-zinc-500 font-semibold">{item.phishingHits} hits</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-rose-500 rounded-sm" />
            <span>Phishing Domain Detections (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-sm" />
            <span>Fermat / Weak Key Flaws (Amber)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

