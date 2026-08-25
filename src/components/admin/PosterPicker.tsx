import { useRef, useState } from 'react';
import { ImagePlus, Film } from 'lucide-react';

export function PosterPicker({
  currentUrl,
  onSelect,
}: {
  currentUrl: string | null | undefined;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onSelect(file);
  }

  const src = preview ?? currentUrl;

  return (
    <div className="flex items-start gap-4">
      <div className="flex aspect-[2/3] w-32 items-center justify-center overflow-hidden rounded-card bg-ink-700">
        {src ? (
          <img src={src} alt="Poster preview" className="h-full w-full object-cover" />
        ) : (
          <Film className="size-8 text-ink-400" aria-hidden />
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-ink-600 px-3 py-1.5 text-sm text-paper-100 hover:border-gold-400"
        >
          <ImagePlus className="size-4" aria-hidden />
          {src ? 'Change poster' : 'Upload poster'}
        </button>
        <p className="mt-1 text-xs text-paper-500">JPEG, PNG, or WEBP. 2:3 portrait works best.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}


