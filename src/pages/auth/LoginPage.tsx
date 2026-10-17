import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout, AuthFooterLink } from "./AuthLayout";
import { loginSchema, type LoginFormValues } from "./schemas";
import { classifyError } from "@/lib/errors";
import type { ClassifiedError } from "@/lib/errors";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { AuthAlert } from "@/components/ui/AuthAlert";
import { Link } from "react-router-dom";
import { TwoFactorLoginStep } from "./TwoFactorLoginStep";
import { authApi, type TwoFactorChallengeData } from "@/hooks/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const state = location.state as { email?: string; from?: Location } | null;
  const [formError, setFormError] = useState<ClassifiedError | null>(null);
  // Set when the backend answers login with { twoFactorRequired, twoFactorToken }
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: state?.email ?? "", password: "" },
  });

  function completeSignIn(authToken: string) {
    setToken(authToken);
    toast.success("Welcome back!");
    const redirectTo = state?.from?.pathname ?? "/";
    navigate(redirectTo, { replace: true });
  }

  function handleTwoFactorBack(message?: string) {
    setTwoFactorToken(null);
    setFormError(message ? { kind: "generic", message } : null);
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const response = await authApi.login(values);
      const data = response.data.data;

      // Account has 2FA on: no tokens yet — ask for the authenticator code.
      if (
        "twoFactorRequired" in data &&
        (data as TwoFactorChallengeData).twoFactorRequired
      ) {
        setTwoFactorToken((data as TwoFactorChallengeData).twoFactorToken);
        return;
      }

      completeSignIn((data as { authToken: string }).authToken);
    } catch (error) {
      setFormError(classifyError(error));
    }
  }

  if (twoFactorToken) {
    return (
      <AuthLayout
        title="Two-step verification"
        subtitle="Enter the code from your authenticator app to finish signing in."
      >
        <TwoFactorLoginStep
          twoFactorToken={twoFactorToken}
          onSuccess={completeSignIn}
          onBack={handleTwoFactorBack}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue watching."
      footer={
        <AuthFooterLink
          prompt="New to Reelhouse?"
          linkText="Create an account"
          to="/register"
        />
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {formError && <AuthAlert error={formError} />}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="-my-2 inline-block py-2 text-sm font-medium text-paper-500 hover:text-gold-400 active:text-gold-400"
          >
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
