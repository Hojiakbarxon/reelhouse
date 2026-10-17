import { useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";

const LENGTH = 6;

/**
 * Six-digit code input.
 *
 * It is ONE real <input> (invisible, stretched over the boxes) and six purely
 * visual boxes. Typing, paste, backspace, SMS/password-manager autofill and
 * mobile keyboards are all handled natively by that single input, so there is
 * no per-box focus juggling to break when the user types one digit at a time.
 */
export function OtpInput({
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  label = "Verification code",
}: {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  disabled?: boolean;
  /** Focus the field as soon as it mounts (e.g. when a dialog opens). */
  autoFocus?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  // The box that will receive the next digit (stays on the last box when full).
  const activeIndex = Math.min(value.length, LENGTH - 1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Digits are only ever appended/removed at the end, so keep the caret there.
  function keepCaretAtEnd(el: HTMLInputElement) {
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end)
      el.setSelectionRange(end, end);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-paper-300">
        {label}
      </label>
      <div className="relative">
        <div className="flex gap-2 sm:gap-3" aria-hidden>
          {Array.from({ length: LENGTH }, (_, i) => {
            const digit = value[i] ?? "";
            const isActive = focused && !disabled && i === activeIndex;
            return (
              <div
                key={i}
                className={clsx(
                  "flex h-14 min-w-0 flex-1 items-center justify-center rounded-md border bg-ink-800 font-display text-2xl text-paper-100 transition-colors",
                  error
                    ? "border-crimson-500"
                    : isActive
                      ? "border-gold-400 ring-1 ring-gold-400"
                      : digit
                        ? "border-ink-500"
                        : "border-ink-600",
                  disabled && "opacity-50",
                )}
              >
                {digit ||
                  (isActive ? (
                    <span className="h-6 w-0.5 animate-pulse bg-gold-400" />
                  ) : null)}
              </div>
            );
          })}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          enterKeyHint="done"
          value={value}
          disabled={disabled}
          // No maxLength on purpose: it would truncate "123 456" before we can
          // strip the space, dropping the last digit of a pasted code.
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, LENGTH))
          }
          onFocus={(e) => {
            setFocused(true);
            keepCaretAtEnd(e.currentTarget);
          }}
          onBlur={() => setFocused(false)}
          onSelect={(e) => keepCaretAtEnd(e.currentTarget)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent text-base text-transparent caret-transparent opacity-0 disabled:cursor-not-allowed"
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-crimson-400">
          {error}
        </p>
      )}
    </div>
  );
}
