import { useState } from "react";
import { Trash2, UploadCloud, Link2 } from "lucide-react";
import { useAddMovieFile, useRemoveMovieFile } from "@/hooks/use-admin-movies";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VideoQuality, SourceType, type MovieFile } from "@/api/types";

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
  const [language, setLanguage] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>(SourceType.UPLOADED);
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");

  const addFile = useAddMovieFile(movieId, slug);
  const removeFile = useRemoveMovieFile(slug);

  const canSubmit =
    sourceType === SourceType.UPLOADED ? !!file : externalUrl.trim().length > 0;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addFile.mutate(
      {
        quality,
        language: language || undefined,
        sourceType,
        externalUrl:
          sourceType === SourceType.EXTERNAL ? externalUrl.trim() : undefined,
        file:
          sourceType === SourceType.UPLOADED ? (file ?? undefined) : undefined,
      },
      {
        onSuccess: () => {
          setFile(null);
          setExternalUrl("");
        },
      },
    );
  }

  return (
    <div>
      <h3 className="font-display text-lg tracking-wide text-paper-100">
        Video files
      </h3>

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-md border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-1.5 font-mono text-paper-300">
                {f.source_type === SourceType.EXTERNAL && (
                  <Link2 className="size-3.5 text-crimson-400" aria-hidden />
                )}
                {f.quality} · {f.language}
                {f.source_type === SourceType.EXTERNAL && (
                  <span className="text-paper-500">(YouTube)</span>
                )}
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
        <p className="mt-2 text-sm text-paper-500">
          No video files uploaded yet.
        </p>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3">
        <div className="flex gap-2">
          {[SourceType.UPLOADED, SourceType.EXTERNAL].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSourceType(type)}
              className={
                "rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wide " +
                (sourceType === type
                  ? "border-gold-500 bg-gold-400/15 text-gold-300"
                  : "border-ink-600 text-paper-500 hover:border-ink-500")
              }
            >
              {type === SourceType.UPLOADED ? "Upload file" : "YouTube link"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value as VideoQuality)}
            className="w-32"
          >
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

          {sourceType === SourceType.UPLOADED ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="movie-file-upload"
                className="text-sm font-medium text-paper-300"
              >
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
          ) : (
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/watch?v=..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-64"
            />
          )}

          <Button
            type="submit"
            isLoading={addFile.isPending}
            disabled={!canSubmit}
          >
            <UploadCloud className="size-4" aria-hidden />
            {sourceType === SourceType.UPLOADED ? "Upload" : "Add link"}
          </Button>
        </div>
      </form>
    </div>
  );
}
