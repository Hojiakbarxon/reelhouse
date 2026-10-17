import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Always call the latest onClose without making it an effect dependency.
  // Callers usually pass an inline function (a new identity on every render);
  // if that were a dependency, every keystroke inside the modal would re-run
  // the effect below and yank focus back to the dialog, closing the phone
  // keyboard and breaking one-digit-at-a-time OTP entry.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Runs only when the modal opens or closes.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Move focus into the dialog, unless a child (e.g. an autofocused OTP
    // input) has already claimed it.
    if (!dialogRef.current?.contains(document.activeElement)) {
      dialogRef.current?.focus();
    }

    // Stop the page scrolling behind the dialog on phones.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Bottom sheet on phones (easy to reach with a thumb), centred card from sm up. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-ink-600 bg-ink-800 shadow-2xl outline-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-card"
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink-500 sm:hidden"
          aria-hidden
        />
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-6">
          <h2 className="font-display text-xl tracking-wide text-paper-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex size-11 items-center justify-center rounded-md text-paper-500 transition duration-100 hover:text-paper-100 active:scale-90 active:bg-ink-700"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
