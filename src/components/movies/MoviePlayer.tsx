import { useState } from 'react';
import { Play } from 'lucide-react';
import { clsx } from 'clsx';
import type { MovieFile } from '@/api/types';

export function MoviePlayer({ files }: { files: MovieFile[] }) {
  const [activeId, setActiveId] = useState(files[0]?.id);
  const active = files.find((f) => f.id === activeId) ?? files[0];

  if (!active) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-ink-700 bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video key={active.id} controls className="aspect-video w-full" poster={undefined}>
          <source src={active.file_url} />
          Your browser doesn't support embedded video.
        </video>
      </div>
      {files.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveId(file.id)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide',
                file.id === active.id
                  ? 'border-gold-500 bg-gold-400/15 text-gold-300'
                  : 'border-ink-600 text-paper-500 hover:border-ink-500',
              )}
            >
              <Play className="size-3" aria-hidden />
              {file.quality} · {file.language}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
