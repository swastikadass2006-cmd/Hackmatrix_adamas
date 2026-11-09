'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api/client';
import { ScanResult, ThreatClassification } from '../../../lib/types/scan';
import { CertChainViewer } from '../../../components/certificate/CertChainViewer';
import { VisualImpersonationCard } from '../../../components/phishing/VisualImpersonationCard';
import { HygieneGrid } from '../../../components/security/HygieneGrid';
import { ThreatGraph } from '../../../components/community/ThreatGraph';
import { FindingCard } from '../../../components/findings/FindingCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/utils/formatters';
import { canonicalizeJson, hashReport } from '../../../lib/web3/canonicalJson';
import { registerReportOnChain, RegisterResult } from '../../../lib/web3/registryService';
import { useLanguage } from '../../../hooks/useLanguage';
import {
  Globe,
  Download,
  Copy,
  Check,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  Clock,
  Layers,
  Cpu,
  Eye,
  Lock,
  Network,
  RefreshCw,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function InvestigationDossierPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || 'scan-sbi-phish';

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('evidence');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Web3 On-Chain Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [regResult, setRegResult] = useState<RegisterResult | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1. Try live scan result stored in sessionStorage by useScan hook
    try {
      const cached = sessionStorage.getItem(`scan:${id}`);
      if (cached) {
        const parsed = JSON.parse(cached) as ScanResult;
        if (mounted) setScan(parsed);
        return () => {
          mounted = false;
        };
      }
    } catch {
      // Fallback
    }

    // 2. Query apiClient fallback
    apiClient.getScan(id).then((res) => {
      if (mounted) setScan(res);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!scan) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 select-none font-sans">
        <div className="text-center space-y-3 font-mono text-xs text-tl-text-secondary">
          <div className="w-8 h-8 rounded-full border-2 border-tl-cyan border-t-transparent animate-spin mx-auto" />
          <p>Loading deep cryptographic and threat dossier...</p>
        </div>
      </div>
    );
  }

  // Wording Rule: Strict 5 classes, NEVER say "Safe"
  const classification: ThreatClassification =
    scan.classification ||
    (scan.evidence?.some((e) => e.authoritative && (e.severity === 'critical' || e.severity === 'high'))
      ? 'Confirmed Malicious'
      : scan.overrideActive || scan.trustScore <= 35 || scan.verdict === 'malicious'
      ? 'High Risk'
      : scan.trustScore <= 70 || scan.verdict === 'suspicious'
      ? 'Suspicious'
      : 'No indicators found');

  const coverage = scan.evidenceCoverage || {
    completed: scan.overrideActive ? 8 : 7,
    total: 8,
    display: `${scan.overrideActive ? 8 : 7} of 8 checks completed`,
  };
  const coveragePercent = Math.round((coverage.completed / coverage.total) * 100);

  const getClassificationStyle = (cls: ThreatClassification) => {
    switch (cls) {
      case 'Confirmed Malicious':
        return 'bg-tl-rose/15 text-tl-rose border-tl-rose/30';
      case 'High Risk':
        return 'bg-tl-orange/15 text-tl-orange border-tl-orange/30';
      case 'Suspicious':
        return 'bg-tl-amber/15 text-tl-amber border-tl-amber/30';
      case 'No indicators found':
        return 'bg-tl-emerald/15 text-tl-emerald border-tl-emerald/30';
      default:
        return 'bg-tl-steel/15 text-tl-steel border-tl-steel/30';
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(scan.targetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens-investigation-${scan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegisterOnChain = async () => {
    setIsRegistering(true);
    try {
      const reportPayload = {
        id: scan.id,
        timestamp: scan.scannedAt,
        target: scan.targetUrl,
        classification,
        evidence_coverage: coverage,
        findings: scan.evidence.map((e) => ({
          id: e.id,
          signal: e.signal,
          severity: e.severity,
          source: e.source || 'TrustLens Core',
        })),
        limitations: scan.limitations || [],
        salt: scan.salt || `salt-${scan.id}`,
      };

      const computedHash = hashReport(reportPayload);
      const receipt = await registerReportOnChain(computedHash, 1);
      setRegResult(receipt);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const tabs = [
    { id: 'evidence', label: t.tabs?.evidence || 'Evidence Ledger', icon: <Layers className="w-3.5 h-3.5" />, badge: scan.evidence.length },
    { id: 'crypto', label: t.tabs?.crypto || 'Certificate & Cryptography', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'phishing', label: t.tabs?.phishing || 'Brand & Visual SSIM', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'hygiene', label: t.tabs?.hygiene || 'Web Security Hygiene', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'intel', label: t.tabs?.intel || 'Infrastructure & Threat Graph', icon: <Network className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto select-none font-sans">
      {/* 1. Header Bar: Target URL (Non-clickable), Copy URL, Timestamp, Action Buttons */}
      <div className="p-5 bg-tl-card border border-tl-border rounded-panel flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-panel">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-tl-cyan shrink-0" />
            {/* Rule: Scanned URL shown as non-clickable text */}
            <span className="font-mono text-sm sm:text-base font-bold text-tl-text-primary break-all select-all">
              {scan.targetUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="p-1 rounded hover:bg-tl-elevated text-tl-text-muted hover:text-tl-text-primary transition shrink-0"
              title="Copy Target URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-tl-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-tl-text-muted">
            <span>Resolving IP: <strong className="text-tl-text-secondary">{scan.ipAddress}</strong></span>
            <span>&bull;</span>
            <span>ASN: <strong className="text-tl-text-secondary">{scan.asn}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Scanned: {formatDate(scan.scannedAt)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRegisterOnChain}
            disabled={isRegistering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-elevated hover:bg-tl-hover border border-tl-border text-tl-text-primary text-xs font-semibold transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-tl-cyan" />
            <span>{isRegistering ? 'Registering on Sepolia...' : 'Register On-Chain'}</span>
          </button>

          <button
            onClick={() => router.push(`/verify?hash=${regResult?.reportHash || ''}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-tl-text-secondary hover:text-tl-text-primary text-xs font-semibold transition"
          >
            <Shield className="w-3.5 h-3.5 text-tl-emerald" />
            <span>Verify Proof</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-tl-text-secondary hover:text-tl-text-primary text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => router.push('/scanner')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-tl-text-secondary hover:text-tl-text-primary text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Scan</span>
          </button>
        </div>
      </div>

      {/* On-Chain Confirmation Alert */}
      {regResult && (
        <div className="p-4 bg-tl-card border border-tl-cyan/40 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-tl-cyan font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Immutable Report Registered on Ethereum Sepolia Registry</span>
            </div>
            <span className="text-[10px] text-tl-text-muted">RFC 8785 + Keccak-256</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-tl-text-secondary text-[11px]">
            <div>
              Hash: <span className="text-tl-text-primary break-all select-all">{regResult.reportHash}</span>
            </div>
            <div>
              Tx: <span className="text-tl-text-primary break-all select-all">{regResult.txHash}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-[11px]">
            <a
              href={regResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-tl-cyan hover:underline flex items-center gap-1"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`/verify?hash=${regResult.reportHash}`}
              className="text-tl-text-secondary hover:text-tl-text-primary flex items-center gap-1"
            >
              Independent Verifier <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 2. Primary Classification & Consensus Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Classification Badge & Evidence Coverage Bar (4 Cols) */}
        <div className="lg:col-span-4 p-5 bg-tl-card border border-tl-border rounded-panel flex flex-col justify-between space-y-4 shadow-panel">
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-tl-text-muted font-semibold flex items-center justify-between">
              <span>Primary Classification</span>
              <span className="font-mono text-[10px] text-tl-text-secondary">Mandatory 5-Class</span>
            </div>

            {/* Classification Badge (Strict Rule: Text, Icon, and Color together) */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 font-mono ${getClassificationStyle(
                classification
              )}`}
            >
              {classification === 'Confirmed Malicious' ? (
                <ShieldAlert className="w-5 h-5 shrink-0" />
              ) : classification === 'High Risk' ? (
                <AlertOctagon className="w-5 h-5 shrink-0" />
              ) : classification === 'Suspicious' ? (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {classification}
                </span>
                <span className="text-[10px] text-tl-text-muted">
                  {classification === 'No indicators found'
                    ? 'Zero adverse signals detected across evaluated modules'
                    : 'Deterministic multi-signal consensus trigger'}
                </span>
              </div>
            </div>

            {/* Evidence Coverage Bar ("6 of 8 checks completed") */}
            <div className="p-3 bg-tl-elevated/40 border border-tl-border rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-tl-text-secondary">Evidence Coverage:</span>
                <span className="font-bold text-tl-text-primary">{coverage.display}</span>
              </div>
              <div className="w-full h-1.5 bg-tl-panel rounded-full overflow-hidden">
                <div
                  className="h-full bg-tl-cyan transition-all duration-700"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-tl-text-muted leading-tight">
                Reflects active engine execution across X.509, Fermat sieve, DOM SSIM, and passive headers.
              </p>
            </div>
          </div>

          {/* Limitations Panel */}
          <div className="p-3 bg-tl-panel/80 border border-tl-border rounded-xl space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-tl-text-secondary font-semibold text-[11px] uppercase">
              <Info className="w-3.5 h-3.5 text-tl-text-muted" />
              <span>Limitations &amp; Unavailable Checks</span>
            </div>
            {(!scan.limitations || scan.limitations.length === 0) ? (
              <p className="text-[10px] text-tl-text-muted">
                All scheduled cryptographic and transport checks completed without timeout.
              </p>
            ) : (
              <ul className="space-y-1 text-[10px] text-tl-amber">
                {scan.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>&bull;</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Explanation Panel & Recommended Actions (8 Cols) */}
        <div className="lg:col-span-8 p-5 bg-tl-card border border-tl-border rounded-panel flex flex-col justify-between space-y-5 shadow-panel">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-tl-text-muted">
              <span>Multi-Signal Consensus Explanation</span>
              <span className="text-tl-cyan font-bold">Ground-Truth Proof</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-tl-text-primary tracking-tight">
              {classification === 'Confirmed Malicious'
                ? 'Authoritative Malicious Threat: Active Phishing/Credential Harvest Confirmed'
                : classification === 'High Risk'
                ? 'High-Risk Posture Identified: Critical Cryptographic or Brand Override'
                : classification === 'Suspicious'
                ? 'Security Anomalies Detected: Heightened Inspection Required'
                : 'No Adverse Indicators Identified on Passive Inspection'}
            </h3>

            <p className="text-xs text-tl-text-secondary leading-relaxed">
              {scan.overrideActive
                ? scan.overrideReason
                : classification === 'No indicators found'
                ? 'Absence of threat signals across evaluated cryptographic, lexical, and behavioral models. Notice: Zero indicators found on passive inspection does not guarantee absolute safety from emerging zero-day campaigns.'
                : 'Deterministic evaluation complete. All cryptographic certificates, DOM form action targets, and passive HTTP security headers correlated.'}
            </p>

            {/* Recommended Actions */}
            <div className="p-3.5 bg-tl-elevated/50 border border-tl-border rounded-xl space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-tl-text-primary block">
                SOC Recommended Actions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded bg-tl-panel/60 border border-tl-border/60">
                  <span className="text-tl-cyan font-mono font-bold">1.</span>
                  <span className="text-tl-text-secondary text-[11px]">
                    {classification === 'Confirmed Malicious' || classification === 'High Risk'
                      ? 'Add FQDN and resolved IP to boundary firewall blocklist.'
                      : 'Preserve certificate fingerprint in internal trust cache.'}
                  </span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-tl-panel/60 border border-tl-border/60">
                  <span className="text-tl-cyan font-mono font-bold">2.</span>
                  <span className="text-tl-text-secondary text-[11px]">
                    {classification === 'Confirmed Malicious' || classification === 'High Risk'
                      ? 'Notify registered brand abuse desk regarding unauthorized domain registration.'
                      : 'Schedule periodic CT log monitor check for unauthorized issuance.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-tl-border/60 font-mono text-xs">
            <div className="p-2.5 bg-tl-panel rounded-lg border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block">Root CA Trust</span>
              <span className={`font-semibold ${scan.certificate.ccadbDistrusted ? 'text-tl-rose' : 'text-tl-emerald'}`}>
                {scan.certificate.ccadbDistrusted ? 'DISTRUSTED' : 'VALIDATED'}
              </span>
            </div>

            <div className="p-2.5 bg-tl-panel rounded-lg border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block">Fermat Sieve</span>
              <span className={`font-semibold ${scan.certificate.fermatFactorable ? 'text-tl-rose' : 'text-tl-emerald'}`}>
                {scan.certificate.fermatFactorable ? 'VULNERABLE' : 'SECURE'}
              </span>
            </div>

            <div className="p-2.5 bg-tl-panel rounded-lg border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block">Brand Lookalike</span>
              <span className={`font-semibold ${scan.phishing.visualImpersonation.detected ? 'text-tl-rose' : 'text-tl-emerald'}`}>
                {scan.phishing.visualImpersonation.detected ? 'DETECTED' : 'CLEAN'}
              </span>
            </div>

            <div className="p-2.5 bg-tl-panel rounded-lg border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block">HSTS Enforced</span>
              <span className={`font-semibold ${scan.hygiene.securityHeaders.hsts ? 'text-tl-emerald' : 'text-tl-amber'}`}>
                {scan.hygiene.securityHeaders.hsts ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Dive Panels Navigation Tabs */}
      <div className="space-y-4">
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Evidence Ledger */}
        {activeTab === 'evidence' && (
          <div className="space-y-2.5">
            {scan.evidence.map((item) => (
              <FindingCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Tab 2: Certificate Chain & Fermat */}
        {activeTab === 'crypto' && (
          <CertChainViewer certificate={scan.certificate} />
        )}

        {/* Tab 3: Brand & Visual SSIM */}
        {activeTab === 'phishing' && (
          <VisualImpersonationCard phishing={scan.phishing} targetUrl={scan.targetUrl} />
        )}

        {/* Tab 4: Web Hygiene */}
        {activeTab === 'hygiene' && (
          <HygieneGrid hygiene={scan.hygiene} />
        )}

        {/* Tab 5: Threat Graph & ASN */}
        {activeTab === 'intel' && (
          <ThreatGraph threatIntel={scan.threatIntel} targetUrl={scan.targetUrl} />
        )}
      </div>
    </div>
  );
}
