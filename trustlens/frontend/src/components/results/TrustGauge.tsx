'use client';

import React, { useState } from 'react';
import { HelpCircle, AlertOctagon, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ScanResult } from '../../lib/types/scan';
import { getScoreColor } from '../../lib/utils/formatters';
import { RiskFormulaModal } from './RiskFormulaModal';

export interface TrustGaugeProps {
  scan: ScanResult;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ scan }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { trustScore, grade, verdict, overrideActive } = scan;

  const colors = getScoreColor(trustScore);

  // Gauge calculation:
  // Semicircle: Radius = 85, Center = (110, 110)
  // Perimeter of semicircle = PI * R = ~267
  const radius = 85;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  // Needle angle: -180 deg (0) to 0 deg (100)
  const angle = -180 + (trustScore / 100) * 180;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors"
        style={{ backgroundColor: colors.stroke }}
      />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between mb-2 z-10">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          Digital Trust Index
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Explain</span>
        </button>
      </div>

      {/* SVG Semicircular Gauge */}
      <div className="relative w-64 h-36 flex items-end justify-center z-10">
        <svg viewBox="0 0 220 125" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background track arc */}
          <path
            d="M 25 110 A 85 85 0 0 1 195 110"
            fill="none"
            stroke="#27272a"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Value stroke arc */}
          <path
            d="M 25 110 A 85 85 0 0 1 195 110"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle Indicator */}
          <g
            transform={`rotate(${angle} 110 110)`}
            className="transition-transform duration-1000 ease-out"
          >
            <line
              x1="110"
              y1="110"
              x2="45"
              y2="110"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow"
            />
            <circle cx="110" cy="110" r="7" fill="#ffffff" />
            <circle cx="110" cy="110" r="3.5" fill="#09090b" />
          </g>
        </svg>

        {/* Numeric Score Overlay */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span
              className="font-mono text-4xl sm:text-5xl font-black tracking-tight"
              style={{ color: colors.stroke }}
            >
              {trustScore.toString().padStart(2, '0')}
            </span>
            <span className="text-zinc-500 font-mono text-sm font-semibold">/100</span>
          </div>
        </div>
      </div>

      {/* Grade and Verdict Badges */}
      <div className="mt-4 flex items-center gap-2 z-10">
        <span
          className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase border ${colors.badgeBg}`}
        >
          Grade {grade}
        </span>
        <span
          className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
            verdict === 'safe'
              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
              : verdict === 'suspicious'
              ? 'bg-amber-950/70 text-amber-400 border-amber-500/40'
              : 'bg-rose-950/70 text-rose-400 border-rose-500/40'
          }`}
        >
          {verdict}
        </span>
      </div>

      {/* Hard Override Hazard Banner */}
      {overrideActive && (
        <div className="mt-3.5 w-full p-2.5 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-start gap-2 text-rose-300 text-[11px] leading-tight z-10 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold uppercase tracking-wider text-rose-400">
              Hard Override Active:
            </span>{' '}
            <span>{scan.overrideReason}</span>
          </div>
        </div>
      )}

      {/* Risk formula modal */}
      <RiskFormulaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        scan={scan}
      />
    </div>
  );
};

