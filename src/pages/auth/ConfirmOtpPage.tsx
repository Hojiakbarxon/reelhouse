import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { authApi } from '@/api/auth';
import { classifyError } from '@/lib/errors';
import type { ClassifiedError } from '@/lib/errors';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';
import { AuthAlert } from '@/components/ui/AuthAlert';
import { useCountdown } from '@/hooks/use-countdown';

// The backend issues a fresh OTP that's valid for exactly 5 minutes
// (see AuthService.register / expires_in).
const OTP_LIFETIME_SECONDS = 5 * 60;
// Small cooldown on the resend link itself, purely so a person can't
// hammer the register endpoint (and trip the throttle guard) by accident.
const RESEND_COOLDOWN_SECONDS = 5 * 60;

interface RegisterState {
  email?: string;
  username?: string;
  password?: string;
}

export function ConfirmOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as RegisterState | null) ?? {};
  const { email, username, password } = state;

  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState<ClassifiedError | null>(null);

  const expiry = useCountdown(OTP_LIFETIME_SECONDS);
  const resendCooldown = useCountdown(RESEND_COOLDOWN_SECONDS);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setFormError({ kind: 'generic', message: 'Missing email — start over from registration.' });
      return;
    }
    if (otp.length < 6) {
      setFormError({ kind: 'otp', message: 'Enter all 6 digits from your email.' });
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await authApi.confirmOtp({ email, otp });
      toast.success('Email verified — you can sign in now.');
      navigate('/login', { state: { email } });
    } catch (error) {
      setFormError(classifyError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || !username || !password) {
      setFormError({
        kind: 'generic',
        message: 'Missing your registration details — please register again.',
      });
      return;
    }

    setFormError(null);
    setIsResending(true);
    try {
      // No dedicated resend endpoint — calling register again with the same
      // details just refreshes the OTP on the existing pending user.
      await authApi.register({ email, username, password });
      toast.success('A new code is on its way.');
      setOtp('');
      expiry.restart();
      resendCooldown.restart();
    } catch (error) {
      setFormError(classifyError(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code we sent to ${email}.` : 'Enter the code we just sent to your inbox.'}
      footer={<AuthFooterLink prompt="Wrong email?" linkText="Register again" to="/register" />}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <AuthAlert error={formError} />}

        <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

        <div className="flex items-center justify-between rounded-md border border-ink-600 bg-ink-800/60 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-1.5 text-paper-500">
            <ShieldCheck className="size-4 text-gold-400" aria-hidden />
            {expiry.isExpired ? (
              <span className="text-crimson-400">Code expired</span>
            ) : (
              <>
                Expires in <span className="font-mono text-paper-100">{expiry.formatted}</span>
              </>
            )}
          </span>

          {resendCooldown.isExpired ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-gold-400 transition-colors hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? 'Sending…' : "Didn't get it? Resend"}
            </button>
          ) : (
            <span className="text-paper-500">
              Resend in <span className="font-mono">{resendCooldown.formatted}</span>
            </span>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Verify email
        </Button>
      </form>
    </AuthLayout>
  );
}
