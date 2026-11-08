'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { ScanResult } from '../../lib/types/scan';
import { Calculator, ShieldAlert, Cpu, Eye, Globe } from 'lucide-react';

export interface RiskFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanResult;
}

export const RiskFormulaModal: React.FC<RiskFormulaModalProps> = ({
  isOpen,
  onClose,
  scan,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trust Score Mathematical Formula & Risk Fusion"
      description="Deterministic multi-signal explainability model with hard boundary overrides"
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs text-zinc-300">
        {/* Core Formula Box */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono">
          <div className="text-[11px] text-zinc-400 mb-1 font-semibold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>BASE FORMULATION</span>
          </div>
          <p className="text-zinc-200 text-sm">
            TrustScore = 100 - &Sigma; (Weight<sub>i</sub> &times; SeverityFactor<sub>i</sub>)
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Bound to range [0, 100] prior to Hard Override evaluations.
          </p>
        </div>

        {/* Weights Matrix */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-2.5 text-xs">
            Signal weight allocation
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Crypto</span>
              </div>
              <div className="text-base font-bold text-zinc-100 font-mono">35%</div>
              <p className="text-xs text-zinc-400">X.509 Chain, Fermat Sieve</p>
            </div>

            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Phishing</span>
              </div>
              <div className="text-base font-bold text-zinc-100 font-mono">35%</div>
              <p className="text-xs text-zinc-400">SSIM Visual, Form Exfil</p>
            </div>

            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-1 text-amber-400 font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Hygiene</span>
              </div>
              <div className="text-base font-bold text-zinc-100 font-mono">15%</div>
              <p className="text-xs text-zinc-400">HSTS, CSP, TLS Suite</p>
            </div>

            <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-1 text-sky-400 font-semibold mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Intel</span>
              </div>
              <div className="text-base font-bold text-zinc-100 font-mono">15%</div>
              <p className="text-xs text-zinc-400">ASN BGP, Sinkhole hits</p>
            </div>
          </div>
        </div>

        {/* Hard Overrides Specification */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-2.5 text-xs">
            Hard boundary overrides
          </h4>
          <div className="space-y-2">
            <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-start gap-2.5">
              <span className="text-rose-400 font-semibold shrink-0 text-xs">Score &le; <span className="font-mono">05</span>:</span>
              <p className="text-zinc-300 text-xs">
                High visual identity similarity (&gt;85% SSIM) accompanied by an external credential form submission target (e.g. Telegram Bot or off-domain HTTP POST).
              </p>
            </div>

            <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-start gap-2.5">
              <span className="text-amber-400 font-semibold shrink-0 text-xs">Score &le; <span className="font-mono">12</span>:</span>
              <p className="text-zinc-300 text-xs">
                Fermat-factorable RSA public key modulus (|p - q| &lt; 2<sup>16</sup>) allowing instant private key derivation in under 100 algebraic iterations.
              </p>
            </div>

            <div className="p-2.5 bg-sky-950/20 border border-sky-500/30 rounded-lg flex items-start gap-2.5">
              <span className="text-sky-400 font-semibold shrink-0 text-xs">Score &le; <span className="font-mono">18</span>:</span>
              <p className="text-zinc-300 text-xs">
                Intermediate CA distrusted by CCADB / Mozilla Root Program (e.g. eMudhra subordinate cross-signing revocations).
              </p>
            </div>
          </div>
        </div>

        {/* Current Scan Override Status */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-zinc-200 text-xs">Current Scan Evaluation:</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                scan.overrideActive
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40 motion-safe:animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {scan.overrideActive ? 'Hard Override Active' : 'Standard Formula'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {scan.overrideActive
              ? scan.overrideReason
              : 'All risk deductions followed standard linear score weighting with no boundary violations.'}
          </p>
        </div>
      </div>
    </Modal>
  );
};

