'use client';

import React, { useState, useEffect } from 'react';
import { Search, Globe, ArrowRight, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useScan } from '../../hooks/useScan';
import { ScanProgressStream } from '../progress/ScanProgressStream';
import {
  getRecentInvestigations,
  saveRecentInvestigation,
  RecentInvestigation,
} from '../../lib/utils/investigationStorage';
import { useLanguage } from '../../hooks/useLanguage';

export const UrlScannerInput: React.FC = () => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [recentList, setRecentList] = useState<RecentInvestigation[]>([]);
  const { isScanning, workerSteps, startScan, error } = useScan();

  useEffect(() => {
    setRecentList(getRecentInvestigations());
  }, []);

  const sanitizeAndValidate = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationError('Please enter a target URL, domain, or IP address.');
      return null;
    }

    // Check scheme safety: reject dangerous schemes
    if (/^(javascript|data|file|vbscript|ftp):/i.test(trimmed)) {
      setValidationError('Security Alert: Only HTTP and HTTPS protocol schemes are permitted.');
      return null;
    }

    // Auto-normalize if user typed domain without scheme
    let formatted = trimmed;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }

    try {
      const parsed = new URL(formatted);
      if (!parsed.hostname || parsed.hostname.includes(' ')) {
        setValidationError('Invalid host or domain name structure.');
        return null;
      }
      setValidationError(null);
      return formatted;
    } catch {
      setValidationError('Invalid URL syntax.');
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = sanitizeAndValidate(url);
    if (!validated) return;

    // Save to real recent list for sidebar & audit history
    saveRecentInvestigation({
      id: encodeURIComponent(validated.replace(/^https?:\/\//, '')),
      targetUrl: validated,
      classification: 'Analyzing',
    });

    startScan(validated);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 font-sans select-none">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.1] focus-within:border-[#43B9DB]/60 focus-within:shadow-[0_0_25px_rgba(67,185,219,0.2)] rounded-xl p-2 transition-all duration-200">
          <div className="pl-3 pr-2 text-[#778496] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#43B9DB]" />
            <span className="text-[11px] hidden sm:inline text-[#778496] font-mono">
              target://
            </span>
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={t.scanner?.inputPlaceholder || "Enter target URL or FQDN (e.g. onlinesbi-kyc-verify.top or github.com)..."}
            disabled={isScanning}
            className="w-full bg-transparent border-none text-[#F1F5F9] placeholder-[#778496] font-mono text-xs sm:text-sm focus:outline-none px-2 py-1.5"
          />

          <Button
            type="submit"
            size="md"
            variant="primary"
            isLoading={isScanning}
            disabled={!url.trim()}
            className="shrink-0 rounded-lg px-4 text-xs font-semibold"
          >
            <span>{isScanning ? (t.scanner?.analyzing || 'Analyzing...') : (t.scanner?.analyzeButton || 'Analyze Target')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Validation or Engine Error */}
        {(validationError || error) && (
          <div className="p-3 bg-[#E11D48]/10 border border-[#E11D48]/30 rounded-xl text-[#E11D48] text-xs flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}
      </form>

      {/* Real-Time Worker Pipeline Stream */}
      {isScanning && (
        <div className="mt-4">
          <ScanProgressStream steps={workerSteps} />
        </div>
      )}

      {/* Recent Investigations from actual records (No fabricated scenarios) */}
      {!isScanning && (
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#778496] px-1 font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.scanner?.recentScans || 'Recent Investigated Targets'}</span>
            </div>
            <span>{recentList.length} recorded</span>
          </div>

          {recentList.length === 0 ? (
            <div className="p-5 bg-[#141E2E]/50 border border-white/[0.07] rounded-xl text-center">
              <p className="text-xs text-[#E9EEF5]">
                {t.scanner?.noRecentScans || 'No investigations recorded in this session.'}
              </p>
              <p className="text-[11px] text-[#778496] mt-0.5">
                Enter an FQDN or target URL above to perform a cryptographic and lexical audit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentList.slice(0, 4).map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setUrl(rec.targetUrl);
                    startScan(rec.targetUrl);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141E2E]/60 hover:bg-[#162235]/90 border border-white/[0.08] hover:border-[#43B9DB]/40 text-left transition text-xs group"
                >
                  <span className="text-[#F1F5F9] group-hover:text-[#43B9DB] truncate font-mono">
                    {rec.targetUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <span className="text-[10px] text-[#778496] font-mono shrink-0 ml-2 group-hover:text-[#43B9DB]">
                    Audit again &rarr;
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
