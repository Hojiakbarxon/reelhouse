import { Star } from 'lucide-react';
import { clsx } from 'clsx';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function PartialStars({
  value, // always on a 0–5 scale
  sizeClass,
  filledClass,
  emptyClass,
  gapClass = 'gap-0.5',
}: {
  value: number;
  sizeClass: string;
  filledClass: string;
  emptyClass: string;
  gapClass?: string;
}) {
  return (
    <div className={clsx('inline-flex', gapClass)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = clamp(value - i, 0, 1) * 100; // 0–100% for THIS star
        return (
          <span key={i} className={clsx('relative inline-block', sizeClass)}>
            <Star className={clsx('absolute inset-0', sizeClass, emptyClass)} />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star className={clsx('shrink-0', sizeClass, filledClass)} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* USER REVIEWS (0–5) — teal stars */
const USER_FILLED = 'fill-teal-400 text-teal-400';
const USER_EMPTY = 'text-ink-500';

export function StarRating({ value, count }: { value: number | string; count?: number }) {
  const numeric = clamp(Number(value) || 0, 0, 5);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Users rated ${numeric.toFixed(1)} out of 5`}>
      <PartialStars
        value={numeric}
        sizeClass="size-4"
        filledClass={USER_FILLED}
        emptyClass={USER_EMPTY}
      />
      <span className="font-mono text-xs text-teal-400">
        {numeric.toFixed(1)}
        {typeof count === 'number' && ` (${count})`}
      </span>
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(i)}
          className="p-0.5"
        >
          <Star
            className={clsx(
              'size-6 transition-colors',
              i <= value ? USER_FILLED : 'text-ink-500 hover:text-teal-400/60',
            )}
          />
        </button>
      ))}
    </div>
  );
}

/* MOVIE'S OWN RATING (0–10) — gold stars, 10 → 5 conversion */
export function MovieRatingStars({ value }: { value: number | string }) {
  const numeric = clamp(Number(value) || 0, 0, 10);
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${numeric.toFixed(1)} out of 10`}>
      <PartialStars
        value={numeric / 2}
        sizeClass="size-3"
        filledClass="fill-gold-400 text-gold-400"
        emptyClass="text-ink-500"
      />
      <span className="font-mono text-[10px] leading-none text-paper-500">
        {numeric.toFixed(1)}/10
      </span>
    </div>
  );
}