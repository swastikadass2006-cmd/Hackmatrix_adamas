import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
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
    'inline-flex items-center justify-center font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tl-cyan disabled:pointer-events-none disabled:opacity-50 select-none';

  const variants = {
    primary:
      'bg-tl-cyan text-[#070B11] font-semibold hover:bg-tl-cyan/90 hover:shadow-[0_0_20px_rgba(67,185,219,0.35)] active:scale-[0.98] shadow-sm',
    secondary:
      'bg-[#141E2E]/80 backdrop-blur-md text-tl-text-primary hover:bg-[#1A273D] border border-white/[0.09] hover:border-white/[0.18]',
    glass:
      'bg-white/[0.05] backdrop-blur-md text-tl-text-primary hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.16]',
    danger:
      'bg-tl-rose text-white hover:bg-tl-rose/90 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-[0.98] shadow-sm',
    ghost:
      'text-tl-text-secondary hover:bg-white/[0.05] hover:text-tl-text-primary',
    outline:
      'border border-white/[0.08] text-tl-text-secondary hover:border-tl-cyan/40 hover:text-tl-text-primary hover:bg-[#141E2E]/50',
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
