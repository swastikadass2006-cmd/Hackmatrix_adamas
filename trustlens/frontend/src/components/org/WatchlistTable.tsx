'use client';

import React, { useState } from 'react';
import { TyposquatCandidate, CertTransparencyHit } from '../../lib/types/org';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldAlert, Globe, AlertTriangle, ExternalLink, Send, Search } from 'lucide-react';

export interface WatchlistTableProps {
  typosquats: TyposquatCandidate[];
  crtHits: CertTransparencyHit[];
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ typosquats, crtHits }) => {
  const [activeTab, setActiveTab] = useState<'typosquats' | 'crt'>('typosquats');
  const [filterText, setFilterText] = useState('');
  const [takedownStatus, setTakedownStatus] = useState<Record<string, boolean>>({});

  const handleTriggerTakedown = (id: string, domain: string) => {
    setTakedownStatus((prev) => ({ ...prev, [id]: true }));
    alert(`Automated takedown request package dispatched for: ${domain}`);
  };

  const filteredTypos = typosquats.filter((t) =>
    t.domain.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredCrt = crtHits.filter((c) =>
    c.domain.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Card className="p-5 bg-zinc-950/80 border border-zinc-800 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('typosquats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeTab === 'typosquats'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Typosquat Permutations ({typosquats.length})
          </button>
          <button
            onClick={() => setActiveTab('crt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeTab === 'crt'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Certificate Transparency (crt.sh) Hits ({crtHits.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search candidate domain..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Tab 1: Typosquats */}
      {activeTab === 'typosquats' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Domain Permutation</th>
                <th className="py-2.5 px-3">Attack Technique</th>
                <th className="py-2.5 px-3">Status / HTTP</th>
                <th className="py-2.5 px-3">Similarity</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">SOC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {filteredTypos.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-100 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.domain}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 uppercase">
                      {item.technique}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.liveHttp ? (
                      <span className="text-rose-400 font-bold text-[10px]">LIVE (HTTP 200)</span>
                    ) : item.registered ? (
                      <span className="text-amber-400 text-[10px]">DNS PARKED</span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">AVAILABLE</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-200">
                    {(item.similarityRatio * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        item.riskScore > 80
                          ? 'text-rose-400'
                          : item.riskScore > 50
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {item.riskScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      size="sm"
                      variant={takedownStatus[item.id] ? 'secondary' : 'danger'}
                      disabled={takedownStatus[item.id] || !item.liveHttp}
                      onClick={() => handleTriggerTakedown(item.id, item.domain)}
                      className="text-[10px] h-7 px-2.5"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      <span>{takedownStatus[item.id] ? 'Dispatched' : 'Takedown'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Certificate Transparency */}
      {activeTab === 'crt' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Subject Domain</th>
                <th className="py-2.5 px-3">Issuing CA</th>
                <th className="py-2.5 px-3">Logged Timestamp</th>
                <th className="py-2.5 px-3">Flag Reason</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {filteredCrt.map((hit) => (
                <tr key={hit.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-100 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{hit.domain}</span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{hit.issuer}</td>
                  <td className="py-2.5 px-3 text-zinc-500">{hit.loggedAt}</td>
                  <td className="py-2.5 px-3 text-rose-300 text-[11px] max-w-xs truncate">
                    {hit.flagReason || 'Benign legitimate issuance'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={`/scan/${encodeURIComponent(hit.domain)}`}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                    >
                      <span>Deep Scan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

