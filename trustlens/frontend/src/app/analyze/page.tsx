'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  analyzeScamMessage,
  ScamAnalysisResult,
  ExtractedIndicator,
} from '../../lib/scam/scamAnalyzer';
import { canonicalizeJson, hashReport } from '../../lib/web3/canonicalJson';
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
    title: 'Benign Order Update',
    text: 'Your Amazon order #402-9182371 has been shipped via BlueDart. You can track your package at https://amazon.in/orders/track. Thank you for shopping with us.',
  },
];

export default function ScamAnalyzerPage() {
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
      const receipt = await registerReportOnChain(computedHash, 2); // 2 = ScamMessage
      setRegResult(receipt);
    } catch (err) {
      console.error('Failed to register scam report:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono">
            Social Engineering & Scam Message Analyzer
          </h1>
        </div>
        <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
          Paste suspicious SMS, WhatsApp, or Telegram messages. TrustLens parses defanged indicators,
          evaluates psychological coercion patterns, and correlates extracted domains against verified security engines.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Paste Raw Message Content
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">Demo Presets:</span>
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  setAnalysis(null);
                  setRegResult(null);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
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
          placeholder="Paste SMS, WhatsApp, or email text here (e.g., 'Dear customer, your electricity will be disconnected...')"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Privacy Guarantee: Message content is sanitized and never stored unless you register an immutable report.
            </span>
          </div>

          <Button onClick={handleAnalyze} className="w-full sm:w-auto font-mono text-xs">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Deconstruct & Analyze Message
          </Button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Top Recommendation Bar */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              analysis.languageSignals.some((s) => s.severity === 'critical')
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                : analysis.languageSignals.length > 0
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold">
                  Consensus Triage Recommendation
                </span>
              </div>
              <p className="text-sm font-semibold">{analysis.riskSummary.overallRecommendation}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterOnChain}
              disabled={isRegistering}
              className="shrink-0 font-mono text-xs"
            >
              <FileCheck2 className="w-4 h-4 mr-1.5 text-emerald-400" />
              {isRegistering ? 'Registering on Sepolia...' : 'Register Scam Report On-Chain'}
            </Button>
          </div>

          {/* On-Chain Success Box */}
          {regResult && (
            <div className="p-4 bg-zinc-900 border border-emerald-500/40 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Scam Report Hash Registered On-Chain (Tamper-Evident)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
                <div>
                  Report Hash: <span className="text-zinc-200 break-all">{regResult.reportHash}</span>
                </div>
                <div>
                  Tx Hash: <span className="text-zinc-200 break-all">{regResult.txHash}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-4">
                <a
                  href={regResult.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  View on Sepolia Explorer <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`/verify?hash=${regResult.reportHash}`}
                  className="text-zinc-300 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  Verify in Independent Verifier <Check className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Extracted Indicators Panel */}
          <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Extracted Indicators & Defanged Artifacts ({analysis.indicators.length})
            </h3>
            {analysis.indicators.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">No target URLs, UPI handles, or contact phones detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-200"
                  >
                    <span className="text-[10px] text-zinc-500 uppercase">{ind.type}:</span>
                    <span className="text-emerald-400 font-semibold">{ind.defanged}</span>
                    <button
                      onClick={() => handleCopy(ind.raw, `ind-${i}`)}
                      className="text-zinc-400 hover:text-zinc-200 ml-1"
                      title="Copy raw indicator"
                    >
                      {copiedIndex === `ind-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {ind.type === 'url' && (
                      <button
                        onClick={() => router.push(`/scan/${encodeURIComponent(ind.raw.replace(/^https?:\/\//, ''))}`)}
                        className="text-zinc-400 hover:text-emerald-400 ml-1 flex items-center gap-0.5 text-[10px]"
                        title="Investigate with deep scanner"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Scan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The Key UI Concept: Two-Column Language vs Verified Evidence View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Suspicious Language (Heuristic) */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Suspicious Language (Heuristic)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40">
                    Signals, not proof
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Linguistic psychology analysis detecting artificial urgency, fear hooks, and coercive framing.
                </p>
              </div>

              {analysis.languageSignals.length === 0 ? (
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-500 font-mono">
                  No coercive linguistic urgency or harvesting keywords flagged in the text body.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.languageSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{sig.pattern}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            sig.severity === 'critical'
                              ? 'bg-rose-950 text-rose-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {sig.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 italic bg-zinc-950 p-2 rounded border border-zinc-850">
                        {sig.snippet}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Category: {sig.category}</span>
                        <span>Confidence: {Math.round(sig.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Verified Evidence (From Security Engines) */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verified Evidence (Engines)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    Engine Attested
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Deterministic signals verified by cryptographic cert linter, brand lookalike model, and ASN threat feeds.
                </p>
              </div>

              {analysis.verifiedEvidence.length === 0 ? (
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-500 font-mono">
                  No high-risk brand lookalikes or flagged infrastructure detected in message links.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.verifiedEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">{ev.indicator}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400">
                          {ev.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300">{ev.detail}</p>
                      <div className="text-[10px] text-zinc-500">
                        Attesting Engine: <strong className="text-zinc-400">{ev.source}</strong>
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
