import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'sky' | 'zinc' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'md',
  dot = false,
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
    rose: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
    amber: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
    sky: 'bg-sky-950/60 border-sky-500/30 text-sky-400',
    zinc: 'bg-zinc-900 border-zinc-700/60 text-zinc-300',
    purple: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
  };

  const dots = {
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    sky: 'bg-sky-400',
    zinc: 'bg-zinc-400',
    purple: 'bg-purple-400',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 rounded gap-1',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium border leading-none tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  );
};

