import { api, type ApiEnvelope } from "@/api/client";


export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface ConfirmOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  authToken: string;
  refreshToken: string;
}

// Returned by POST /auth/login instead of tokens when the account has 2FA on.
export interface TwoFactorChallengeData {
  twoFactorRequired: true;
  twoFactorToken: string;
}

// Returned by POST /auth/2fa/enable. The secret is shown ONCE — the backend
// only keeps an encrypted copy and never returns it again.
export interface TwoFactorEnableData {
  secret: string;
  otpauthUrl: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  repeat_password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
  confirmOtp: (payload: ConfirmOtpPayload) => api.post('/auth/confirm-otp', payload),
  login: (payload: LoginPayload) =>
    api.post<ApiEnvelope<LoginResponseData | TwoFactorChallengeData>>('/auth/login', payload),
  forgotPassword: (payload: ForgotPasswordPayload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordPayload) => api.post('/auth/reset-password', payload),
  // --- two-factor authentication ---
  enableTwoFactor: () => api.post<ApiEnvelope<TwoFactorEnableData>>('/auth/2fa/enable'),
  confirmTwoFactor: (otp: string) => api.post('/auth/2fa/enable/check-otp', { otp }),
  loginWithTwoFactor: (otp: string, twoFactorToken: string) =>
    api.post<ApiEnvelope<LoginResponseData>>(
      '/auth/2fa/login',
      { otp },
      { headers: { 'two-factor-token': `Bearer ${twoFactorToken}` } },
    ),
  disableTwoFactor: (otp: string) => api.post('/auth/2fa/disable', { otp }),
  refresh: () => api.post<ApiEnvelope<{ authToken: string }>>('/auth/refresh'),
};
