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
// distinct from the 0–5 star scale used for user reviews above. Shown as a
// single star + number rather than five stars, so the two scales are never
// visually confused for one another.
export function RatingOutOfTen({ value }: { value: number | string }) {
  const numeric = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <Star className="size-4 fill-gold-400 text-gold-400" aria-hidden />
      <span className="font-mono text-xs text-paper-500">{numeric.toFixed(1)}/10</span>
    </div>
  );
}
