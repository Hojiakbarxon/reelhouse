import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { classifyError } from '@/lib/errors';
import type { ClassifiedError } from '@/lib/errors';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';
import { AuthAlert } from '@/components/ui/AuthAlert';
import { useCountdown } from '@/hooks/use-countdown';
import { authApi } from '@/hooks/auth';

// The backend's 2FA session token (POST /auth/login) lives for 5 minutes.
const TWO_FACTOR_SESSION_SECONDS = 5 * 60;

export function TwoFactorLoginStep({
  twoFactorToken,
  onSuccess,
  onBack,
}: {
  twoFactorToken: string;
  onSuccess: (authToken: string) => void;
  onBack: (message?: string) => void;
}) {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<ClassifiedError | null>(null);
  const session = useCountdown(TWO_FACTOR_SESSION_SECONDS);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (session.isExpired) {
      onBack('Your verification session expired. Please sign in again.');
      return;
    }
    if (otp.length < 6) {
      setFormError({ kind: 'otp', message: 'Enter all 6 digits from your authenticator app.' });
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const response = await authApi.loginWithTwoFactor(otp, twoFactorToken);
      onSuccess(response.data.data.authToken);
    } catch (error) {
      // 401 = the 2FA session token is expired/invalid -> start over.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onBack('Your verification session expired. Please sign in again.');
        return;
      }
      setOtp('');
      setFormError(classifyError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <AuthAlert error={formError} />}

      <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

      <div className="flex items-center justify-between gap-3 rounded-md border border-ink-600 bg-ink-800/60 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 text-paper-500">
          <ShieldCheck className="size-4 shrink-0 text-gold-400" aria-hidden />
          {session.isExpired ? (
            <span className="text-crimson-400">Session expired</span>
          ) : (
            <>
              Session ends in <span className="font-mono text-paper-100">{session.formatted}</span>
            </>
          )}
        </span>
      </div>

      <p className="text-xs text-paper-500">
        Open your authenticator app and enter the current 6-digit code for Reelhouse. Codes refresh
        every 30 seconds.
      </p>

      <Button type="submit" isLoading={isSubmitting} disabled={session.isExpired} className="w-full">
        Verify and sign in
      </Button>

      <button
        type="button"
        onClick={() => onBack()}
        className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-paper-500 transition-colors hover:text-gold-400"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </button>
    </form>
  );
}
