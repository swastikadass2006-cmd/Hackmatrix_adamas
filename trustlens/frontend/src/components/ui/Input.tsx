import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  icon,
  rightElement,
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full bg-zinc-950/80 border border-zinc-800 rounded-lg py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors',
            'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30',
            icon ? 'pl-10' : 'pl-3.5',
            rightElement ? 'pr-12' : 'pr-3.5',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
};

