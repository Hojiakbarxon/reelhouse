import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type Tone = "edit" | "danger";

// Phones: a real 44px button with a visible background/border and a press
// animation. md+: collapses back to the quiet 36px ghost icon used before.
const base =
  "inline-flex size-11 shrink-0 select-none items-center justify-center rounded-lg border transition duration-100 " +
  "active:scale-90 md:size-9 md:rounded-md md:border-transparent md:bg-transparent";

const tones: Record<Tone, string> = {
  edit:
    "border-gold-500/40 bg-gold-400/10 text-gold-300 active:bg-gold-400/25 " +
    "md:text-paper-500 md:hover:bg-ink-700 md:hover:text-gold-400 md:active:bg-ink-600",
  danger:
    "border-crimson-500/40 bg-crimson-500/10 text-crimson-400 active:bg-crimson-500/30 " +
    "md:text-paper-500 md:hover:bg-ink-700 md:hover:text-crimson-400 md:active:bg-ink-600",
};

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: LucideIcon;
  /** Used for aria-label and the hover tooltip. */
  label: string;
  tone?: Tone;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon: Icon, label, tone = "edit", className, type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={clsx(base, tones[tone], className)}
      {...props}
    >
      <Icon className="size-5 md:size-4" aria-hidden />
    </button>
  ),
);
IconButton.displayName = "IconButton";

interface IconLinkProps extends Omit<LinkProps, "children" | "aria-label"> {
  icon: LucideIcon;
  label: string;
  tone?: Tone;
}

export function IconLink({
  icon: Icon,
  label,
  tone = "edit",
  className,
  ...props
}: IconLinkProps) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={clsx(base, tones[tone], className)}
      {...props}
    >
      <Icon className="size-5 md:size-4" aria-hidden />
    </Link>
  );
}
