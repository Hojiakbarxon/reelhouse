import { useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { clsx } from 'clsx';

const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  function setDigit(index: number, digit: string) {
    const chars = value.split('');
    chars[index] = digit;
    onChange(chars.join('').slice(0, LENGTH));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const nextFocus = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-paper-300">Verification code</label>
      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={!!error}
            className={clsx(
              'aspect-square w-full min-w-0 rounded-md border bg-ink-800 text-center font-display text-xl tracking-wide text-paper-100',
              'transition-colors focus:border-gold-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-crimson-500' : 'border-ink-600',
            )}
          />
        ))}
      </div>
      {error && <p className="text-sm text-crimson-400">{error}</p>}
    </div>
  );
}
