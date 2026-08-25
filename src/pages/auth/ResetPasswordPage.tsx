import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { classifyError } from '@/lib/errors';
import type { ClassifiedError } from '@/lib/errors';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { AuthAlert } from '@/components/ui/AuthAlert';
import { useCountdown } from '@/hooks/use-countdown';

const OTP_LIFETIME_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [formError, setFormError] = useState<ClassifiedError | null>(null);
  const [isResending, setIsResending] = useState(false);

  const expiry = useCountdown(OTP_LIFETIME_SECONDS);
  const resendCooldown = useCountdown(RESEND_COOLDOWN_SECONDS);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: prefillEmail, otp: '', password: '', repeat_password: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null);
    try {
      await authApi.resetPassword(values);
      toast.success('Password updated — sign in with your new password.');
      navigate('/login', { state: { email: values.email } });
    } catch (error) {
      setFormError(classifyError(error));
    }
  }

  async function handleResend() {
    const email = getValues('email');
    if (!email) {
      setFormError({ kind: 'generic', message: 'Enter your email first.' });
      return;
    }
    setFormError(null);
    setIsResending(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success('A new code is on its way.');
      setValue('otp', '');
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
      title="Set a new password"
      subtitle="Enter the code from your email along with a new password."
      footer={<AuthFooterLink prompt="Need a new code?" linkText="Start over" to="/forgot-password" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError && <AuthAlert error={formError} />}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Reset code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="e.g. 482193"
          error={errors.otp?.message}
          {...register('otp')}
        />

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

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Repeat new password"
          autoComplete="new-password"
          error={errors.repeat_password?.message}
          {...register('repeat_password')}
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
