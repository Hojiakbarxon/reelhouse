import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Every variant has an `active:` (finger-down) colour so a tap always gives
// visible feedback on phones, where `hover:` never fires.
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gold-400 text-ink-950 hover:bg-gold-300 active:bg-gold-500 disabled:bg-gold-500/50',
  secondary: 'border border-ink-600 bg-ink-700 text-paper-100 hover:bg-ink-600 active:bg-ink-500',
  ghost: 'bg-transparent text-paper-100 hover:bg-ink-800 active:bg-ink-700',
  danger: 'bg-crimson-500 text-paper-100 hover:bg-crimson-400 active:bg-crimson-600',
  dangerOutline:
    'border border-crimson-500/50 bg-crimson-500/10 text-crimson-400 hover:bg-crimson-500/20 active:bg-crimson-500/30',
};

// Mobile-first: 44px minimum height on phones (Apple/Google touch-target
// guidance), relaxing to the compact desktop sizes from `md` up.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3.5 text-sm gap-1.5 md:min-h-9 md:px-3',
  md: 'min-h-11 px-4 text-base gap-2 md:min-h-10 md:text-sm',
  lg: 'min-h-12 px-6 text-base gap-2',
};

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return clsx(
    'inline-flex select-none items-center justify-center rounded-md font-semibold transition duration-100',
    'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
    variants[variant],
    sizes[size],
    className,
  );
}
