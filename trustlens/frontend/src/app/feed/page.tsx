'use client';

import React from 'react';
import Link from 'next/link';
import { useThreatFeed } from '../../hooks/useThreatFeed';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatRelativeTime } from '../../lib/utils/formatters';
import { Radio, Download, ShieldAlert, Filter, Play, Pause, ExternalLink } from 'lucide-react';

export default function ThreatFeedPage() {
  const {
    feed,
    filterBrand,
    setFilterBrand,
    filterSeverity,
    setFilterSeverity,
    isLiveStreaming,
    setIsLiveStreaming,
    exportStix,
  } = useThreatFeed();

  const handleDownloadSuricata = () => {
    const rules = feed
      .map(
        (item, index) =>
          `alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"TRUSTLENS PHISH DETECTED [${item.targetBrand || 'Generic'}]"; content:"${item.url.replace('https://', '').split('/')[0]}"; sid:3000${index}; rev:1;)`
      )
      .join('\n');

    const blob = new Blob([rules], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens-suricata-rules-${Date.now()}.rules`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Global Threat Intelligence Stream (Zero-Day Ingest)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time feed of detected credential exfiltration endpoints, weak Fermat keys, and CCADB CA infractions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="text-xs font-mono"
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5 text-amber-400 mr-1" /> : <Play className="w-3.5 h-3.5 text-emerald-400 mr-1" />}
            <span>{isLiveStreaming ? 'Pause Stream' : 'Resume'}</span>
          </Button>

          <Button size="sm" variant="outline" onClick={handleDownloadSuricata} className="text-xs font-mono">
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Suricata Rules</span>
          </Button>

          <Button size="sm" variant="primary" onClick={exportStix} className="text-xs font-mono">
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>STIX 2.1 Bundle</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter Feed:</span>
          </div>

          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none"
          >
            <option value="all">All Brands</option>
            <option value="State Bank of India">State Bank of India</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="UIDAI (Aadhaar)">UIDAI (Aadhaar)</option>
            <option value="ICICI Bank">ICICI Bank</option>
            <option value="Income Tax Dept (e-Filing)">Income Tax Dept</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none"
          >
            <option value="all">All Verdicts</option>
            <option value="malicious">Malicious</option>
            <option value="suspicious">Suspicious</option>
            <option value="safe">Safe</option>
          </select>
        </div>

        <div className="text-[11px] font-mono text-zinc-500">
          Showing {feed.length} active indicators &bull; Auto-refresh enabled
        </div>
      </Card>

      {/* Stream Table */}
      <Card className="p-0 bg-zinc-950/90 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Detected Target</th>
                <th className="py-3 px-4">Spoofed Entity</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Hosting ASN / Geo</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {feed.map((event) => (
                <tr key={event.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-100">
                    <span className="truncate max-w-[240px] block" title={event.url}>
                      {event.url}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[11px]">
                      {event.targetBrand || 'Unknown Entity'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        event.threatType === 'credential_harvesting'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : event.threatType === 'weak_key'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-950 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {event.threatType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        event.trustScore < 15
                          ? 'text-rose-400'
                          : event.trustScore < 50
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {event.trustScore.toString().padStart(2, '0')}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    <span>{event.asn} ({event.originCountry})</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-[11px]">
                    {formatRelativeTime(event.detectedAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/scan/${event.url.includes('sbi') ? 'scan-sbi-phish' : event.url.includes('gov') ? 'scan-emudhra-crypto' : 'scan-sbi-phish'}`}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                    >
                      <span>Analyze</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

