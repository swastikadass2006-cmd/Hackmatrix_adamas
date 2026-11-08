'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { ScanResult, ThreatClassification } from '../../lib/types/scan';
import { getScoreColor } from '../../lib/utils/formatters';
import { RiskFormulaModal } from './RiskFormulaModal';

export interface TrustGaugeProps {
  scan: ScanResult;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ scan }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { trustScore, grade, verdict, overrideActive, limitations = [] } = scan;

  // Determine Five-Class designation
  const classification: ThreatClassification =
    scan.classification ||
    (scan.evidence?.some((e) => e.authoritative && (e.severity === 'critical' || e.severity === 'high'))
      ? 'Confirmed Malicious'
      : overrideActive || trustScore <= 35 || verdict === 'malicious'
      ? 'High Risk'
      : trustScore <= 70 || verdict === 'suspicious'
      ? 'Suspicious'
      : scan.evidenceCoverage && scan.evidenceCoverage.completed < scan.evidenceCoverage.total && scan.evidence?.length === 0
      ? 'Inconclusive'
      : 'No indicators found');

  const coverage = scan.evidenceCoverage || {
    completed: overrideActive ? 8 : 7,
    total: 8,
    display: `${overrideActive ? 8 : 7} of 8 checks completed`,
  };

  const coveragePercent = Math.round((coverage.completed / coverage.total) * 100);

  // Configuration for 5 classes
  const classConfig: Record<
    ThreatClassification,
    {
      label: string;
      bg: string;
      text: string;
      border: string;
      icon: React.ReactNode;
      stroke: string;
    }
  > = {
    'No indicators found': {
      label: 'No indicators found',
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      icon: <CheckCircle2 className="w-4 h-4" />,
      stroke: '#10b981',
    },
    Suspicious: {
      label: 'Suspicious',
      bg: 'bg-amber-950/80',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      icon: <AlertTriangle className="w-4 h-4" />,
      stroke: '#f59e0b',
    },
    'High Risk': {
      label: 'High Risk',
      bg: 'bg-orange-950/80',
      text: 'text-orange-400',
      border: 'border-orange-500/40',
      icon: <AlertOctagon className="w-4 h-4" />,
      stroke: '#f97316',
    },
    'Confirmed Malicious': {
      label: 'Confirmed Malicious',
      bg: 'bg-rose-950/90',
      text: 'text-rose-400',
      border: 'border-rose-500/50',
      icon: <XCircle className="w-4 h-4" />,
      stroke: '#f43f5e',
    },
    Inconclusive: {
      label: 'Inconclusive',
      bg: 'bg-zinc-800/80',
      text: 'text-zinc-300',
      border: 'border-zinc-700',
      icon: <QuestionIcon className="w-4 h-4" />,
      stroke: '#71717a',
    },
  };

  const currentClass = classConfig[classification] || classConfig['Suspicious'];

  // Semicircle gauge metrics
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;
  const angle = -180 + (trustScore / 100) * 180;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl overflow-hidden font-mono">
      {/* Background radial glow */}
      <div
        className="absolute w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30 transition-colors"
        style={{ backgroundColor: currentClass.stroke }}
      />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          <span>Threat Classification</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Formula</span>
        </button>
      </div>

      {/* Primary Classification Badge */}
      <div className="w-full mb-4 z-10">
        <div
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border ${currentClass.bg} ${currentClass.border} ${currentClass.text}`}
        >
          {currentClass.icon}
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">
            {currentClass.label}
          </span>
        </div>
      </div>

      {/* SVG Semicircular Gauge for Score Depth */}
      <div className="relative w-60 h-32 flex items-end justify-center z-10">
        <svg viewBox="0 0 220 120" className="w-full h-full overflow-visible">
          {/* Background track */}
          <path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#27272a"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Value stroke */}
          <path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke={currentClass.stroke}
            strokeWidth="14"
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
              x2="50"
              y2="110"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow"
            />
            <circle cx="110" cy="110" r="6" fill="#ffffff" />
            <circle cx="110" cy="110" r="3" fill="#09090b" />
          </g>
        </svg>

        {/* Numeric Score Overlay */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl font-black tracking-tight"
              style={{ color: currentClass.stroke }}
            >
              {trustScore.toString().padStart(2, '0')}
            </span>
            <span className="text-zinc-500 text-xs font-semibold">/100</span>
          </div>
        </div>
      </div>

      {/* Evidence Coverage Bar */}
      <div className="w-full mt-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1.5 z-10">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="text-zinc-500 uppercase">Evidence Coverage</span>
          <span className="text-zinc-200 font-bold">{coverage.display}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              coveragePercent === 100
                ? 'bg-emerald-500'
                : coveragePercent >= 70
                ? 'bg-emerald-400'
                : 'bg-amber-400'
            }`}
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
      </div>

      {/* Limitations and Unavailable Checks Panel */}
      <div className="w-full mt-3 p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1.5 z-10 text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase">
          <Info className="w-3.5 h-3.5 text-zinc-500" />
          <span>Limitations & Unavailable Checks</span>
        </div>
        {limitations.length === 0 ? (
          <p className="text-[10px] text-zinc-500 leading-tight">
            All 8 cryptographic, lexical, and behavioral checks evaluated.
          </p>
        ) : (
          <ul className="space-y-1 text-[10px] text-zinc-400">
            {limitations.map((lim, idx) => (
              <li key={idx} className="flex items-center gap-1 text-amber-400/90">
                <span>&bull;</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hard Override Hazard Banner */}
      {overrideActive && (
        <div className="mt-3 w-full p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2 text-rose-300 text-[11px] leading-tight z-10">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-rose-400">
              Deterministic Hard Override:
            </span>{' '}
            <span>{scan.overrideReason}</span>
          </div>
        </div>
      )}

      {/* Formula modal */}
      <RiskFormulaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        scan={scan}
      />
    </div>
  );
};
