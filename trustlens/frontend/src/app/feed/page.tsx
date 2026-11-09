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
    <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
                Global Threat Intelligence Stream
              </h1>
              <p className="text-xs sm:text-sm text-[#778496] mt-0.5">
                Real-time feed of detected credential exfiltration endpoints, weak Fermat keys, and CCADB CA distrust infractions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition ${
              isLiveStreaming
                ? 'bg-[#141E2E]/90 border-[#45C69B]/40 text-[#45C69B] shadow-[0_0_15px_rgba(69,198,155,0.2)]'
                : 'bg-[#141E2E]/60 border-white/[0.08] text-[#778496] hover:text-[#F1F5F9]'
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141E2E]/80 hover:bg-[#162235] border border-white/[0.08] text-[#778496] hover:text-[#F1F5F9] text-xs font-mono font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>STIX 2.1</span>
          </button>

          <button
            onClick={handleDownloadSuricata}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141E2E]/80 hover:bg-[#162235] border border-white/[0.08] text-[#778496] hover:text-[#F1F5F9] text-xs font-mono font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Suricata Rules</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 glass-card flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#778496]">
          <Filter className="w-3.5 h-3.5 text-[#43B9DB]" />
          <span>Filter Stream:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-[#070B11]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[#F1F5F9] text-xs focus:outline-none focus:border-[#43B9DB]/60"
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
            className="bg-[#070B11]/80 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[#F1F5F9] text-xs focus:outline-none focus:border-[#43B9DB]/60"
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
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141E2E]/80 text-[#778496] border-b border-white/[0.08] uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Target FQDN</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Impersonated Brand</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {feed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#778496]">
                    No active threat signals matching the filter criteria.
                  </td>
                </tr>
              ) : (
                feed.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition duration-150 group">
                    <td className="py-3 px-4 text-[#778496] text-[11px] whitespace-nowrap">
                      {formatRelativeTime(item.detectedAt)}
                    </td>
                    <td className="py-3 px-4 text-[#F1F5F9] font-medium select-all">
                      {item.url.replace(/^https?:\/\//, '')}
                    </td>
                    <td className="py-3 px-4 text-[#778496] text-[11px]">
                      {item.threatType}
                    </td>
                    <td className="py-3 px-4 text-[#778496] text-[11px]">
                      {item.targetBrand || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          item.verdict === 'malicious'
                            ? 'bg-[#E11D48]/15 text-[#E11D48] border-[#E11D48]/30'
                            : item.verdict === 'suspicious'
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                            : 'bg-[#45C69B]/15 text-[#45C69B] border-[#45C69B]/30'
                        }`}
                      >
                        {item.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/scan/${encodeURIComponent(item.url.replace(/^https?:\/\//, ''))}`}
                        className="inline-flex items-center gap-1 text-[11px] text-[#43B9DB] hover:underline group-hover:translate-x-0.5 transition-transform"
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
