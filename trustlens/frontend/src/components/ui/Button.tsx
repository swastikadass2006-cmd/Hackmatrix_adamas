import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none';

  const variants = {
    primary:
      'bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 active:bg-emerald-600 shadow-sm shadow-emerald-500/20',
    secondary:
      'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-900 border border-zinc-700/60',
    danger:
      'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-sm shadow-rose-600/20',
    ghost:
      'text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100',
    outline:
      'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/40',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      className={cn(
        'focus-visible:outline-none focus-visible:ring-2 active:opacity-90 disabled:opacity-50',
        base,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin motion-reduce:animate-none -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

