import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gold-400 text-ink-950 hover:bg-gold-300 disabled:bg-gold-500/50',
  secondary: 'bg-ink-700 text-paper-100 hover:bg-ink-600 border border-ink-600',
  ghost: 'bg-transparent text-paper-100 hover:bg-ink-800',
  danger: 'bg-crimson-500 text-paper-100 hover:bg-crimson-400',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
