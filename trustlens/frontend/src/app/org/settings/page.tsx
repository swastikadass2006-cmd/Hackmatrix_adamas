'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_ORG_SETTINGS } from '../../../lib/mocks/orgData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Settings, Key, Webhook, ShieldAlert, Save, Check } from 'lucide-react';

export default function OrgSettingsPage() {
  const [settings, setSettings] = useState(MOCK_ORG_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Sub-nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Enterprise SOC Configuration &amp; Integrations
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure SIEM automated webhook dispatches, crt.sh live monitoring parameters, and automated takedown thresholds.
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
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Trends
          </Link>
          <Link
            href="/org/settings"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
          >
            Settings
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2">
            Identity &amp; Incident Dispatch Channels
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-zinc-400 block mb-1">Organization / SOC Unit Name</label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">SOC Escalation Email</label>
              <Input
                value={settings.socEmail}
                onChange={(e) => setSettings({ ...settings, socEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Webhook Endpoint (Slack / Microsoft Teams / SIEM)</label>
              <Input
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2">
            Automated Defense Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Automated Takedown Request Threshold:</span>
                <span className="text-rose-400 font-bold">TrustScore &le; {settings.autoTakedownThreshold}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={settings.autoTakedownThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, autoTakedownThreshold: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Domains scoring below this threshold trigger an immediate pre-compiled takedown notice to registrars and CERT-In.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableCrtWatcher}
                  onChange={(e) => setSettings({ ...settings, enableCrtWatcher: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-zinc-200">
                  Enable continuous Certificate Transparency (crt.sh) real-time stream monitor
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableFermatDetection}
                  onChange={(e) =>
                    setSettings({ ...settings, enableFermatDetection: e.target.checked })
                  }
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-zinc-200">
                  Run Fermat Sieve prime factorization checks on all newly detected SSL keys
                </span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" size="md">
            {saved ? <Check className="w-4 h-4 text-zinc-950 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            <span>{saved ? 'Configuration Saved' : 'Save SOC Parameters'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

