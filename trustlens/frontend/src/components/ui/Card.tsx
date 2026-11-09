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
    emerald: 'border-tl-emerald/40',
    rose: 'border-tl-rose/40',
    amber: 'border-tl-amber/40',
    cyan: 'border-tl-cyan/40',
  };

  return (
    <div
      className={cn(
        'bg-tl-card border border-tl-border rounded-panel text-tl-text overflow-hidden transition-colors',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

