'use client';

import React from 'react';
import { CheckCircle2, Loader2, Clock, AlertTriangle, Terminal } from 'lucide-react';
import { WorkerStep } from '../../hooks/useScan';
import { Card } from '../ui/Card';

export interface ScanProgressStreamProps {
  steps: WorkerStep[];
}

export const ScanProgressStream: React.FC<ScanProgressStreamProps> = ({ steps }) => {
  return (
    <Card className="p-4 sm:p-5 bg-tl-card border border-tl-border">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-tl-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-tl-cyan" />
          <h3 className="text-xs font-semibold text-tl-text">
            Parallel worker pipeline execution (4 threads)
          </h3>
        </div>
        <span className="text-xs text-tl-muted">Real-time telemetry</span>
      </div>

      <div className="space-y-3 text-xs">
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isWarning = step.status === 'warning';

          return (
            <div
              key={step.id}
              className={`p-3 rounded border transition-colors ${
                isRunning
                  ? 'bg-tl-cyan/10 border-tl-cyan/40'
                  : isDone
                  ? 'bg-tl-panel border-tl-border'
                  : 'bg-tl-canvas border-tl-border/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-tl-emerald shrink-0" />
                  ) : isRunning ? (
                    <Loader2 className="w-4 h-4 text-tl-cyan animate-spin motion-reduce:animate-none shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-tl-amber shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-tl-muted shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      isRunning ? 'text-tl-cyan' : isDone ? 'text-tl-text' : 'text-tl-muted'
                    }`}
                  >
                    {step.workerLabel}
                  </span>
                  <span className="text-xs text-tl-muted hidden sm:inline">/ {step.name}</span>
                </div>

                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    isRunning
                      ? 'bg-tl-cyan/20 text-tl-cyan border border-tl-cyan/30'
                      : isDone
                      ? 'bg-tl-card text-tl-text border border-tl-border'
                      : 'bg-tl-panel text-tl-muted'
                  }`}
                >
                  {step.status}
                </span>
              </div>

              <p className="text-xs font-mono text-tl-muted pl-6 leading-relaxed">
                &gt; {step.log}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

