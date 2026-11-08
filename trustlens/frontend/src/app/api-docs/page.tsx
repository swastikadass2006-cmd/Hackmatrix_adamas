'use client';

import React, { useState } from 'react';
import { Code, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const curlScan = `curl -X POST "http://localhost:8000/scan" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://secure-login.top"
  }'`;

  const curlFeed = `curl -X GET "http://localhost:8000/export/stix"`;

  return (
    <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-tl-border/60">
        <div className="flex items-center gap-2 text-tl-cyan text-xs font-semibold font-mono">
          <Code className="w-4 h-4" />
          <span>DEVELOPER PLATFORM / REST &amp; STIX 2.1 SPECIFICATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tl-text-primary">
          TrustLens Telemetry &amp; Analysis API Reference
        </h1>
        <p className="text-xs sm:text-sm text-tl-text-secondary leading-relaxed">
          Programmatic access for Security Orchestration, Automation, and Response (SOAR) workflows, firewall rule generation, and real-time STIX threat intelligence ingestion.
        </p>
      </div>

      {/* Endpoint 1: POST /scan */}
      <section className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-3 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-tl-cyan/15 text-tl-cyan border border-tl-cyan/30 text-xs font-bold font-mono">
              POST
            </span>
            <code className="text-sm font-bold text-tl-text-primary font-mono">/scan</code>
          </div>
          <span className="text-xs text-tl-text-muted font-mono">Initiate Multi-Engine Audit</span>
        </div>

        <div className="p-4 bg-tl-panel border border-tl-border rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-tl-text-muted text-[11px]">
            <span>Request cURL Example:</span>
            <button
              onClick={() => copyCode(curlScan, 'curl-scan')}
              className="hover:text-tl-text-primary flex items-center gap-1 transition"
            >
              {copiedEndpoint === 'curl-scan' ? <Check className="w-3.5 h-3.5 text-tl-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEndpoint === 'curl-scan' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-tl-text-primary overflow-x-auto p-2 bg-tl-canvas rounded border border-tl-border/50 text-[11px]">
            {curlScan}
          </pre>
        </div>
      </section>

      {/* Endpoint 2: GET /export/stix */}
      <section className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-3 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-tl-emerald/15 text-tl-emerald border border-tl-emerald/30 text-xs font-bold font-mono">
              GET
            </span>
            <code className="text-sm font-bold text-tl-text-primary font-mono">/export/stix</code>
          </div>
          <span className="text-xs text-tl-text-muted font-mono">STIX 2.1 Threat Intel Bundle</span>
        </div>

        <div className="p-4 bg-tl-panel border border-tl-border rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-tl-text-muted text-[11px]">
            <span>Request cURL Example:</span>
            <button
              onClick={() => copyCode(curlFeed, 'curl-feed')}
              className="hover:text-tl-text-primary flex items-center gap-1 transition"
            >
              {copiedEndpoint === 'curl-feed' ? <Check className="w-3.5 h-3.5 text-tl-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEndpoint === 'curl-feed' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-tl-text-primary overflow-x-auto p-2 bg-tl-canvas rounded border border-tl-border/50 text-[11px]">
            {curlFeed}
          </pre>
        </div>
      </section>

      {/* Swagger Link */}
      <div className="p-4 bg-tl-card border border-tl-border rounded-xl flex items-center justify-between text-xs font-mono text-tl-text-secondary">
        <span>Interactive Swagger UI &amp; OpenAPI Spec:</span>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="text-tl-cyan hover:underline flex items-center gap-1"
        >
          <span>Open FastAPI Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
