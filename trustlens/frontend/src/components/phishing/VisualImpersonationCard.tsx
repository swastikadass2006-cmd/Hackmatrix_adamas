import React from 'react';
import { PhishingDetails } from '../../lib/types/scan';
import { Card } from '../ui/Card';
import { Eye, ShieldAlert, AlertTriangle, ExternalLink, KeyRound, Code } from 'lucide-react';

export interface VisualImpersonationCardProps {
  phishing: PhishingDetails;
  targetUrl: string;
}

export const VisualImpersonationCard: React.FC<VisualImpersonationCardProps> = ({
  phishing,
  targetUrl,
}) => {
  const { visualImpersonation, domSignals, lexicalScore, entropy } = phishing;
  const isImpersonating = visualImpersonation.detected;
  const ssim = visualImpersonation.ssimPercentage ?? 0;

  return (
    <Card className="p-5 bg-tl-card border border-tl-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-tl-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-tl-rose" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-tl-text">
            Computer Vision Brand Impersonation & DOM Signals
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
            isImpersonating
              ? 'bg-tl-rose/10 text-tl-rose border-tl-rose/30'
              : 'bg-tl-emerald/10 text-tl-emerald border-tl-emerald/30'
          }`}
        >
          {isImpersonating ? 'Active Clone Detected' : 'No Brand Spoof'}
        </span>
      </div>

      {/* Visual Side-by-Side Comparison */}
      {isImpersonating ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Live Viewport Render */}
            <div className="p-3 bg-tl-panel border border-tl-rose/30 rounded-panel space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-tl-rose font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Target Screenshot Capture</span>
                </span>
                <span className="text-tl-muted truncate max-w-[140px]">{targetUrl}</span>
              </div>

              <div className="relative w-full h-44 rounded-lg bg-tl-canvas border border-tl-border flex flex-col items-center justify-center p-4 text-center overflow-hidden group">
                {/* Simulated screenshot canvas with simulated inputs */}
                <div className="w-full max-w-[200px] space-y-2 pointer-events-none opacity-85">
                  <div className="h-4 bg-sky-600/40 rounded w-2/3 mx-auto flex items-center justify-center text-[8px] font-bold text-sky-200">
                    SBI NETBANKING
                  </div>
                  <div className="h-6 bg-tl-panel border border-tl-border rounded px-2 flex items-center text-[9px] text-tl-muted">
                    Username / CIF ID
                  </div>
                  <div className="h-6 bg-tl-panel border border-tl-border rounded px-2 flex items-center text-[9px] text-tl-muted">
                    ••••••••••••
                  </div>
                  <div className="h-6 bg-sky-600 rounded flex items-center justify-center text-[9px] font-bold text-white shadow">
                    LOGIN
                  </div>
                </div>

                <div className="absolute inset-0 bg-tl-rose/5 pointer-events-none border border-tl-rose/30 border-dashed rounded-lg" />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded font-mono text-[9px] text-tl-rose">
                  Target Capture
                </div>
              </div>

              <p className="text-[10px] text-tl-muted font-mono">
                Matched OCR Title: <span className="text-tl-text font-semibold">{visualImpersonation.logoOcrMatch}</span>
              </p>
            </div>

            {/* Canonical Brand Reference */}
            <div className="p-3 bg-tl-panel border border-tl-border rounded-panel space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-tl-emerald font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Canonical Brand Signature</span>
                </span>
                <span className="text-tl-muted">{visualImpersonation.canonicalDomain}</span>
              </div>

              <div className="w-full h-44 rounded-lg bg-tl-canvas border border-tl-border flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400 font-bold text-lg">
                  SBI
                </div>
                <h5 className="text-xs font-bold text-tl-text">{visualImpersonation.targetBrand}</h5>
                <span className="text-[10px] font-mono text-tl-muted mt-1">
                  Legitimate Sovereign Entity
                </span>
                <span className="mt-2 text-[10px] font-mono px-2 py-0.5 bg-tl-emerald/10 text-tl-emerald border border-tl-emerald/30 rounded">
                  Canonical Domain: {visualImpersonation.canonicalDomain}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-tl-muted">
                <span>Perceptual Hash Distance:</span>
                <span className="text-tl-rose font-bold">d = 0.086</span>
              </div>
            </div>
          </div>

          {/* SSIM Metric Meter */}
          <div className="p-3 bg-tl-rose/10 border border-tl-rose/30 rounded-panel space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-tl-text font-semibold">SSIM Visual Correlation Match:</span>
              <span className="text-tl-rose font-bold text-sm">{ssim}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-tl-border overflow-hidden">
              <div
                className="h-full bg-tl-rose transition-all duration-1000"
                style={{ width: `${ssim}%` }}
              />
            </div>
            <p className="text-[11px] text-tl-rose/90 leading-relaxed">
              <strong>Critical Threat:</strong> Viewport rendering exceeds the 85.0% threshold for visual brand spoofing on an unauthorized top-level domain (`*.top`).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-tl-panel border border-tl-border rounded-panel text-center font-mono text-xs text-tl-muted space-y-1">
          <p className="text-tl-emerald font-semibold">✓ No Protected Brand Assets Impersonated</p>
          <p className="text-tl-muted text-[11px]">
            Target visual layout does not match any high-value banking or government portals in our monitored brand registry.
          </p>
        </div>
      )}

      {/* DOM & Form Exfiltration Telemetry */}
      <div className="pt-2 border-t border-tl-border space-y-2 font-mono text-xs">
        <span className="text-[11px] font-semibold text-tl-muted uppercase tracking-wider">
          Active DOM Forensics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 bg-tl-panel border border-tl-border rounded">
            <div className="text-[10px] text-tl-muted">External Form Action</div>
            <div className={`font-semibold mt-0.5 ${domSignals.externalFormAction ? 'text-tl-rose' : 'text-tl-emerald'}`}>
              {domSignals.externalFormAction ? 'MALICIOUS DETECTED' : 'Internal Only'}
            </div>
          </div>

          <div className="p-2.5 bg-tl-panel border border-tl-border rounded">
            <div className="text-[10px] text-tl-muted">Password Input Form</div>
            <div className={`font-semibold mt-0.5 ${domSignals.passwordFieldPresent ? 'text-tl-amber' : 'text-tl-text'}`}>
              {domSignals.passwordFieldPresent ? 'Present (Harvesting)' : 'None'}
            </div>
          </div>

          <div className="p-2.5 bg-tl-panel border border-tl-border rounded">
            <div className="text-[10px] text-tl-muted">Hidden Iframes</div>
            <div className={`font-semibold mt-0.5 ${domSignals.hiddenIframes ? 'text-tl-rose' : 'text-tl-emerald'}`}>
              {domSignals.hiddenIframes ? 'Detected (Overlay)' : 'None'}
            </div>
          </div>

          <div className="p-2.5 bg-tl-panel border border-tl-border rounded">
            <div className="text-[10px] text-tl-muted">Lexical Entropy</div>
            <div className="font-semibold text-tl-text mt-0.5">
              {entropy.toFixed(2)} bits/char
            </div>
          </div>
        </div>

        {domSignals.formActionUrl && (
          <div className="p-2 bg-tl-rose/10 border border-tl-rose/30 rounded flex items-center justify-between gap-2 text-[11px]">
            <span className="text-tl-muted shrink-0 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-tl-rose" />
              <span>Exfil Target:</span>
            </span>
            <code className="text-tl-rose font-mono truncate">{domSignals.formActionUrl}</code>
          </div>
        )}
      </div>
    </Card>
  );
};

