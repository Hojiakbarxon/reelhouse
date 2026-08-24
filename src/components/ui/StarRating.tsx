import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export function StarRating({ value, count }: { value: number | string; count?: number }) {
  const numeric = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`Rated ${numeric.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={clsx(
              'size-4',
              i <= Math.round(numeric) ? 'fill-gold-400 text-gold-400' : 'text-ink-500',
            )}
            aria-hidden
          />
        ))}
      </div>
      <span className="font-mono text-xs text-paper-500">
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
            className={clsx('size-6 transition-colors', i <= value ? 'fill-gold-400 text-gold-400' : 'text-ink-500 hover:text-ink-400')}
          />
        </button>
      ))}
    </div>
  );
}

// The movie's own admin-set base rating is on a 0–10 scale on this backend —
// distinct from the 0–5 star scale used for user reviews above. Mapped onto
// the same 5-star visual (value / 2) with a smooth proportional fill, sized
// down so it fits inside a movie card without overflowing.
export function MovieRatingStars({ value }: { value: number | string }) {
  const numeric = Number(value) || 0;
  const starsFilled = Math.max(0, Math.min(5, numeric / 2));
  const fillPercent = (starsFilled / 5) * 100;

  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${numeric.toFixed(1)} out of 10`}>
      <div className="relative inline-flex">
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-3 text-ink-500" aria-hidden />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${fillPercent}%` }}
          aria-hidden
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-3 shrink-0 fill-gold-400 text-gold-400" />
          ))}
        </div>
      </div>
      <span className="font-mono text-[10px] leading-none text-paper-500">{numeric.toFixed(1)}</span>
    </div>
  );
}
