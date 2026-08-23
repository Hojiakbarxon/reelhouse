import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { otpSchema, type OtpFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { extractErrorMessage } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ConfirmOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: prefillEmail, otp: '' },
  });

  async function onSubmit(values: OtpFormValues) {
    try {
      await authApi.confirmOtp(values);
      toast.success('Email verified — you can sign in now.');
      navigate('/login', { state: { email: values.email } });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the code we just sent to your inbox."
      footer={<AuthFooterLink prompt="Didn't get a code?" linkText="Register again" to="/register" />}
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
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="e.g. 4821"
          error={errors.otp?.message}
          {...register('otp')}
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Verify email
        </Button>
      </form>
    </AuthLayout>
  );
}
