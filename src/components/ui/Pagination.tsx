import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;

  // Show a compact window of page numbers around the current page.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md p-2 text-paper-300 hover:bg-ink-700 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {start > 1 && (
        <>
          <PageButton n={1} active={page === 1} onClick={onChange} />
          {start > 2 && <span className="px-1 text-paper-500">…</span>}
        </>
      )}
      {numbers.map((n) => (
        <PageButton key={n} n={n} active={page === n} onClick={onChange} />
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 text-paper-500">…</span>}
          <PageButton n={pages} active={page === pages} onClick={onChange} />
        </>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="rounded-md p-2 text-paper-300 hover:bg-ink-700 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

function PageButton({ n, active, onClick }: { n: number; active: boolean; onClick: (n: number) => void }) {
  return (
    <button
      onClick={() => onClick(n)}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'min-w-9 rounded-md px-2.5 py-1.5 font-mono text-sm',
        active ? 'bg-gold-400 text-ink-950' : 'text-paper-300 hover:bg-ink-700',
      )}
    >
      {n}
    </button>
  );
}
