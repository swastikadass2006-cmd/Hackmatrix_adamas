'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

export const dynamic = 'force-dynamic';

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

function VerificationContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get('hash') || '';

  const [inputJson, setInputJson] = useState(
    JSON.stringify(GENESIS_SAMPLE_REPORT, null, 2)
  );
  const [recomputedHash, setRecomputedHash] = useState<string>('');
  const [canonicalString, setCanonicalString] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<OnChainVerificationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

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

  useEffect(() => {
    const target = initialHash || evaluateHash(inputJson);
    if (target) {
      handleVerify(target);
    }
  }, [initialHash]);

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

      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Live Pitch Presets:</span>
          <Button size="sm" variant="secondary" onClick={handleLoadSample}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Load Untouched Report (Match)
          </Button>

          <Button size="sm" variant="outline" onClick={handleTamperReport}>
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" />
            Tamper 1 Character (Mismatch Demo)
          </Button>
        </div>

        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition">
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>Upload JSON</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
            />
        </label>
      </div>

      {verificationResult && (
      <div
        className={`p-6 rounded-2xl border ${
          verificationResult.verified
          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
          : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
        }`}
        >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {verificationResult.verified ? (
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldX className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
        )}
            <div className="space-y-1">
              <h3 className="text-base font-bold">
                {verificationResult.verified
                  ? 'VERIFIED: Report Proven Tamper-Evident & Authentic On-Chain'
                : 'TAMPER ALERT: Report Hash Mismatch or Unregistered'}
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {verificationResult.verified
                  ? `This exact report was cryptographically registered on ${verificationResult.network}. Zero bits have been modified since submission.`
                  : 'The recomputed Keccak-256 hash does not exist in the smart contract registry. Even a single modified punctuation mark or score invalidates the cryptographic proof.'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="shrink-0"
            >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isVerifying ? 'animate-spin' : ''}`}
              />
            Re-Verify Contract
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-zinc-800/80 text-xs">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Registration Status</span>
            <span className={`font-bold ${verificationResult.verified ? 'text-emerald-400' : 'text-rose-400'}`}>
              {verificationResult.verified ? 'VALIDATED ON-CHAIN' : 'NOT FOUND'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Reporter Address</span>
            <span className="text-zinc-300 truncate block">
              {verificationResult.reporter || '—'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">On-Chain Timestamp</span>
            <span className="text-zinc-300 block">
              {verificationResult.timestamp
                ? new Date(verificationResult.timestamp * 1000).toLocaleString()
              : '—'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Registry Contract</span>
            <a
              href={verificationResult.explorerUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 truncate"
              >
              {verificationResult.contractAddress.slice(0, 8)}...{verificationResult.contractAddress.slice(-6)}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    )}

      <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Cryptographic Hash Parity (RFC 8785 + Keccak-256)
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
              <span>Client-Recomputed Hash (Browser Local):</span>
              <span className="text-emerald-400">Pure Local EVM Implementation</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-200 break-all select-all">
              {recomputedHash || 'Awaiting valid JSON...'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
              <span>Smart Contract Verified Hash:</span>
              <span className="text-zinc-400">Ethereum Sepolia / Local Registry</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-200 break-all select-all">
              {verificationResult?.verified
                ? recomputedHash
              : 'No registered match found on-chain'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Report JSON Document
            </label>
            {parseError && (
      <span className="text-[10px] text-rose-400">{parseError}</span>
    )}
          </div>
          <textarea
            rows={14}
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              evaluateHash(e.target.value);
            }}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition"
            />
        </div>

        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Canonical JCS String (RFC 8785)
            </label>
            <span className="text-[10px] text-emerald-400">Deterministic Sort</span>
          </div>
          <textarea
            rows={14}
            readOnly
            value={canonicalString}
            placeholder="Canonical representation will appear here..."
            className="w-full bg-zinc-900/40 border border-zinc-850 rounded-xl p-3 font-mono text-xs text-zinc-400 focus:outline-none select-all"
            />
        </div>
      </div>
    </div>
  );
}

export default function IndependentVerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-mono text-sm">Loading on-chain verifier...</div>}>
      <VerificationContent />
    </Suspense>
  );
}
