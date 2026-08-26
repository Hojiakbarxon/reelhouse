import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { registerSchema, type RegisterFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { classifyError } from '@/lib/errors';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { AuthAlert } from '@/components/ui/AuthAlert';
import type { ClassifiedError } from '@/lib/errors';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<ClassifiedError | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    // agreeToTerms is a frontend-only gate — the backend's RegisterDto
    // doesn't (and shouldn't) know about it, and forbidNonWhitelisted would
    // reject the request if it were included, so it must not be sent.
    const { agreeToTerms: _agreeToTerms, ...registerPayload } = values;
    try {
      await authApi.register(registerPayload);
      // The OTP page needs username/password too, so its "resend code"
      // action can call the same /auth/register endpoint again — the
      // backend just refreshes the OTP on the existing pending user
      // rather than exposing a dedicated resend endpoint.
      navigate('/confirm-otp', { state: { ...registerPayload } });
    } catch (error) {
      setFormError(classifyError(error));
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Reelhouse to start building your watchlist."
      footer={<AuthFooterLink prompt="Already have an account?" linkText="Sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError && <AuthAlert error={formError} />}
        <Input
          label="Username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <label className="flex items-start gap-2.5 text-sm text-paper-300">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-ink-600 bg-ink-800 accent-gold-400"
            {...register('agreeToTerms')}
          />
          <span>
            I agree that Reelhouse may use my account information (username and email) solely to
            operate this website — signing me in, delivering content, and essential service
            communications. My information won't be sold or shared with third parties.
          </span>
        </label>
        {errors.agreeToTerms && <p className="-mt-2 text-sm text-crimson-400">{errors.agreeToTerms.message}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}