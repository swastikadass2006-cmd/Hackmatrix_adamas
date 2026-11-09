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
    'inline-flex items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan disabled:pointer-events-none disabled:opacity-50 select-none';

  const variants = {
    primary:
      'bg-tl-cyan text-tl-canvas font-semibold hover:bg-tl-cyan/90 active:bg-tl-cyan/80 shadow-sm',
    secondary:
      'bg-tl-card text-tl-text-primary hover:bg-tl-hover active:bg-tl-elevated border border-tl-border',
    danger:
      'bg-tl-rose text-white hover:bg-tl-rose/90 active:bg-tl-rose/80 shadow-sm',
    ghost:
      'text-tl-text-secondary hover:bg-tl-card hover:text-tl-text-primary',
    outline:
      'border border-tl-border text-tl-text-secondary hover:border-tl-border-active hover:text-tl-text-primary hover:bg-tl-card/50',
  };

  const sizes = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-9 px-3.5 text-xs sm:text-sm rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2.5',
  };

  return (
    <button
      className={cn(
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
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
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
