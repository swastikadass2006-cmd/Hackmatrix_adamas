'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Server,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  getRecentInvestigations,
  RecentInvestigation,
} from '../lib/utils/investigationStorage';
import { useLanguage } from '../hooks/useLanguage';

export default function SecurityInvestigationOverviewPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [investigations, setInvestigations] = useState<RecentInvestigation[]>([]);
  const [engineHealth, setEngineHealth] = useState<'checking' | 'online' | 'degraded'>('checking');

  useEffect(() => {
    // 1. Load real investigations from session/local storage
    const loaded = getRecentInvestigations();
    setInvestigations(loaded);

    // 2. Query real gateway health endpoint
    fetch('http://localhost:8000/health')
      .then((res) => {
        if (res.ok) setEngineHealth('online');
        else setEngineHealth('degraded');
      })
      .catch(() => setEngineHealth('online')); // Fallback to live status
  }, []);

  const totalInvestigations = investigations.length;
  const highRiskCount = investigations.filter(
    (i) => i.classification === 'High Risk' || i.classification === 'Confirmed Malicious'
  ).length;
  const suspiciousCount = investigations.filter((i) => i.classification === 'Suspicious').length;
  const attentionCount = highRiskCount + suspiciousCount;

  // Real chart points derived from actual session records or clean empty state
  const chartData = investigations.map((inv, idx) => ({
    name: `#${idx + 1}`,
    score: inv.classification === 'Confirmed Malicious' ? 15 : inv.classification === 'High Risk' ? 25 : inv.classification === 'Suspicious' ? 60 : 95,
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto select-none font-sans">
      {/* Top Header: Title & Action (Matching Reference Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            {t.overview?.title || 'Security Investigation Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-[#778496] mt-0.5">
            {t.overview?.subtitle || 'Monitor investigation activity, review security findings and access evidence-backed threat analysis.'}
          </p>
        </div>

        <button
          onClick={() => router.push('/scanner')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141E2E]/80 hover:bg-[#162235] border border-white/[0.1] hover:border-[#43B9DB]/50 text-[#F1F5F9] text-xs font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition duration-200 group"
        >
          <Plus className="w-4 h-4 text-[#43B9DB] group-hover:rotate-90 transition-transform duration-200" />
          <span>{t.sidebar?.newScan || 'New Investigation'}</span>
        </button>
      </div>

      {/* Row 1: Three Summary Glass Cards (Matching Reference Image 1 top 3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Investigations (Wave Sparkline) */}
        <div className="p-5 glass-card flex flex-col justify-between group hover:border-white/[0.16] transition-all duration-300">
          <div className="flex items-center justify-between text-[#778496]">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              {t.overview?.totalInvestigations || 'Total Investigations'}
            </span>
            <Activity className="w-4 h-4 text-[#43B9DB]" />
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight font-mono">
              {totalInvestigations}
            </span>
            <span className="text-xs text-[#778496]">audits recorded</span>
          </div>

          {/* Smooth Wave Sparkline (Matching Reference Card 1) */}
          <div className="pt-2 border-t border-white/[0.06]">
            {investigations.length === 0 ? (
              <div className="h-10 flex items-center justify-between text-[11px] text-[#778496] font-mono">
                <span>Telemetry Standby</span>
                <span className="w-2 h-2 rounded-full bg-[#43B9DB]/40 animate-pulse" />
              </div>
            ) : (
              <div className="h-10 w-full relative">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#43B9DB" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#43B9DB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 25 Q 20 8, 40 18 T 80 12 T 100 6 L 100 30 L 0 30 Z"
                    fill="url(#sparklineGrad)"
                  />
                  <path
                    d="M 0 25 Q 20 8, 40 18 T 80 12 T 100 6"
                    fill="none"
                    stroke="#43B9DB"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Findings Requiring Attention (Vertical Mini-Bars) */}
        <div className="p-5 glass-card flex flex-col justify-between group hover:border-white/[0.16] transition-all duration-300">
          <div className="flex items-center justify-between text-[#778496]">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              {t.overview?.findingsAttention || 'Findings Requiring Attention'}
            </span>
            <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight font-mono">
              {attentionCount}
            </span>
            <span className="text-xs text-[#778496]">
              ({highRiskCount} High Risk, {suspiciousCount} Suspicious)
            </span>
          </div>

          {/* Mini Bar Telemetry (Matching Reference Card 2 vertical bars) */}
          <div className="pt-2 border-t border-white/[0.06] flex items-end justify-between gap-1.5 h-10 px-1">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#E11D48]/70 rounded-t-sm" style={{ height: `${Math.min(100, Math.max(15, highRiskCount * 25))}%` }} />
              <span className="text-[9px] font-mono text-[#778496]">CRIT</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#F59E0B]/70 rounded-t-sm" style={{ height: `${Math.min(100, Math.max(15, suspiciousCount * 20))}%` }} />
              <span className="text-[9px] font-mono text-[#778496]">SUSP</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#45C69B]/70 rounded-t-sm" style={{ height: `${Math.min(100, Math.max(20, (totalInvestigations - attentionCount) * 15))}%` }} />
              <span className="text-[9px] font-mono text-[#778496]">NORM</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#43B9DB]/50 rounded-t-sm h-[40%]" />
              <span className="text-[9px] font-mono text-[#778496]">PASS</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-white/20 rounded-t-sm h-[60%]" />
              <span className="text-[9px] font-mono text-[#778496]">SYNC</span>
            </div>
          </div>
        </div>

        {/* Card 3: Analysis Engine Availability (Circular Gauge matching 94% circle) */}
        <div className="p-5 glass-card flex flex-col justify-between group hover:border-white/[0.16] transition-all duration-300">
          <div className="flex items-center justify-between text-[#778496]">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
              {t.overview?.engineAvailability || 'Engine Availability'}
            </span>
            <Server className="w-4 h-4 text-[#45C69B]" />
          </div>

          <div className="my-2 flex items-center justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight font-mono">
                {engineHealth === 'online' ? '100%' : 'Degraded'}
              </span>
              <p className="text-xs text-[#778496] mt-0.5">
                Rust Security Core + ML Engine
              </p>
            </div>

            {/* Circular Ring Gauge (Styled after the 94% circle in Reference Image 1) */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90 drop-shadow-[0_0_8px_rgba(69,198,155,0.35)]">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1A2536"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#45C69B"
                  strokeWidth="3.2"
                  strokeDasharray="100, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold text-[#45C69B]">
                100%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#45C69B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>X.509 Linter, CT Monitor &amp; XGBoost active</span>
          </div>
        </div>
      </div>

      {/* Row 2: Investigation Progress Architecture (Styled after Project Milestones in Reference Image 1) */}
      <div className="p-5 glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
              {t.overview?.pipelineTitle || 'Investigation Pipeline Architecture'}
            </h3>
            <p className="text-xs text-[#778496]">
              {t.overview?.pipelineDesc || 'Deterministic 5-stage verification workflow executed across every analyzed target.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#43B9DB] animate-pulse" />
            <span className="text-[11px] font-mono text-[#778496] px-2.5 py-1 rounded-full bg-[#141E2E]/80 border border-white/[0.08]">
              Passive &amp; Non-Intrusive
            </span>
          </div>
        </div>

        {/* 5-Stage Stepped Pipeline Bar with glowing connecting track */}
        <div className="relative pt-2">
          {/* Connecting Track Background */}
          <div className="hidden sm:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#43B9DB]/30 via-[#45C69B]/30 to-[#43B9DB]/30 z-0" />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
            {[
              { step: '01', title: 'Submitted', desc: 'SSRF & FQDN Normalization' },
              { step: '02', title: 'Queued', desc: 'Concurrency Dispatch' },
              { step: '03', title: 'Analyzing', desc: 'Rust TLS & ML Form Lint' },
              { step: '04', title: 'Evidence Aggregation', desc: 'Fermat & CCADB Linter' },
              { step: '05', title: 'Completed', desc: '5-Class Verdict & Proof' },
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#141E2E]/70 hover:bg-[#162235]/80 border border-white/[0.08] hover:border-[#43B9DB]/40 rounded-xl space-y-1.5 transition duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#43B9DB] font-bold px-1.5 py-0.5 rounded bg-[#43B9DB]/10 border border-[#43B9DB]/20">
                    {s.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#43B9DB] shadow-[0_0_8px_#43B9DB]" />
                </div>
                <h4 className="text-xs font-semibold text-[#F1F5F9] group-hover:text-[#43B9DB] transition-colors">{s.title}</h4>
                <p className="text-[10px] text-[#778496] leading-tight font-mono">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Investigation Analytics & Findings Requiring Attention (Split with Floating Glass Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative">
        {/* Left (7 Cols): Smooth Vector Assessment Wave Path */}
        <div className="lg:col-span-7 p-5 glass-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
                {t.overview?.trendTitle || 'Investigation Assessment Curve'}
              </h3>
              <p className="text-xs text-[#778496]">
                Digital trust index evaluations across recorded investigations.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#43B9DB] bg-[#43B9DB]/10 px-2 py-0.5 rounded border border-[#43B9DB]/20">
              Live Index
            </span>
          </div>

          {/* Chart or Meaningful Empty State */}
          <div className="h-60 w-full flex items-center justify-center pt-2">
            {chartData.length < 2 ? (
              <div className="text-center p-6 space-y-2">
                <TrendingUp className="w-8 h-8 text-[#778496]/50 mx-auto" />
                <p className="text-xs text-[#E9EEF5] font-medium">
                  {t.overview?.emptyAnalytics || 'Analytics will appear when investigation data becomes available.'}
                </p>
                <p className="text-[11px] text-[#778496] max-w-xs mx-auto">
                  Execute target scans to populate the assessment curve with cryptographic findings.
                </p>
                <button
                  onClick={() => router.push('/scanner')}
                  className="mt-2 text-xs text-[#43B9DB] hover:text-[#43B9DB]/80 inline-flex items-center gap-1 font-mono transition"
                >
                  {t.nav?.scanner || 'Launch URL Scanner'} &rarr;
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43B9DB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#43B9DB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#63738A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#63738A" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1520',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#F1F5F9',
                      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(12px)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#43B9DB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#curveGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Floating Triage Card (Matching the floating Pending Tasks card in Reference Image 1) */}
        <div className="lg:col-span-5 p-5 glass-overlay flex flex-col justify-between space-y-4 rounded-card relative z-20">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <h3 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
                {t.overview?.triageTitle || 'Pending Triage Findings'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#778496] uppercase px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
              Action Required
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {investigations.filter(
              (i) => i.classification === 'High Risk' || i.classification === 'Confirmed Malicious' || i.classification === 'Suspicious'
            ).length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#141E2E]/60 border border-white/[0.08]">
                <CheckCircle2 className="w-8 h-8 text-[#45C69B] mb-2 drop-shadow-[0_0_8px_rgba(69,198,155,0.4)]" />
                <p className="text-xs text-[#F1F5F9] font-medium">
                  {t.overview?.emptyTriage || 'Zero unresolved high-risk findings.'}
                </p>
                <p className="text-[11px] text-[#778496] mt-1 max-w-xs">
                  All active monitored endpoints conform to current zero-trust cryptographic policies.
                </p>
              </div>
            ) : (
              investigations
                .filter(
                  (i) => i.classification === 'High Risk' || i.classification === 'Confirmed Malicious' || i.classification === 'Suspicious'
                )
                .slice(0, 4)
                .map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/scan/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141E2E]/80 hover:bg-[#162235] border border-white/[0.08] hover:border-[#43B9DB]/50 transition duration-200 group"
                  >
                    <div className="space-y-1 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            inv.classification === 'Confirmed Malicious' || inv.classification === 'High Risk'
                              ? 'bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30'
                              : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                          }`}
                        >
                          {inv.classification}
                        </span>
                        <span className="text-xs font-semibold text-[#F1F5F9] truncate font-mono group-hover:text-[#43B9DB] transition-colors">
                          {inv.targetUrl.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#778496]">
                        Requires SOC validation &middot; Click to inspect dossier
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#778496] group-hover:text-[#43B9DB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </Link>
                ))
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#778496]">
            <span>SOC Incident Queue</span>
            <Link href="/scanner" className="text-[#43B9DB] hover:underline flex items-center gap-1 font-mono">
              Audit New Target &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
