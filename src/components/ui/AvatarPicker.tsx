import { useRef, useState } from 'react';
import { Camera, UserRound } from 'lucide-react';

export function AvatarPicker({
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
    <div className="flex items-center gap-4">
      <div className="relative size-20 overflow-hidden rounded-full bg-ink-700">
        {src ? (
          <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <UserRound className="size-8" aria-hidden />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-ink-600 px-3 py-1.5 text-sm text-paper-100 hover:border-gold-400"
        >
          <Camera className="size-4" aria-hidden />
          Change photo
        </button>
        <p className="mt-1 text-xs text-paper-500">JPEG, PNG, or WEBP. Up to 5MB.</p>
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


