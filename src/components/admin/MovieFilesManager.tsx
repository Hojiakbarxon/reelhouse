import { useState } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import { useAddMovieFile, useRemoveMovieFile } from '@/hooks/use-admin-movies';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VideoQuality, type MovieFile } from '@/api/types';

export function MovieFilesManager({
  movieId,
  slug,
  files,
}: {
  movieId: string;
  slug: string;
  files: MovieFile[];
}) {
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.P1080);
  const [language, setLanguage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const addFile = useAddMovieFile(movieId, slug);
  const removeFile = useRemoveMovieFile(slug);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    addFile.mutate(
      { quality, language: language || undefined, file },
      { onSuccess: () => setFile(null) },
    );
  }

  return (
    <div>
      <h3 className="font-display text-lg tracking-wide text-paper-100">Video files</h3>

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-md border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
            >
              <span className="font-mono text-paper-300">
                {f.quality} · {f.language}
              </span>
              <button
                onClick={() => removeFile.mutate(f.id)}
                disabled={removeFile.isPending}
                className="p-1 text-paper-500 hover:text-crimson-400"
                aria-label="Remove file"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-paper-500">No video files uploaded yet.</p>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <Select label="Quality" value={quality} onChange={(e) => setQuality(e.target.value as VideoQuality)} className="w-32">
          {Object.values(VideoQuality).map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </Select>
        <Input
          label="Language"
          placeholder="e.g. English"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-40"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="movie-file-upload" className="text-sm font-medium text-paper-300">
            File
          </label>
          <input
            id="movie-file-upload"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-paper-300 file:mr-3 file:rounded-md file:border-0 file:bg-ink-700 file:px-3 file:py-1.5 file:text-paper-100"
          />
        </div>
        <Button type="submit" isLoading={addFile.isPending} disabled={!file}>
          <UploadCloud className="size-4" aria-hidden />
          Upload
        </Button>
      </form>
    </div>
  );
}


