import { useState } from 'react';
import { Play } from 'lucide-react';
import { clsx } from 'clsx';
import { SourceType, type MovieFile } from '@/api/types';

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return null;
}

export function MoviePlayer({ files }: { files: MovieFile[] }) {
  const [activeId, setActiveId] = useState(files[0]?.id);
  const active = files.find((f) => f.id === activeId) ?? files[0];

  if (!active) return null;

  const youtubeId = active.source_type === SourceType.EXTERNAL && active.external_url
    ? extractYoutubeId(active.external_url)
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-ink-700 bg-black">
        {active.source_type === SourceType.EXTERNAL ? (
          youtubeId ? (
            <iframe
              key={active.id}
              className="aspect-video w-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Movie player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center text-sm text-paper-500">
              This video link couldn't be read.
            </div>
          )
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video key={active.id} controls className="aspect-video w-full">
            <source src={active.file_url ?? undefined} />
            Your browser doesn't support embedded video.
          </video>
        )}
      </div>
      {files.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveId(f.id)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide',
                f.id === active.id
                  ? 'border-gold-500 bg-gold-400/15 text-gold-300'
                  : 'border-ink-600 text-paper-500 hover:border-ink-500',
              )}
            >
              <Play className="size-3" aria-hidden />
              {f.quality} · {f.language}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}