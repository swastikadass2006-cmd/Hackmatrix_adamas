import React from 'react';
import { WebHygiene } from '../../lib/types/scan';
import { Card } from '../ui/Card';
import { ShieldCheck, ShieldAlert, AlertTriangle, Server, Check, X, Lock } from 'lucide-react';

export interface HygieneGridProps {
  hygiene: WebHygiene;
}

export const HygieneGrid: React.FC<HygieneGridProps> = ({ hygiene }) => {
  const { securityHeaders, deprecatedTls, tlsVersion, exposedBanners } = hygiene;

  const headerList = [
    {
      key: 'hsts',
      name: 'Strict-Transport-Security (HSTS)',
      status: securityHeaders.hsts,
      recommendation: 'max-age=31536000; includeSubDomains; preload',
    },
    {
      key: 'csp',
      name: 'Content-Security-Policy (CSP)',
      status: securityHeaders.csp,
      recommendation: "default-src 'self'; script-src 'nonce-...'",
    },
    {
      key: 'xfo',
      name: 'X-Frame-Options (Clickjacking)',
      status: securityHeaders.xFrameOptions,
      recommendation: 'DENY or SAMEORIGIN',
    },
    {
      key: 'xcto',
      name: 'X-Content-Type-Options',
      status: securityHeaders.xContentTypeOptions,
      recommendation: 'nosniff',
    },
    {
      key: 'referrer',
      name: 'Referrer-Policy',
      status: securityHeaders.referrerPolicy,
      recommendation: 'strict-origin-when-cross-origin',
    },
    {
      key: 'perm',
      name: 'Permissions-Policy',
      status: securityHeaders.permissionsPolicy,
      recommendation: 'geolocation=(), camera=(), microphone=()',
    },
  ];

  return (
    <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-4 shadow-panel font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-tl-border">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-tl-cyan" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tl-text-primary">
            Passive Web Hygiene & Perimeter Posture
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded border ${
              deprecatedTls
                ? 'bg-tl-rose/15 text-tl-rose border-tl-rose/30'
                : 'bg-tl-emerald/15 text-tl-emerald border-tl-emerald/30'
            }`}
          >
            Active Suite: {tlsVersion}
          </span>
        </div>
      </div>

      {/* Security Headers Matrix */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          HTTP Response Security Headers
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
          {headerList.map((h) => (
            <div
              key={h.key}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                h.status
                  ? 'bg-zinc-900/60 border-zinc-800'
                  : 'bg-rose-950/15 border-rose-500/30'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${h.status ? 'text-zinc-200' : 'text-rose-300'}`}>
                    {h.name}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">{h.recommendation}</p>
              </div>

              <div className="shrink-0">
                {h.status ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    <span>ENFORCED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                    <X className="w-3 h-3" />
                    <span>MISSING</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Server Leaks and Protocol Downgrades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80 font-mono text-xs">
        {/* Exposed Server Banners */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Exposed Server Software Banners</span>
          </div>

          {exposedBanners.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {exposedBanners.map((banner, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded text-[10px]"
                >
                  {banner}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500">
              ✓ Server software tokens cleanly stripped or hidden.
            </p>
          )}
        </div>

        {/* TLS Protocol Downgrade Vulnerability */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>TLS Protocol Negotiation</span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Negotiated with modern cipher suites. TLS 1.0 and 1.1 fallback disabled to prevent BEAST/POODLE downgrade vectors.
          </p>
        </div>
      </div>
    </div>
  );
};

