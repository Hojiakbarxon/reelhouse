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
    try {
      await authApi.register(values);
      // The OTP page needs username/password too, so its "resend code"
      // action can call the same /auth/register endpoint again — the
      // backend just refreshes the OTP on the existing pending user
      // rather than exposing a dedicated resend endpoint.
      navigate('/confirm-otp', { state: { ...values } });
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
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}


