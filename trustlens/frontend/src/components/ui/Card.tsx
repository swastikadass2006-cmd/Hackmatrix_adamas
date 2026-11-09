import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'emerald' | 'rose' | 'amber' | 'cyan';
  variant?: 'glass' | 'elevated' | 'overlay' | 'solid';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  variant = 'glass',
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'border-tl-emerald/40 shadow-[0_0_20px_rgba(69,198,155,0.15)]',
    rose: 'border-tl-rose/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    amber: 'border-tl-amber/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    cyan: 'border-tl-cyan/40 shadow-[0_0_20px_rgba(67,185,219,0.20)]',
  };

  const variantStyles = {
    glass: 'glass-card',
    elevated: 'glass-elevated',
    overlay: 'glass-overlay',
    solid: 'bg-tl-card border border-tl-border',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        'rounded-panel text-tl-text-primary overflow-hidden',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
