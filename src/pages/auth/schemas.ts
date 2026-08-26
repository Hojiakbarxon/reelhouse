import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(32, 'Too long'),
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: 'You must agree before creating an account',
  }),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  email: z.email('Enter a valid email'),
  otp: z.string().min(4, 'Enter the code from your email'),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.email('Enter a valid email'),
    otp: z.string().min(4, 'Enter the code from your email'),
    password: z.string().min(6, 'At least 6 characters'),
    repeat_password: z.string().min(6, 'At least 6 characters'),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "Passwords don't match",
    path: ['repeat_password'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;


