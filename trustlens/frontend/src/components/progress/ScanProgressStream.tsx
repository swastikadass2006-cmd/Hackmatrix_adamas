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
    <Card className="p-4 sm:p-5 bg-zinc-950/90 border border-zinc-800">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-zinc-200">
            Parallel worker pipeline execution (4 threads)
          </h3>
        </div>
        <span className="text-xs text-zinc-500">Real-time telemetry</span>
      </div>

      <div className="space-y-3 text-xs">
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isWarning = step.status === 'warning';

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-colors ${
                isRunning
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : isDone
                  ? 'bg-zinc-900/60 border-zinc-800'
                  : 'bg-zinc-950 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isRunning ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin motion-reduce:animate-none shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      isRunning ? 'text-emerald-300' : isDone ? 'text-zinc-200' : 'text-zinc-500'
                    }`}
                  >
                    {step.workerLabel}
                  </span>
                  <span className="text-xs text-zinc-500 hidden sm:inline">/ {step.name}</span>
                </div>

                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    isRunning
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 motion-safe:animate-pulse'
                      : isDone
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {step.status}
                </span>
              </div>

              <p className="text-xs font-mono text-zinc-400 pl-6 leading-relaxed">
                &gt; {step.log}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

