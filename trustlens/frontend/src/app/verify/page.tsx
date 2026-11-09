'use client';

import React, { useState, useEffect } from 'react';
import { canonicalizeJson, hashReport } from '../../lib/web3/canonicalJson';
import { verifyReportHash, OnChainVerificationResult } from '../../lib/web3/registryService';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  ShieldX,
  FileSearch,
  Upload,
  CheckCircle2,
  ExternalLink,
  Cpu,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';

const GENESIS_SAMPLE_REPORT = {
  id: 'TL-2026-TEST01',
  timestamp: '2026-11-08T12:00:00Z',
  target: 'https://secure-login-hdfc.phish-alert.top',
  classification: 'High Risk',
  evidence_coverage: {
    completed: 7,
    total: 8,
    display: '7 of 8 checks completed',
  },
  findings: [
    {
      id: 'AI-001',
      signal: 'Domain Typosquatting',
      severity: 'high',
      source: 'Lexical Model',
    },
  ],
  limitations: ['OCSP endpoint unreachable'],
  salt: 'a9f182c4-0000-4b6e-9271-trustlens',
};

export default function IndependentVerificationPage() {
  const [inputJson, setInputJson] = useState(
    JSON.stringify(GENESIS_SAMPLE_REPORT, null, 2)
  );
  const [recomputedHash, setRecomputedHash] = useState<string>('');
  const [canonicalString, setCanonicalString] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<OnChainVerificationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Automatically compute hash when JSON changes
  const evaluateHash = (jsonStr: string) => {
    try {
      setParseError(null);
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      const canon = canonicalizeJson(parsed);
      const hash = hashReport(parsed);
      setCanonicalString(canon);
      setRecomputedHash(hash);
      return hash;
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON format');
      setRecomputedHash('');
      setCanonicalString('');
      return null;
    }
  };

  const handleVerify = async (hashToVerify?: string) => {
    const targetHash = hashToVerify || recomputedHash || evaluateHash(inputJson);
    if (!targetHash) return;

    setIsVerifying(true);
    try {
      const res = await verifyReportHash(targetHash);
      setVerificationResult(res);
    } catch (err) {
      console.error('Verification query failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Safe client-only URL parameter reading (avoids Next.js useSearchParams static bailout)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hashParam = params.get('hash');
      if (hashParam) {
        handleVerify(hashParam);
      } else {
        evaluateHash(inputJson);
      }
    }
  }, []);

  // Demo Actions
  const handleLoadSample = () => {
    const sampleStr = JSON.stringify(GENESIS_SAMPLE_REPORT, null, 2);
    setInputJson(sampleStr);
    const h = evaluateHash(sampleStr);
    if (h) handleVerify(h);
  };

  const handleTamperReport = () => {
    try {
      const parsed = JSON.parse(inputJson);
      parsed.classification =
        parsed.classification === 'High Risk' ? 'Suspicious' : 'High Risk';
      const modifiedStr = JSON.stringify(parsed, null, 2);
      setInputJson(modifiedStr);
      const h = evaluateHash(modifiedStr);
      if (h) handleVerify(h);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputJson(content);
        const h = evaluateHash(content);
        if (h) handleVerify(h);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Independent Web3 Report Verifier
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl font-sans leading-relaxed">
          Verify digital trust reports completely independently in your browser.
          The client recomputes the exact RFC 8785 canonical Keccak-256 hash locally (no backend involvement)
          and audits the public Ethereum smart contract registry.
        </p>
      </div>

      {/* Control Buttons & Demo Presets */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-500 font-sans">Live Pitch Presets:</span>
          <Button size="sm" variant="secondary" onClick={handleLoadSample}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Load Untouched Report (Match)
          </Button>

          <Button size="sm" variant="outline" onClick={handleTamperReport}>
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" />
            Tamper Report (Mismatch)
          </Button>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload JSON File</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
              />
          </label>
        </div>
      </div>

      {/* Main Grid: Code Input & Web3 Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: JSON Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              1. Raw Report Payload
            </h2>
            <span className="text-xs text-zinc-500 font-sans">RFC 8785 Canonicalizer</span>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              evaluateHash(e.target.value);
            }}
            rows={16}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none leading-relaxed"
            placeholder="Paste raw JSON report here..."
            />

          {parseError && (
      <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-400 flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 shrink-0" />
        <span>{parseError}</span>
      </div>
    )}

          {canonicalString && (
      <div className="space-y-1.5">
        <span className="text-xs text-zinc-500">RFC 8785 Canonical Byte String:</span>
        <pre className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all">
          {canonicalString}
        </pre>
      </div>
    )}
        </div>

        {/* Right Column: Keccak-256 & Smart Contract Verification */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. On-Chain Cryptographic Audit
            </h2>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
            <div>
              <span className="text-xs text-zinc-400 block mb-1">Recomputed Keccak-256 Digest:</span>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-emerald-400 font-mono break-all min-h-[42px] flex items-center">
                {recomputedHash || <span className="text-zinc-600 font-sans italic">Awaiting valid JSON input...</span>}
              </div>
            </div>

            <Button
              onClick={() => handleVerify()}
              disabled={isVerifying || !recomputedHash}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold py-2 text-xs transition-colors"
              >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Auditing Smart Contract Registry...
                </span>
              ) : (
                'Audit Smart Contract Registry'
              )}
            </Button>
          </div>

          {/* Result Card */}
          {verificationResult && (
      <div
        className={`p-5 rounded-xl border space-y-4 transition-all ${
          verificationResult.verified
          ? 'bg-emerald-950/20 border-emerald-800/60'
          : 'bg-rose-950/20 border-rose-900/60'
        }`}
        >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {verificationResult.verified ? (
          <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
        ) : (
          <div className="p-2 bg-rose-500/10 rounded-full border border-rose-500/20">
            <ShieldX className="w-6 h-6 text-rose-400" />
          </div>
        )}

            <div>
              <h3
                className={`text-sm font-bold ${
                  verificationResult.verified ? 'text-emerald-300' : 'text-rose-300'
                }`}
                >
                {verificationResult.verified
                  ? 'AUTHENTIC & UNTAMPERED REPORT'
                : 'UNVERIFIED / TAMPERED REPORT'}
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                {verificationResult.verified
                  ? 'The recomputed Keccak-256 hash matches the immutable registry entry.'
                  : 'This document hash has not been anchored to the public registry or has been modified.'}
              </p>
            </div>
          </div>
        </div>

        {verificationResult.verified && (
          <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-zinc-500 text-[11px] block">Registrar Address</span>
              <span className="text-zinc-300 font-mono text-[11px] truncate block">
                {verificationResult.reporter || '0x...'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Block Timestamp</span>
              <span className="text-zinc-300 text-[11px] block">
                {verificationResult.timestamp
                  ? new Date(Number(verificationResult.timestamp) * 1000).toUTCString()
                : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    )}
        </div>
      </div>
    </div>
  );
}
