'use client';

import React from 'react';
import Link from 'next/link';
import { useThreatFeed } from '../../hooks/useThreatFeed';
import { formatRelativeTime } from '../../lib/utils/formatters';
import { Radio, Download, ShieldAlert, Filter, Play, Pause, ExternalLink, ArrowRight } from 'lucide-react';

export default function ThreatIntelligenceStreamPage() {
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
    <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-tl-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-tl-rose" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tl-text-primary">
              Global Threat Intelligence Stream
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-tl-text-secondary mt-1">
            Real-time feed of detected credential exfiltration endpoints, weak Fermat keys, and CCADB CA distrust infractions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
              isLiveStreaming
                ? 'bg-tl-card border-tl-emerald/40 text-tl-emerald'
                : 'bg-tl-card border-tl-border text-tl-text-muted hover:text-tl-text-primary'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Streaming Live</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          <button
            onClick={exportStix}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-tl-text-secondary hover:text-tl-text-primary text-xs font-mono font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>STIX 2.1</span>
          </button>

          <button
            onClick={handleDownloadSuricata}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-tl-text-secondary hover:text-tl-text-primary text-xs font-mono font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Suricata Rules</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-tl-card border border-tl-border rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-panel">
        <div className="flex items-center gap-2 text-tl-text-muted">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Stream:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-tl-panel border border-tl-border rounded-lg px-2.5 py-1 text-tl-text-primary text-xs focus:outline-none focus:border-tl-cyan"
          >
            <option value="all">All Brands</option>
            <option value="SBI">State Bank of India</option>
            <option value="HDFC">HDFC Bank</option>
            <option value="eMudhra">eMudhra / CA</option>
            <option value="Generic">Generic Phish</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-tl-panel border border-tl-border rounded-lg px-2.5 py-1 text-tl-text-primary text-xs focus:outline-none focus:border-tl-cyan"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Stream Table */}
      <div className="bg-tl-card border border-tl-border rounded-panel overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-tl-panel text-tl-text-muted border-b border-tl-border uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target FQDN</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Impersonated Brand</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tl-border/60">
              {feed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-tl-text-muted">
                    No active threat signals matching the filter criteria.
                  </td>
                </tr>
              ) : (
                feed.map((item) => (
                  <tr key={item.id} className="hover:bg-tl-hover/40 transition group">
                    <td className="py-3 px-4 text-tl-text-muted text-[11px] whitespace-nowrap">
                      {formatRelativeTime(item.detectedAt)}
                    </td>
                    <td className="py-3 px-4 text-tl-text-primary font-medium select-all">
                      {item.url.replace(/^https?:\/\//, '')}
                    </td>
                    <td className="py-3 px-4 text-tl-text-secondary text-[11px]">
                      {item.threatType}
                    </td>
                    <td className="py-3 px-4 text-tl-text-secondary text-[11px]">
                      {item.targetBrand || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          item.verdict === 'malicious'
                            ? 'bg-tl-rose/15 text-tl-rose border-tl-rose/30'
                            : item.verdict === 'suspicious'
                            ? 'bg-tl-amber/15 text-tl-amber border-tl-amber/30'
                            : 'bg-tl-emerald/15 text-tl-emerald border-tl-emerald/30'
                        }`}
                      >
                        {item.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/scan/${encodeURIComponent(item.url.replace(/^https?:\/\//, ''))}`}
                        className="inline-flex items-center gap-1 text-[11px] text-tl-cyan hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
