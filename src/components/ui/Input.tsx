import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-paper-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-md border bg-ink-800 px-3 py-2.5 text-paper-100 placeholder:text-ink-400',
            'transition-colors focus:border-gold-400',
            error ? 'border-crimson-500' : 'border-ink-600',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-sm text-crimson-400">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-paper-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-md border bg-ink-800 px-3 py-2.5 text-paper-100 placeholder:text-ink-400',
            'transition-colors focus:border-gold-400',
            error ? 'border-crimson-500' : 'border-ink-600',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-sm text-crimson-400">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';


