import { useState } from "react";
import { User } from "lucide-react";
import { clsx } from "clsx";

const sizes = {
  sm: "size-12",
  md: "size-20",
  lg: "size-28",
  xl: "size-48",
} as const;

export function RoundAvatar({
  src,
  alt,
  size = "md",
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-full bg-ink-800 text-ink-500",
          sizes[size],
          className,
        )}
      >
        <User className="size-2/5" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={clsx(
        "shrink-0 rounded-full object-cover",
        sizes[size],
        className,
      )}
    />
  );
}
