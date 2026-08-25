import { api, type ApiEnvelope } from './client';

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
    api.post<ApiEnvelope<LoginResponseData>>('/auth/login', payload),

  forgotPassword: (payload: ForgotPasswordPayload) => api.post('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) => api.post('/auth/reset-password', payload),
};


