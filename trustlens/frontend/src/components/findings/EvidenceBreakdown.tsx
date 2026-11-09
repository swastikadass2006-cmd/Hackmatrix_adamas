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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-tl-panel border border-tl-border rounded-panel">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-tl-cyan" />
          <span className="text-xs font-semibold text-tl-text">
            Contributing Signals ({evidence.length})
          </span>
          <span className="text-xs text-tl-rose font-medium bg-tl-rose/10 px-2 py-0.5 rounded border border-tl-rose/30">
            Total deductions: <span className="font-mono font-bold">-{totalDeductions}</span> pts
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-tl-muted">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs">Filter:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-tl-card border border-tl-border rounded px-2 py-1 text-tl-text text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan active:opacity-80 disabled:opacity-50"
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
            className="bg-tl-card border border-tl-border rounded px-2 py-1 text-tl-text text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan active:opacity-80 disabled:opacity-50"
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
          <div className="text-center py-8 text-tl-muted text-xs bg-tl-panel border border-tl-border rounded-panel">
            No risk signals matching selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

