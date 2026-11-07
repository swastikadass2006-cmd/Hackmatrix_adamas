'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_ALERTS } from '../../../lib/mocks/orgData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Bell, ShieldAlert, CheckCircle2, Clock, Send, ArrowRight } from 'lucide-react';

export default function OrgAlertsPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Sub-nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              High-Severity Security Incident Alerts
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time webhook dispatches, SIEM events, and automated CERT-In takedown escalations.
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
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
          >
            Alerts ({MOCK_ALERTS.length})
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

      {/* Alerts Feed */}
      <div className="space-y-3 font-mono text-xs">
        {MOCK_ALERTS.map((alert) => (
          <Card key={alert.id} className="p-4 bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{alert.title}</h3>
                  <span className="text-[11px] text-zinc-400">Target Asset: {alert.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30 font-bold uppercase">
                  {alert.severity}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                  {alert.status}
                </span>
              </div>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed pl-10">
              {alert.summary}
            </p>

            <div className="pl-10 pt-2 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <span className="text-emerald-400">
                Action: <strong>{alert.actionRequired}</strong>
              </span>
              <span className="text-zinc-500">Logged: {alert.timestamp}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

