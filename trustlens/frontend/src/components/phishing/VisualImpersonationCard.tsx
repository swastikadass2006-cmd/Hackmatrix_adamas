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
    <Card className="p-5 bg-zinc-950/80 border border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-rose-400" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
            Computer Vision Brand Impersonation & DOM Signals
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
            isImpersonating
              ? 'bg-rose-950 text-rose-400 border-rose-500/40 animate-pulse'
              : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
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
            <div className="p-3 bg-zinc-900/90 border border-rose-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Target Screenshot Capture</span>
                </span>
                <span className="text-zinc-500 truncate max-w-[140px]">{targetUrl}</span>
              </div>

              <div className="relative w-full h-44 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-4 text-center overflow-hidden group">
                {/* Simulated screenshot canvas with simulated inputs */}
                <div className="w-full max-w-[200px] space-y-2 pointer-events-none opacity-85">
                  <div className="h-4 bg-sky-600/40 rounded w-2/3 mx-auto flex items-center justify-center text-[8px] font-bold text-sky-200">
                    SBI NETBANKING
                  </div>
                  <div className="h-6 bg-zinc-800 border border-zinc-700 rounded px-2 flex items-center text-[9px] text-zinc-400">
                    Username / CIF ID
                  </div>
                  <div className="h-6 bg-zinc-800 border border-zinc-700 rounded px-2 flex items-center text-[9px] text-zinc-400">
                    ••••••••••••
                  </div>
                  <div className="h-6 bg-sky-600 rounded flex items-center justify-center text-[9px] font-bold text-white shadow">
                    LOGIN
                  </div>
                </div>

                <div className="absolute inset-0 bg-rose-500/10 pointer-events-none border-2 border-rose-500/40 border-dashed rounded-lg" />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded font-mono text-[9px] text-rose-400">
                  Target Capture
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 font-mono">
                Matched OCR Title: <span className="text-zinc-200 font-semibold">{visualImpersonation.logoOcrMatch}</span>
              </p>
            </div>

            {/* Canonical Brand Reference */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Canonical Brand Signature</span>
                </span>
                <span className="text-zinc-400">{visualImpersonation.canonicalDomain}</span>
              </div>

              <div className="w-full h-44 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400 font-bold text-lg">
                  SBI
                </div>
                <h5 className="text-xs font-bold text-zinc-100">{visualImpersonation.targetBrand}</h5>
                <span className="text-[10px] font-mono text-zinc-400 mt-1">
                  Legitimate Sovereign Entity
                </span>
                <span className="mt-2 text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded">
                  Canonical Domain: {visualImpersonation.canonicalDomain}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Perceptual Hash Distance:</span>
                <span className="text-rose-400 font-bold">d = 0.086</span>
              </div>
            </div>
          </div>

          {/* SSIM Metric Meter */}
          <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-semibold">SSIM Visual Correlation Match:</span>
              <span className="text-rose-400 font-bold text-sm">{ssim}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000"
                style={{ width: `${ssim}%` }}
              />
            </div>
            <p className="text-[11px] text-rose-300/90 leading-relaxed">
              ⚠️ <strong>Critical Threat:</strong> Viewport rendering exceeds the 85.0% threshold for visual brand spoofing on an unauthorized top-level domain (`*.top`).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-center font-mono text-xs text-zinc-400 space-y-1">
          <p className="text-emerald-400 font-semibold">✓ No Protected Brand Assets Impersonated</p>
          <p className="text-zinc-500 text-[11px]">
            Target visual layout does not match any high-value banking or government portals in our monitored brand registry.
          </p>
        </div>
      )}

      {/* DOM & Form Exfiltration Telemetry */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-2 font-mono text-xs">
        <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
          Active DOM Forensics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="text-[10px] text-zinc-500">External Form Action</div>
            <div className={`font-semibold mt-0.5 ${domSignals.externalFormAction ? 'text-rose-400' : 'text-emerald-400'}`}>
              {domSignals.externalFormAction ? 'MALICIOUS DETECTED' : 'Internal Only'}
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="text-[10px] text-zinc-500">Password Input Form</div>
            <div className={`font-semibold mt-0.5 ${domSignals.passwordFieldPresent ? 'text-amber-400' : 'text-zinc-300'}`}>
              {domSignals.passwordFieldPresent ? 'Present (Harvesting)' : 'None'}
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="text-[10px] text-zinc-500">Hidden Iframes</div>
            <div className={`font-semibold mt-0.5 ${domSignals.hiddenIframes ? 'text-rose-400' : 'text-emerald-400'}`}>
              {domSignals.hiddenIframes ? 'Detected (Overlay)' : 'None'}
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <div className="text-[10px] text-zinc-500">Lexical Entropy</div>
            <div className="font-semibold text-zinc-200 mt-0.5">
              {entropy.toFixed(2)} bits/char
            </div>
          </div>
        </div>

        {domSignals.formActionUrl && (
          <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded-lg flex items-center justify-between gap-2 text-[11px]">
            <span className="text-zinc-400 shrink-0 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-rose-400" />
              <span>Exfil Target:</span>
            </span>
            <code className="text-rose-300 font-mono truncate">{domSignals.formActionUrl}</code>
          </div>
        )}
      </div>
    </Card>
  );
};

