import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { loginSchema, type LoginFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { classifyError } from '@/lib/errors';
import type { ClassifiedError } from '@/lib/errors';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { AuthAlert } from '@/components/ui/AuthAlert';
import { Link } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const state = location.state as { email?: string; from?: Location } | null;
  const [formError, setFormError] = useState<ClassifiedError | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: state?.email ?? '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const response = await authApi.login(values);
      setToken(response.data.data.authToken);
      toast.success('Welcome back!');
      const redirectTo = state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(classifyError(error));
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue watching."
      footer={<AuthFooterLink prompt="New to Reelhouse?" linkText="Create an account" to="/register" />}
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
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="-mt-1 flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-paper-500 hover:text-gold-400">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
