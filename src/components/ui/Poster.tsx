import { useState } from 'react';
import { Film } from 'lucide-react';
import { clsx } from 'clsx';

export function Poster({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-ink-800 text-ink-500',
          className,
        )}
      >
        <Film className="size-8" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={clsx('object-cover', className)}
    />
  );
}


