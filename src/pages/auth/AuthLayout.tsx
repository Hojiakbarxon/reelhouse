import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Film, Sparkles } from 'lucide-react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Branding panel — hidden on small screens */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(232,185,77,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(214,69,80,0.15), transparent 40%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-2">
          <Film className="size-7 text-gold-400" aria-hidden />
          <span className="font-display text-3xl tracking-wide text-paper-100">REELHOUSE</span>
        </div>
        <div className="relative max-w-md">
          <Sparkles className="mb-4 size-8 text-gold-400" aria-hidden />
          <p className="font-display text-3xl leading-tight tracking-wide text-paper-100 text-balance">
            Every story, one screening room away.
          </p>
          <p className="mt-4 text-sm text-paper-500">
            Sign in to pick up where you left off, save titles to your list, and unlock premium
            catalog with a subscription.
          </p>
        </div>
        <div className="filmstrip relative w-48" aria-hidden />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Film className="size-6 text-gold-400" aria-hidden />
            <span className="font-display text-2xl tracking-wide text-paper-100">REELHOUSE</span>
          </div>
          <h1 className="font-display text-3xl tracking-wide text-paper-100">{title}</h1>
          <p className="mt-2 text-sm text-paper-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-paper-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({ prompt, linkText, to }: { prompt: string; linkText: string; to: string }) {
  return (
    <p>
      {prompt}{' '}
      <Link to={to} className="font-medium text-gold-400 hover:text-gold-300">
        {linkText}
      </Link>
    </p>
  );
}
