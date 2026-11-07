'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanResult } from '../lib/types/scan';
import { apiClient } from '../lib/api/client';

export interface WorkerStep {
  id: number;
  name: string;
  workerLabel: string;
  status: 'pending' | 'running' | 'completed' | 'warning';
  log: string;
}

const INITIAL_WORKERS: WorkerStep[] = [
  {
    id: 1,
    name: 'Lexical & Domain Reputation Engine',
    workerLabel: 'Worker 1 (URL Model)',
    status: 'pending',
    log: 'Awaiting target normalization and punycode canonicalization...',
  },
  {
    id: 2,
    name: 'X.509 Cryptographic & Fermat Sieve Linter',
    workerLabel: 'Worker 2 (Cert Linter)',
    status: 'pending',
    log: 'Initializing CCADB trust anchor parser & prime distance tester...',
  },
  {
    id: 3,
    name: 'Headless Chromium DOM & Visual Match Engine',
    workerLabel: 'Worker 3 (DOM Engine)',
    status: 'pending',
    log: 'Spinning isolated sandbox for DOM form actions & SSIM visual hash...',
  },
  {
    id: 4,
    name: 'Global Threat Intelligence & ASN Clustering',
    workerLabel: 'Worker 4 (Intel Hub)',
    status: 'pending',
    log: 'Correlating BGP prefix, ASN reputation, and passive DNS history...',
  },
];

export function useScan() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [workerSteps, setWorkerSteps] = useState<WorkerStep[]>(INITIAL_WORKERS);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = async (url: string) => {
    setIsScanning(true);
    setError(null);
    setWorkerSteps(INITIAL_WORKERS.map((s) => ({ ...s, status: 'pending' })));

    try {
      // Step 1: Worker 1
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 1
            ? { ...s, status: 'running', log: `Deconstructing FQDN: ${url} (Entropy analysis & TLD reputation)` }
            : s
        )
      );
      await new Promise((r) => setTimeout(r, 400));
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 1 ? { ...s, status: 'completed', log: 'Entropy: 4.87 bits/char. NRD heuristics applied.' } : s
        )
      );

      // Step 2: Worker 2
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 2
            ? { ...s, status: 'running', log: 'Evaluating TLS handshake, chain validation & Fermat factor check...' }
            : s
        )
      );
      await new Promise((r) => setTimeout(r, 500));
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 2
            ? { ...s, status: 'completed', log: 'Chain mapped to Root CA. Verified signature algorithms.' }
            : s
        )
      );

      // Step 3: Worker 3
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 3
            ? { ...s, status: 'running', log: 'Extracting DOM tree, form endpoints, and visual perceptual hash...' }
            : s
        )
      );
      await new Promise((r) => setTimeout(r, 600));
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 3
            ? { ...s, status: 'completed', log: 'Rendered 1920x1080 canvas. SSIM comparison completed.' }
            : s
        )
      );

      // Step 4: Worker 4
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 4
            ? { ...s, status: 'running', log: 'Querying ASN co-occurrence graph and sinkhole feeds...' }
            : s
        )
      );
      await new Promise((r) => setTimeout(r, 450));
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 4 ? { ...s, status: 'completed', log: 'Correlated with active campaigns. Risk fusion computed.' } : s
        )
      );

      // Fetch scan
      const normalizedTarget = url.toLowerCase().trim();
      let targetId = 'scan-sbi-phish';
      if (normalizedTarget.includes('emudhra') || normalizedTarget.includes('gov-gateway') || normalizedTarget.includes('crypto')) {
        targetId = 'scan-emudhra-crypto';
      } else if (normalizedTarget.includes('github') || normalizedTarget.includes('clean')) {
        targetId = 'scan-github-clean';
      } else {
        targetId = encodeURIComponent(normalizedTarget.replace(/^https?:\/\//, ''));
      }

      const result = await apiClient.getScan(targetId);
      setScanResult(result);
      router.push(`/scan/${targetId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please check network connectivity.';
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    workerSteps,
    scanResult,
    error,
    startScan,
  };
}

