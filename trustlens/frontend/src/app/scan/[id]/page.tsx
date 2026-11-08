'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../lib/api/client';
import { ScanResult } from '../../../lib/types/scan';
import { TrustGauge } from '../../../components/results/TrustGauge';
import { CertChainViewer } from '../../../components/certificate/CertChainViewer';
import { VisualImpersonationCard } from '../../../components/phishing/VisualImpersonationCard';
import { HygieneGrid } from '../../../components/security/HygieneGrid';
import { ThreatGraph } from '../../../components/community/ThreatGraph';
import { EvidenceBreakdown } from '../../../components/findings/EvidenceBreakdown';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { formatDate, truncateHash } from '../../../lib/utils/formatters';
import { Globe, Download, Printer, Shield, Cpu, Eye, Lock, Network, Layers, Copy, Check } from 'lucide-react';

export default function ScanReportPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || 'scan-sbi-phish';

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('evidence');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1. Try live scan result stored in sessionStorage by useScan hook
    try {
      const cached = sessionStorage.getItem(`scan:${id}`);
      if (cached) {
        const parsed = JSON.parse(cached) as ScanResult;
        if (mounted) setScan(parsed);
        return () => { mounted = false; };
      }
    } catch {
      // sessionStorage unavailable or JSON corrupt — fall through to mock
    }

    // 2. Fall back to mock/demo data (demo cards, offline mode)
    apiClient.getScan(id).then((res) => {
      if (mounted) setScan(res);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!scan) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-zinc-400">Loading Deep Threat Dossier...</p>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens-scan-${scan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'evidence', label: 'Evidence Ledger', icon: <Layers className="w-4 h-4" />, badge: scan.evidence.length },
    { id: 'crypto', label: 'Certificate Chain & Fermat', icon: <Cpu className="w-4 h-4" /> },
    { id: 'phishing', label: 'Brand & Visual Impersonation', icon: <Eye className="w-4 h-4" /> },
    { id: 'hygiene', label: 'Web Hygiene', icon: <Lock className="w-4 h-4" /> },
    { id: 'intel', label: 'Threat Graph & ASN', icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Sticky Top Bar */}
      <div className="p-4 sm:p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-zinc-100 font-mono break-all">
              {scan.targetUrl}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span>Resolving IP: <strong className="text-zinc-200">{scan.ipAddress}</strong></span>
            <span>&bull;</span>
            <span>ASN: <strong className="text-zinc-200">{scan.asn}</strong></span>
            <span>&bull;</span>
            <span>Scanned: {formatDate(scan.scannedAt)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={handleCopyLink}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </Button>

          <Button size="sm" variant="outline" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </Button>

          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </Button>
        </div>
      </div>

      {/* Top Grid: TrustGauge + Quick Verdict + Visual Impersonation preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trust Gauge (4 Cols) */}
        <div className="lg:col-span-4">
          <TrustGauge scan={scan} />
        </div>

        {/* Quick Verdict Summary (8 Cols) */}
        <div className="lg:col-span-8 p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Consensus Security Assessment
              </span>
              <span
                className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                  scan.verdict === 'safe'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                    : scan.verdict === 'suspicious'
                    ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                    : 'bg-rose-950 text-rose-400 border-rose-500/40'
                }`}
              >
                Verdict: {scan.verdict}
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100">
              {scan.verdict === 'malicious'
                ? 'High-Risk Threat Identified: Immediate Block Recommended'
                : scan.verdict === 'suspicious'
                ? 'Security Anomalies Detected: Heightened Inspection Required'
                : 'Pristine Security Posture: Fully Validated'}
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {scan.overrideActive
                ? scan.overrideReason
                : 'Multi-signal evaluation completed with zero critical overrides. All cryptographic certificates, DOM form targets, and passive HTTP security headers conform to strict zero-trust baselines.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-800/80 font-mono text-xs">
            <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">Root CA Trust</span>
              <span className={`font-semibold ${scan.certificate.ccadbDistrusted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {scan.certificate.ccadbDistrusted ? 'DISTRUSTED' : 'VALIDATED'}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">Fermat Sieve</span>
              <span className={`font-semibold ${scan.certificate.fermatFactorable ? 'text-rose-400' : 'text-emerald-400'}`}>
                {scan.certificate.fermatFactorable ? 'VULNERABLE' : 'SECURE'}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">Brand Impersonation</span>
              <span className={`font-semibold ${scan.phishing.visualImpersonation.detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {scan.phishing.visualImpersonation.detected ? 'DETECTED' : 'CLEAN'}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">HSTS Enforced</span>
              <span className={`font-semibold ${scan.hygiene.securityHeaders.hsts ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scan.hygiene.securityHeaders.hsts ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Deep Dive Panels */}
      <div className="space-y-4">
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content Panels */}
        {activeTab === 'evidence' && (
          <EvidenceBreakdown evidence={scan.evidence} />
        )}

        {activeTab === 'crypto' && (
          <CertChainViewer certificate={scan.certificate} />
        )}

        {activeTab === 'phishing' && (
          <VisualImpersonationCard phishing={scan.phishing} targetUrl={scan.targetUrl} />
        )}

        {activeTab === 'hygiene' && (
          <HygieneGrid hygiene={scan.hygiene} />
        )}

        {activeTab === 'intel' && (
          <ThreatGraph threatIntel={scan.threatIntel} targetUrl={scan.targetUrl} />
        )}
      </div>
    </div>
  );
}

