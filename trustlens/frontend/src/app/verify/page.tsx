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
  Lock,
  Cpu,
  RefreshCw,
  AlertOctagon,
  Info,
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
      const hashFromUrl = params.get('hash');
      if (hashFromUrl) {
        evaluateHash(inputJson);
        handleVerify(hashFromUrl);
      } else {
        const hash = evaluateHash(inputJson);
        if (hash) {
          handleVerify(hash);
        }
      }
    }
  }, []);

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
    <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-tl-border/60">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-tl-cyan" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tl-text-primary">
            Independent Web3 Report Verifier
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-tl-text-secondary">
          Audit digital trust reports completely independently in your browser.
          The client recomputes the exact RFC 8785 canonical Keccak-256 hash locally (no backend involvement)
          and verifies the immutable Ethereum smart contract registry.
        </p>
      </div>

      {/* Control Buttons & Demo Presets */}
      <div className="p-4 bg-tl-card border border-tl-border rounded-panel flex flex-wrap items-center justify-between gap-3 text-xs shadow-panel">
        <div className="flex items-center gap-2">
          <span className="text-tl-text-muted font-mono text-[11px]">Audit Presets:</span>
          <Button size="sm" variant="secondary" onClick={handleLoadSample}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-tl-emerald" />
            Load Untouched Report (Match)
          </Button>

          <Button size="sm" variant="outline" onClick={handleTamperReport}>
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-tl-rose" />
            Tamper 1 Character (Mismatch Demo)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-tl-border bg-tl-card text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-hover transition font-mono text-xs">
            <Upload className="w-3.5 h-3.5 text-tl-cyan" />
            <span>Upload JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            size="sm"
            variant="primary"
            onClick={() => handleVerify()}
            isLoading={isVerifying}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Query Chain
          </Button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-panel border transition-all ${
            verificationResult.verified
              ? 'bg-tl-emerald/10 border-tl-emerald/30'
              : 'bg-tl-rose/10 border-tl-rose/30'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {verificationResult.verified ? (
                <div className="p-2.5 bg-tl-emerald/20 border border-tl-emerald/40 rounded-xl text-tl-emerald">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 bg-tl-rose/20 border border-tl-rose/40 rounded-xl text-tl-rose">
                  <ShieldX className="w-6 h-6" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-tl-text-primary tracking-tight">
                  {verificationResult.verified
                    ? 'Cryptographic Match Confirmed: On-Chain Record Verified'
                    : 'Cryptographic Hash Mismatch / Unregistered Report'}
                </h3>
                <p className="text-xs text-tl-text-secondary mt-0.5">
                  {verificationResult.verified
                    ? 'The JSON document matches byte-for-byte (via RFC 8785) the exact Keccak-256 digest registered on Ethereum Sepolia.'
                    : 'The computed hash of this document does not match any registered entry on the Sepolia smart contract.'}
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded border ${
                verificationResult.verified
                  ? 'bg-tl-emerald/20 text-tl-emerald border-tl-emerald/40'
                  : 'bg-tl-rose/20 text-tl-rose border-tl-rose/40'
              }`}
            >
              {verificationResult.verified ? 'Verified Match' : 'Mismatch / Tampered'}
            </span>
          </div>

          {/* Telemetry metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-tl-border/40 font-mono text-xs">
            <div className="p-3 bg-tl-panel rounded-xl border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block uppercase">Registered Submitter</span>
              <span className="text-tl-text-primary truncate block font-mono">
                {verificationResult.reporter || '—'}
              </span>
            </div>

            <div className="p-3 bg-tl-panel rounded-xl border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block uppercase">Network Target</span>
              <span className="text-tl-emerald block font-semibold">
                {verificationResult.network || 'Ethereum Sepolia'}
              </span>
            </div>

            <div className="p-3 bg-tl-panel rounded-xl border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block uppercase">On-Chain Timestamp</span>
              <span className="text-tl-text-primary block font-mono">
                {verificationResult.timestamp
                  ? new Date(verificationResult.timestamp * 1000).toLocaleString()
                  : '—'}
              </span>
            </div>

            <div className="p-3 bg-tl-panel rounded-xl border border-tl-border">
              <span className="text-[10px] text-tl-text-muted block uppercase">Registry Contract</span>
              <a
                href={verificationResult.explorerUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-tl-cyan hover:underline flex items-center gap-1 truncate font-mono"
              >
                {verificationResult.contractAddress.slice(0, 8)}...{verificationResult.contractAddress.slice(-6)}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Philosophical Disclaimer */}
      <div className="p-3.5 bg-tl-card border border-tl-border rounded-xl flex items-center gap-2.5 text-xs text-tl-text-muted font-mono">
        <Info className="w-4 h-4 text-tl-cyan shrink-0" />
        <span>
          Integrity Notice: The blockchain verifies the exact mathematical integrity and historical timestamp of the report. It does not replace independent human judgment.
        </span>
      </div>

      {/* Hash Comparison & Cryptographic Proof */}
      <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-3 shadow-panel">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tl-text-secondary flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-tl-cyan" />
          Cryptographic Hash Parity (RFC 8785 + Keccak-256)
        </h3>

        <div className="space-y-2.5 text-xs font-mono">
          <div>
            <div className="flex items-center justify-between text-[11px] text-tl-text-muted mb-1">
              <span>Client-Recomputed Hash (Browser Local):</span>
              <span className="text-tl-cyan">Pure Local EVM Implementation</span>
            </div>
            <div className="p-3 bg-tl-panel border border-tl-border rounded-xl text-tl-text-primary break-all select-all">
              {recomputedHash || 'Awaiting valid JSON...'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-tl-text-muted mb-1">
              <span>Smart Contract Verified Hash:</span>
              <span className="text-tl-text-muted">Ethereum Sepolia / Local Registry</span>
            </div>
            <div className="p-3 bg-tl-panel border border-tl-border rounded-xl text-tl-text-primary break-all select-all">
              {verificationResult?.verified
                ? recomputedHash
                : 'No registered match found on-chain'}
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Canonical Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
        {/* Left: Raw JSON Input */}
        <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-2.5 shadow-panel">
          <div className="flex items-center justify-between">
            <label className="font-bold uppercase tracking-wider text-tl-text-secondary">
              Report JSON Document
            </label>
            {parseError && (
              <span className="text-[10px] text-tl-rose">{parseError}</span>
            )}
          </div>
          <textarea
            rows={13}
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              evaluateHash(e.target.value);
            }}
            className="w-full bg-tl-panel border border-tl-border rounded-xl p-3 text-tl-text-primary focus:outline-none focus:border-tl-cyan transition select-all"
          />
        </div>

        {/* Right: RFC 8785 Canonical JSON */}
        <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-2.5 shadow-panel">
          <div className="flex items-center justify-between">
            <label className="font-bold uppercase tracking-wider text-tl-text-secondary">
              Canonical JCS String (RFC 8785)
            </label>
            <span className="text-[10px] text-tl-emerald">Deterministic Sort</span>
          </div>
          <textarea
            rows={13}
            readOnly
            value={canonicalString}
            placeholder="Canonical representation will appear here..."
            className="w-full bg-tl-panel/50 border border-tl-border/70 rounded-xl p-3 text-tl-text-muted focus:outline-none select-all"
          />
        </div>
      </div>
    </div>
  );
}
