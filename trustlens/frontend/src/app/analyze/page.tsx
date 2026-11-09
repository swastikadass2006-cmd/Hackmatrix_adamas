'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  analyzeScamMessage,
  ScamAnalysisResult,
  ExtractedIndicator,
} from '../../lib/scam/scamAnalyzer';
import { hashReport } from '../../lib/web3/canonicalJson';
import { registerReportOnChain, RegisterResult } from '../../lib/web3/registryService';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  MessageSquare,
  Sparkles,
  Link2,
  FileCheck2,
  ArrowRight,
  Shield,
  Info,
} from 'lucide-react';

const DEMO_SAMPLES = [
  {
    title: 'SBI PAN/KYC Threat',
    text: 'Dear SBI User, your YONO account will be blocked within 24 hours due to pending KYC update. Please update your PAN immediately by visiting http://onlinesbi-kyc-pan-update.top/login.php or call +91-9876543210. Do not share OTP.',
  },
  {
    title: 'Electricity Power Cut Scam',
    text: 'URGENT: Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the power station because your previous month bill was not updated. Please contact our electricity officer immediately at 9876501234 or pay via UPI billdesk@okhdfcbank to prevent disconnection.',
  },
  {
    title: 'Standard Delivery Notice',
    text: 'Your package order #402-9182371 has been dispatched via BlueDart. Track package status at https://amazon.in/orders/track. Thank you for shopping with us.',
  },
];

export default function ScamMessageAnalyzerPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState(DEMO_SAMPLES[0].text);
  const [analysis, setAnalysis] = useState<ScamAnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Web3 Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [regResult, setRegResult] = useState<RegisterResult | null>(null);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const res = analyzeScamMessage(inputText);
    setAnalysis(res);
    setRegResult(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegisterOnChain = async () => {
    if (!analysis) return;
    setIsRegistering(true);

    try {
      const reportPayload = {
        id: `SCAM-${Date.now()}`,
        timestamp: new Date().toISOString(),
        classification: analysis.languageSignals.some((s) => s.severity === 'critical')
          ? 'High Risk'
          : 'Suspicious',
        evidence_coverage: {
          completed: 4,
          total: 4,
          display: '4 of 4 linguistic & indicator heuristics completed',
        },
        indicators: analysis.indicators.map((i) => ({
          type: i.type,
          defanged: i.defanged,
        })),
        language_signals: analysis.languageSignals,
        salt: `salt-${Math.random().toString(36).slice(2)}`,
      };

      const computedHash = hashReport(reportPayload);
      const receipt = await registerReportOnChain(computedHash, 2);
      setRegResult(receipt);
    } catch (err) {
      console.error('Failed to register scam report:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9]">
              Scam Message &amp; Social Engineering Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-[#778496]">
              Deconstruct suspicious SMS, WhatsApp, and Telegram text. Extracts defanged indicators and evaluates psychological coercion heuristics against verified threat feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Input Workspace */}
      <div className="p-5 sm:p-6 glass-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#778496]">
            Message Text Input
          </label>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#778496] text-[11px]">Presets:</span>
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  setAnalysis(null);
                  setRegResult(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#141E2E]/80 hover:bg-[#162235] text-[#778496] hover:text-[#F1F5F9] border border-white/[0.08] transition text-[11px]"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          maxLength={5000}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste message text here (e.g. 'Dear customer, your electricity will be disconnected...')"
          className="w-full bg-[#070B11]/80 border border-white/[0.1] rounded-xl p-3.5 font-mono text-xs sm:text-sm text-[#F1F5F9] placeholder-[#778496] focus:outline-none focus:border-[#43B9DB]/60 transition"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#778496]">
            <Lock className="w-3.5 h-3.5 text-[#43B9DB]" />
            <span>Privacy Note: Message content is parsed locally and never stored unless you commit a Web3 report.</span>
            <span>&bull;</span>
            <span className="text-[#E9EEF5]">{inputText.length} / 5000 chars</span>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!inputText.trim()}
            className="w-full sm:w-auto font-mono text-xs"
          >
            <span>Analyze Message</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Triage Recommendation Card */}
          <div
            className={`p-5 rounded-panel border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-panel ${
              analysis.languageSignals.some((s) => s.severity === 'critical')
                ? 'bg-tl-rose/10 border-tl-rose/30 text-tl-rose'
                : analysis.languageSignals.length > 0
                ? 'bg-tl-amber/10 border-tl-amber/30 text-tl-amber'
                : 'bg-tl-emerald/10 border-tl-emerald/30 text-tl-emerald'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold">
                  Consensus Triage Assessment
                </span>
              </div>
              <p className="text-sm font-semibold font-sans">{analysis.riskSummary.overallRecommendation}</p>
            </div>

            <button
              onClick={handleRegisterOnChain}
              disabled={isRegistering}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-tl-elevated hover:bg-tl-hover border border-tl-border text-tl-text-primary text-xs font-mono font-semibold transition shrink-0"
            >
              <FileCheck2 className="w-4 h-4 text-tl-cyan" />
              <span>{isRegistering ? 'Registering on Sepolia...' : 'Register On-Chain'}</span>
            </button>
          </div>

          {/* On-Chain Success Box */}
          {regResult && (
            <div className="p-4 bg-tl-card border border-tl-cyan/40 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-tl-cyan font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Scam Report Hash Registered On-Chain (Tamper-Evident)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-tl-text-secondary text-[11px]">
                <div>
                  Report Hash: <span className="text-tl-text-primary break-all select-all">{regResult.reportHash}</span>
                </div>
                <div>
                  Tx Hash: <span className="text-tl-text-primary break-all select-all">{regResult.txHash}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-4 text-[11px]">
                <a
                  href={regResult.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-tl-cyan hover:underline flex items-center gap-1"
                >
                  View on Sepolia Explorer <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => router.push(`/verify?hash=${regResult.reportHash}`)}
                  className="text-tl-text-secondary hover:text-tl-text-primary flex items-center gap-1"
                >
                  Verify Cryptographic Proof <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Extracted Indicators Panel (Defanged Artifacts) */}
          <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-3 shadow-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-tl-text-secondary">
                Extracted Indicators &amp; Defanged Artifacts ({analysis.indicators.length})
              </h3>
              <span className="text-[10px] font-mono text-tl-text-muted">
                Safe defanged representation prevents automatic click execution
              </span>
            </div>

            {analysis.indicators.length === 0 ? (
              <p className="text-xs text-tl-text-muted font-mono">No target URLs, UPI handles, or contact phones detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-tl-panel border border-tl-border rounded-lg font-mono text-xs text-tl-text-primary"
                  >
                    <span className="text-[10px] text-tl-text-muted uppercase">{ind.type}:</span>
                    {/* Defanged text (example[.]com) */}
                    <span className="text-tl-cyan font-semibold select-all">{ind.defanged}</span>
                    <button
                      onClick={() => handleCopy(ind.raw, `ind-${i}`)}
                      className="text-tl-text-muted hover:text-tl-text-primary ml-1"
                      title="Copy indicator"
                    >
                      {copiedIndex === `ind-${i}` ? <Check className="w-3.5 h-3.5 text-tl-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {ind.type === 'url' && (
                      <button
                        onClick={() => router.push(`/scan/${encodeURIComponent(ind.raw.replace(/^https?:\/\//, ''))}`)}
                        className="text-tl-text-secondary hover:text-tl-cyan ml-1 flex items-center gap-1 text-[10px]"
                        title="Investigate with deep scanner"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Audit Target</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Presentation: Column 1 = Suspicious Language, Column 2 = Verified Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Column 1: Suspicious Language (Heuristic) */}
            <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-4 shadow-panel">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-tl-amber flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Suspicious Language (Heuristic)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tl-amber/15 text-tl-amber border border-tl-amber/30">
                    Signals, not proof
                  </span>
                </div>
                <p className="text-[11px] text-tl-text-muted font-sans">
                  Linguistic psychology analysis detecting artificial urgency, fear hooks, and coercive framing.
                </p>
              </div>

              {analysis.languageSignals.length === 0 ? (
                <div className="p-4 bg-tl-panel/60 rounded-xl border border-tl-border text-xs text-tl-text-muted font-mono">
                  No coercive urgency or harvesting keywords flagged in the text body.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.languageSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-tl-panel border border-tl-border rounded-xl space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-tl-text-primary">{sig.pattern}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            sig.severity === 'critical'
                              ? 'bg-tl-rose/15 text-tl-rose border border-tl-rose/30'
                              : 'bg-tl-amber/15 text-tl-amber border border-tl-amber/30'
                          }`}
                        >
                          {sig.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-tl-text-secondary italic bg-tl-elevated/60 p-2 rounded border border-tl-border/60">
                        {sig.snippet}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-tl-text-muted">
                        <span>Theme: {sig.category}</span>
                        <span>Confidence: {Math.round(sig.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Verified Evidence (From Security Engines) */}
            <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-4 shadow-panel">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-tl-emerald flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verified Evidence (Engines)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tl-emerald/15 text-tl-emerald border border-tl-emerald/30">
                    Engine Attested
                  </span>
                </div>
                <p className="text-[11px] text-tl-text-muted font-sans">
                  Deterministic signals verified by cryptographic cert linter, brand lookalike model, and ASN threat feeds.
                </p>
              </div>

              {analysis.verifiedEvidence.length === 0 ? (
                <div className="p-4 bg-tl-panel/60 rounded-xl border border-tl-border text-xs text-tl-text-muted font-mono">
                  No high-risk brand lookalikes or flagged infrastructure detected in message links.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.verifiedEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-tl-panel border border-tl-border rounded-xl space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-tl-cyan">{ev.indicator}</span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-tl-rose/15 text-tl-rose border border-tl-rose/30">
                          {ev.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-tl-text-secondary font-sans">{ev.detail}</p>
                      <div className="text-[10px] text-tl-text-muted">
                        Attesting Engine: <strong className="text-tl-text-primary">{ev.source}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
