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
    const params = new URLSearchParams(window.location.search);
    const urlHash = params.get('hash');
    const computed = evaluateHash(inputJson);
    const target = urlHash || computed;
    if (target) {
      handleVerify(target);
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
      // Change just one character or status
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
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Live Pitch Presets:</span>
          <Button size="sm" variant="secondary" onClick={handleLoadSample}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Load Untouched Report (Match)
          </Button>

          <Button size="sm" variant="outline" onClick={handleTamperReport}>
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-4
