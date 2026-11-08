'use client';

import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Code, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const curlScan = `curl -X POST "https://api.trustlens.internal/v1/scan" \\
  -H "Authorization: Bearer tl_live_9f81a7b8c2d3..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://onlinesbi-kyc-pan-update.top/login.php",
    "deepInspect": true,
    "runFermatSieve": true
  }'`;

  const curlFeed = `curl -X GET "https://api.trustlens.internal/v1/feed?format=stix2.1&severity=malicious" \\
  -H "Authorization: Bearer tl_live_9f81a7b8c2d3..."`;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <Code className="w-4 h-4" />
          <span>Developer Platform / REST &amp; TAXII 2.1 Specification</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          TrustLens Telemetry &amp; Analysis API Reference
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Programmatic access for Security Orchestration, Automation, and Response (SOAR) workflows, firewall rule generation, and real-time STIX threat intelligence ingestion.
        </p>
      </div>

      {/* Endpoint 1: POST /v1/scan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              POST
            </span>
            <code className="text-sm font-bold text-zinc-100 font-mono">/v1/scan</code>
          </div>
          <span className="text-xs text-zinc-500">Initiate Deep Multi-Signal Audit</span>
        </div>

        <Card className="p-4 bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Request cURL Example:</span>
            <button
              onClick={() => copyCode(curlScan, 'scan')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75 disabled:opacity-50 text-xs"
            >
              {copiedEndpoint === 'scan' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEndpoint === 'scan' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-zinc-900 rounded-lg text-emerald-300 overflow-x-auto text-xs font-mono leading-relaxed">
            {curlScan}
          </pre>

          <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-900">
            <strong>Response Attributes:</strong> Returns <code>trustScore</code> (0-100), <code>overrideActive</code>, <code>fermatFactorable</code>, <code>ssimPercentage</code>, and full X.509 certificate chain nodes.
          </div>
        </Card>
      </section>

      {/* Endpoint 2: GET /v1/feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/30 text-xs font-bold">
              GET
            </span>
            <code className="text-sm font-bold text-zinc-100 font-mono">/v1/feed</code>
          </div>
          <span className="text-xs text-zinc-500">STIX 2.1 Threat Indicator Stream</span>
        </div>

        <Card className="p-4 bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Request cURL Example:</span>
            <button
              onClick={() => copyCode(curlFeed, 'feed')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-75 disabled:opacity-50 text-xs"
            >
              {copiedEndpoint === 'feed' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEndpoint === 'feed' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-zinc-900 rounded-lg text-sky-300 overflow-x-auto text-xs font-mono leading-relaxed">
            {curlFeed}
          </pre>
        </Card>
      </section>
    </div>
  );
}

