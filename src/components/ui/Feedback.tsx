import type { ReactNode } from 'react';
import { Loader2, Film, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-paper-500">
      <Loader2 className="size-8 animate-spin text-gold-400" aria-hidden />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-600 py-16 text-center">
      <Film className="size-8 text-ink-500" aria-hidden />
      <h3 className="font-display text-xl tracking-wide text-paper-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-paper-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-crimson-500/40 py-16 text-center"
    >
      <AlertTriangle className="size-8 text-crimson-400" aria-hidden />
      <h3 className="font-display text-xl tracking-wide text-paper-100">{title}</h3>
      <p className="max-w-sm text-sm text-paper-500">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-ink-600 px-4 py-2 text-sm font-medium text-paper-100 hover:border-gold-400"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'crimson' | 'emerald';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-700 text-paper-300',
    gold: 'bg-gold-400/15 text-gold-300 border border-gold-500/40',
    crimson: 'bg-crimson-500/15 text-crimson-400 border border-crimson-500/40',
    emerald: 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/40',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
