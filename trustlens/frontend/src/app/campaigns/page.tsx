'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_CAMPAIGNS } from '../../lib/mocks/campaignData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Layers, ShieldAlert, Network, ArrowRight, ExternalLink, Activity } from 'lucide-react';

export default function CampaignsPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    MOCK_CAMPAIGNS[0].id
  );

  const selectedCampaign =
    MOCK_CAMPAIGNS.find((c) => c.id === selectedCampaignId) || MOCK_CAMPAIGNS[0];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Threat Infrastructure &amp; Campaign Clustering
          </h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Graph clustering grouping distributed phishing infrastructure tied by shared ASNs, registrars, nameserver clusters, and certificate fingerprints.
        </p>
      </div>

      {/* Campaign Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_CAMPAIGNS.map((camp) => {
          const isSelected = camp.id === selectedCampaignId;
          return (
            <button
              key={camp.id}
              onClick={() => setSelectedCampaignId(camp.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-zinc-800/90 border-emerald-500/60 shadow-lg'
                  : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-900/60'
              }`}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 uppercase font-semibold">
                    {camp.killChainStage}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {camp.activeDomainCount} Active Nodes
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 truncate">{camp.campaignName}</h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  Target: <strong className="text-zinc-200">{camp.primaryTargetBrand}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 w-full flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Registrar: {camp.primaryRegistrar.split(' ')[0]}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  Inspect Cluster &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Campaign Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campaign Stats & ASN Distribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-zinc-950/80 border border-zinc-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="font-semibold text-zinc-200 text-xs">Campaign Infrastructure Metadata</span>
              <span className="text-[10px] text-rose-400 font-bold uppercase px-2 py-0.5 bg-rose-950 border border-rose-500/30 rounded">
                STAGE: {selectedCampaign.killChainStage}
              </span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Identified Threat Actor Signature:</span>
                <span className="text-zinc-200 font-semibold">{selectedCampaign.threatActor}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Primary Registrar Ecosystem:</span>
                <span className="text-zinc-300">{selectedCampaign.primaryRegistrar}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">First Detected</span>
                  <span className="text-zinc-300">{selectedCampaign.firstSeen.split('T')[0]}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">Last Observation</span>
                  <span className="text-zinc-300">{selectedCampaign.lastActive.split('T')[0]}</span>
                </div>
              </div>
            </div>

            {/* ASN Distribution Breakdown */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                BGP Hosting Infrastructure Distribution
              </span>
              <div className="space-y-2">
                {selectedCampaign.asnDistribution.map((asnItem) => (
                  <div key={asnItem.asn} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-300">{asnItem.asn} ({asnItem.name})</span>
                      <span className="text-emerald-400 font-bold">{asnItem.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${asnItem.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Associated Domain Nodes Table (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5 bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                Associated Infrastructure Domains ({selectedCampaign.domains.length} Nodes Sampled)
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">Live Status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="text-zinc-500 text-[10px] uppercase border-b border-zinc-900">
                  <tr>
                    <th className="py-2">Domain FQDN</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Trust Score</th>
                    <th className="py-2 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {selectedCampaign.domains.map((dom, i) => (
                    <tr key={i} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 font-semibold text-zinc-100">{dom.domain}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                            dom.status === 'active'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                              : dom.status === 'takedown_requested'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {dom.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-rose-400">
                        {dom.trustScore.toString().padStart(2, '0')}/100
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/scan/${dom.domain.includes('sbi') ? 'scan-sbi-phish' : 'scan-emudhra-crypto'}`}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                        >
                          <span>Dossier</span>
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
      </div>
    </div>
  );
}

