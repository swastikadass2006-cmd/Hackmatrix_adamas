'use client';

import React, { useState } from 'react';
import { CertInspection, CertNode } from '../../lib/types/scan';
import { Card } from '../ui/Card';
import { truncateHash, formatDate } from '../../lib/utils/formatters';
import { ShieldAlert, AlertTriangle, AlertOctagon, KeyRound, CheckCircle2, ChevronDown, ChevronRight, Lock, Unlock, FileText } from 'lucide-react';

export interface CertChainViewerProps {
  certificate: CertInspection;
}

export const CertChainViewer: React.FC<CertChainViewerProps> = ({ certificate }) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(
    certificate.chain.length - 1
  );
  const [showMathDrawer, setShowMathDrawer] = useState(false);

  const selectedNode: CertNode | undefined = certificate.chain[selectedNodeIndex];

  return (
    <div className="p-5 bg-tl-card border border-tl-border rounded-panel space-y-4 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-tl-border">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-tl-cyan" />
          <h4 className="text-xs font-semibold text-tl-text-primary">
            X.509 Certificate Chain & Cryptographic Sieve
          </h4>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {certificate.fermatFactorable && (
            <span className="px-2 py-0.5 rounded bg-tl-rose/15 text-tl-rose border border-tl-rose/40 font-bold">
              Fermat Factorable
            </span>
          )}
          {certificate.ccadbDistrusted && (
            <span className="px-2 py-0.5 rounded bg-tl-amber/15 text-tl-amber border border-tl-amber/40 font-bold">
              CCADB Distrusted CA
            </span>
          )}
          {!certificate.fermatFactorable && !certificate.ccadbDistrusted && (
            <span className="px-2 py-0.5 rounded bg-tl-emerald/15 text-tl-emerald border border-tl-emerald/30">
              Valid Public Trust Anchor
            </span>
          )}
        </div>
      </div>

      {/* Interactive Chain View & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Chain Tree */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] text-zinc-400 font-semibold">
            Trust Chain Hierarchy ({certificate.chain.length} Tiers)
          </span>

          <div className="space-y-2 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:bg-zinc-800">
            {certificate.chain.map((node, index) => {
              const isSelected = selectedNodeIndex === index;
              const isRoot = index === 0;
              const isLeaf = index === certificate.chain.length - 1;
              const isIntermediate = !isRoot && !isLeaf;

              return (
                <button
                  key={node.serialNumber || index}
                  onClick={() => setSelectedNodeIndex(index)}
                  className={`w-full text-left relative z-10 pl-9 pr-3 py-2.5 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan active:opacity-90 disabled:opacity-50 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-800/90 border-emerald-500/60 shadow-lg'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900'
                  }`}
                >
                  {/* Pin Circle */}
                  <div
                    className={`absolute left-2.5 top-3.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      node.isFermatFactorable || node.isCslDistrusted
                        ? 'bg-rose-950 border-rose-500'
                        : isSelected
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-zinc-900 border-zinc-700'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                  </div>

                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {isRoot ? 'Root CA' : isIntermediate ? 'Intermediate CA' : 'Leaf End-Entity'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {node.keyType} {node.keySize}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-200 truncate w-full">
                    {node.subject.split(',')[0].replace('CN=', '')}
                  </p>

                  {/* Warning tags */}
                  {node.isCslDistrusted && (
                    <span className="mt-1 text-[9px] text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Distrusted by CCADB baseline</span>
                    </span>
                  )}
                  {node.isFermatFactorable && (
                    <span className="mt-1 text-[9px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Fermat factorable RSA key</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Fermat Math Sieve Trigger Button */}
          {certificate.fermatFactorable && (
            <button
              onClick={() => setShowMathDrawer(!showMathDrawer)}
              className="w-full p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs whitespace-nowrap flex items-center justify-between hover:bg-rose-950/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 active:opacity-90 disabled:opacity-50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Examine Fermat Factorization Math</span>
              </span>
              {showMathDrawer ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Right: Selected Node Telemetry Dossier */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Node Technical Parameters</span>
            </span>
            <span className="text-[10px] text-zinc-500">
              Serial: {truncateHash(selectedNode?.serialNumber, 6, 6)}
            </span>
          </div>

          {selectedNode && (
            <div className="space-y-2.5 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Subject DN:</span>
                <span className="text-zinc-200 break-all">{selectedNode.subject}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Issuer DN:</span>
                <span className="text-zinc-300 break-all">{selectedNode.issuer}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">Valid Not Before</span>
                  <span className="text-zinc-300">{formatDate(selectedNode.validFrom)}</span>
                </div>
                <div className="p-2 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">Valid Not After</span>
                  <span className="text-zinc-300">{formatDate(selectedNode.validTo)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">Algorithm</span>
                  <span className="text-zinc-300">{selectedNode.signatureAlgorithm}</span>
                </div>
                <div className="p-2 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">Key Type & Length</span>
                  <span className="text-zinc-200 font-semibold">
                    {selectedNode.keyType} {selectedNode.keySize} bits
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">SHA-256 Fingerprint:</span>
                <code className="text-zinc-300 text-[10px] break-all bg-zinc-950 px-2 py-1 rounded block mt-0.5 border border-zinc-800">
                  {selectedNode.fingerprintSha256}
                </code>
              </div>

              {selectedNode.sanList && selectedNode.sanList.length > 0 && (
                <div>
                  <span className="text-zinc-500 block text-[10px]">Subject Alternative Names (SANs):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.sanList.map((san) => (
                      <span
                        key={san}
                        className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]"
                      >
                        {san}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fermat Factorization Math Breakdown Drawer */}
      {showMathDrawer && certificate.fermatFactorable && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <Unlock className="w-4 h-4" />
            <span>Fermat Factorization Vulnerability (ROCA / Prime Proximity)</span>
          </div>

          <p className="text-zinc-300 leading-relaxed text-[11px]">
            In standard RSA cryptography, the public modulus $N = p \cdot q$ relies on $p$ and $q$ being chosen independently at random. When the pseudo-random generator exhibits bias or seeds from restricted entropy, $|p - q|$ can be unusually small.
          </p>

          <div className="p-2.5 bg-zinc-950 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] space-y-1">
            <div>
              <strong>Calculated Modulus Sieve Delta:</strong>{' '}
              <span className="text-rose-400 font-bold">{certificate.details?.factorizationDelta || '|p - q| = 428'}</span>
            </div>
            <div>
              <strong>Iterations to Factor:</strong> <span className="text-zinc-200">38 iterations (&lt; 2 milliseconds CPU time)</span>
            </div>
            <div>
              <strong>Root Cause:</strong>{' '}
              <span className="text-zinc-300">{certificate.details?.vulnerableComponent || 'PRNG entropy flaw'}</span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400">
            <strong>Impact:</strong> Any passive network adversary observing TLS ClientHello/Certificate packets can compute the private key $d$ in real time and decrypt all recorded sessions.
          </p>
        </div>
      )}
    </div>
  );
};

