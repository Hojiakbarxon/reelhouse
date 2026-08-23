import { Film } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-700">
      <div className="filmstrip" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-paper-500">
            <Film className="size-4 text-gold-500" aria-hidden />
            <span className="font-mono text-xs uppercase tracking-widest">Reelhouse</span>
          </div>
          <p className="text-center text-xs text-paper-500">
            Stream what matters. Built on a demo payment flow — no real charges are ever made.
          </p>
          <p className="font-mono text-xs text-paper-500">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
