import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { extractErrorMessage } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await authApi.forgotPassword(values);
      toast.success('A reset code has been sent to your email.');
      navigate('/reset-password', { state: { email: values.email } });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a code."
      footer={<AuthFooterLink prompt="Remembered it?" linkText="Back to sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Send reset code
        </Button>
      </form>
    </AuthLayout>
  );
}
