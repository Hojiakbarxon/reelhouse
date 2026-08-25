import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';

// The backend mounts everything under a global "/api" prefix
// (see main.ts -> app.setGlobalPrefix("api")).
const API_ROOT = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_ROOT}/api`,
});

// Attach the bearer token to every request. The backend's AuthGuard reads
// `Authorization: Bearer <token>` — it does NOT use the refresh cookie for
// route protection, so we don't need withCredentials here.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend's global exception filter always returns
// { statusCode, message, data }, where message can be a string or string[].
export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  data?: unknown;
}

// Every successful controller response is wrapped the same way
// (see Isuccess in the backend's utils/success-response-interface.ts).
export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorShape | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(', ') : body.message;
    }
    if (error.message) return error.message;
  }
  return 'Something went wrong. Please try again.';
}

// On 401, the access token is invalid/expired. This backend does not expose
// a refresh endpoint, so the correct move is to sign the user out locally
// and send them to log in again — silently retrying would just loop.
//
// On 429, the shared ThrottlerGuard has kicked in — surface a friendly toast
// everywhere except the auth pages, which already render their own inline
// AuthAlert for the same response.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      if (error.response?.status === 429 && !error.config?.url?.includes('/auth/')) {
        toast.error("You're doing that a bit too fast — give it a few seconds and try again.");
      }
    }
    return Promise.reject(error);
  },
);


