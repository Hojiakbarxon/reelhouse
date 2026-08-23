import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AuthLayout, AuthFooterLink } from './AuthLayout';
import { registerSchema, type RegisterFormValues } from './schemas';
import { authApi } from '@/api/auth';
import { extractErrorMessage } from '@/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await authApi.register(values);
      toast.success('Account created — check your email for a verification code.');
      navigate('/confirm-otp', { state: { email: values.email } });
    } catch (error) {
      // A 409 here means the email or username is already taken.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('That email or username is already registered.');
        return;
      }
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Reelhouse to start building your watchlist."
      footer={<AuthFooterLink prompt="Already have an account?" linkText="Sign in" to="/login" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
        <Input
          label="Password"
          type="password"
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
