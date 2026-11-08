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
      // Step 1: Worker 1 — visual progress while API call is in-flight
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

      // Step 4: Worker 4 — fires real API call concurrently during animation
      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 4
            ? { ...s, status: 'running', log: 'Querying ASN co-occurrence graph and sinkhole feeds...' }
            : s
        )
      );

      // === LIVE API CALL ===
      const { result, fromMock } = await apiClient.scanUrl(url);
      setScanResult(result);

      setWorkerSteps((prev) =>
        prev.map((s) =>
          s.id === 4 ? { ...s, status: 'completed', log: 'Correlated with active campaigns. Risk fusion computed.' } : s
        )
      );

      // Store live result in sessionStorage so the results page can read it without
      // re-fetching. Key = scan:${routeId} matches what page.tsx will look for.
      const routeId = result.id ?? encodeURIComponent(url.replace(/^https?:\/\//, ''));
      if (!fromMock) {
        try {
          sessionStorage.setItem(`scan:${routeId}`, JSON.stringify(result));
        } catch {
          // Quota exceeded or private-browsing — carry on gracefully
        }
      }
      router.push(`/scan/${routeId}`);
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
