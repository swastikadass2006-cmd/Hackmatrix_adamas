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
        <div className="relative flex items-center bg-tl-card border border-tl-border focus-within:border-tl-cyan rounded-xl p-2 transition shadow-panel">
          <div className="pl-3 pr-2 text-tl-text-muted flex items-center gap-2">
            <Globe className="w-4 h-4 text-tl-cyan" />
            <span className="text-[11px] font-mono hidden sm:inline text-tl-text-secondary">
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
            className="w-full bg-transparent border-none text-tl-text-primary placeholder-tl-text-muted font-mono text-xs sm:text-sm focus:outline-none px-2 py-1.5"
          />

          <Button
            type="submit"
            size="md"
            variant="primary"
            isLoading={isScanning}
            disabled={!url.trim()}
            className="shrink-0 rounded-lg px-4 font-mono text-xs"
          >
            <span>{isScanning ? (t.scanner?.analyzing || 'Analyzing...') : (t.scanner?.analyzeButton || 'Analyze Target')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Validation or Engine Error */}
        {(validationError || error) && (
          <div className="p-3 bg-tl-rose/10 border border-tl-rose/30 rounded-lg text-tl-rose text-xs flex items-center gap-2 font-mono">
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
          <div className="flex items-center justify-between text-xs font-mono text-tl-text-muted px-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.scanner?.recentScans || 'Recent Investigated Targets'}</span>
            </div>
            <span>{recentList.length} recorded</span>
          </div>

          {recentList.length === 0 ? (
            <div className="p-4 bg-tl-card/40 border border-tl-border/60 rounded-xl text-center">
              <p className="text-xs text-tl-text-secondary">
                {t.scanner?.noRecentScans || 'No investigations recorded in this session.'}
              </p>
              <p className="text-[11px] text-tl-text-muted mt-0.5">
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
                  className="flex items-center justify-between p-2.5 rounded-lg bg-tl-card hover:bg-tl-hover border border-tl-border text-left transition text-xs font-mono group"
                >
                  <span className="text-tl-text-primary group-hover:text-tl-cyan truncate">
                    {rec.targetUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <span className="text-[10px] text-tl-text-muted shrink-0 ml-2">
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
