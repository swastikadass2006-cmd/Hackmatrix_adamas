import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'emerald' | 'rose' | 'amber' | 'cyan';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] border-emerald-500/30',
    rose: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.2)] border-rose-500/40',
    amber: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)] border-amber-500/30',
    cyan: 'shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] border-cyan-500/30',
  };

  return (
    <div
      className={cn(
        'bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 overflow-hidden',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

