'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '../../lib/types/scan';
import { FindingCard } from './FindingCard';
import { Filter, Layers } from 'lucide-react';

export interface EvidenceBreakdownProps {
  evidence: EvidenceItem[];
}

export const EvidenceBreakdown: React.FC<EvidenceBreakdownProps> = ({ evidence }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filtered = evidence.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
    return true;
  });

  const totalDeductions = evidence.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Contributing Signals ({evidence.length})
          </span>
          <span className="text-xs font-mono text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
            Total Deductions: -{totalDeductions} pts
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px]">Filter:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="crypto">Cryptography</option>
            <option value="phishing">Phishing</option>
            <option value="hygiene">Hygiene</option>
            <option value="intel">Threat Intel</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-xs focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((item) => <FindingCard key={item.id} item={item} />)
        ) : (
          <div className="text-center py-8 text-zinc-500 font-mono text-xs bg-zinc-950/40 border border-zinc-900 rounded-xl">
            No risk signals matching selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

