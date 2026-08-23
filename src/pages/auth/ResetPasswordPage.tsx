import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { extractErrorMessage } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: prefillEmail, otp: '', password: '', repeat_password: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      await authApi.resetPassword(values);
      toast.success('Password updated — sign in with your new password.');
      navigate('/login', { state: { email: values.email } });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the code from your email along with a new password."
      footer={<AuthFooterLink prompt="Need a new code?" linkText="Resend" to="/forgot-password" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
          placeholder="e.g. 4821"
          error={errors.otp?.message}
          {...register('otp')}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Repeat new password"
          type="password"
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
