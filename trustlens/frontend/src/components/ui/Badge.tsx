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
    emerald: 'bg-tl-emerald/10 border-tl-emerald/30 text-tl-emerald',
    rose: 'bg-tl-rose/10 border-tl-rose/30 text-tl-rose',
    amber: 'bg-tl-amber/10 border-tl-amber/30 text-tl-amber',
    sky: 'bg-tl-cyan/10 border-tl-cyan/30 text-tl-cyan',
    zinc: 'bg-tl-panel border-tl-border text-tl-text',
    purple: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
  };

  const dots = {
    emerald: 'bg-tl-emerald',
    rose: 'bg-tl-rose',
    amber: 'bg-tl-amber',
    sky: 'bg-tl-cyan',
    zinc: 'bg-tl-muted',
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

