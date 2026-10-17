import { useAuthStore } from '@/store/auth-store';
import axios from 'axios';
import toast from 'react-hot-toast';

// The backend mounts everything under a global "/api" prefix
// (see main.ts -> app.setGlobalPrefix("api")).
const API_ROOT = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  // Needed so the browser sends/receives the httpOnly refreshToken cookie
  // set by POST /auth/login and read by POST /auth/refresh. Requires the
  // backend's CORS to use an explicit origin + credentials: true (never '*'),
  // and the cookie itself needs sameSite: 'none' since frontend and backend
  // are on different domains.
  withCredentials: true,
});

// Endpoints that never need a session. Calling these must not trigger a refresh.
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/confirm-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/2fa/login',
];

// Attach the bearer token to every request. If the 1-day access token has
// already expired (or is about to), swap it for a fresh one FIRST using the
// refresh-token cookie, so the real request goes out with a valid token instead
// of failing with a 401 and being retried.
api.interceptors.request.use(async (config) => {
  const url = config.url ?? '';
  const isPublic = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

  if (!isPublic && useAuthStore.getState().isAccessTokenExpired()) {
    await refreshAccessToken(); // on failure this logs the user out
  }

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

// Silent access-token refresh, de-duplicated so several concurrent 401s only
// trigger one network call. Uses a bare axios call (not the `api` instance)
// to avoid re-entering these same interceptors.
let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiEnvelope<{ authToken: string }>>(`${API_ROOT}/api/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const newToken = res.data.data.authToken;
        useAuthStore.getState().setToken(newToken);
        return newToken;
      })
      .catch(() => {
        useAuthStore.getState().logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const originalRequest = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');
    const isAuthCall = originalRequest?.url?.includes('/auth/');

    // On a genuine 401, try one silent refresh — but only if we actually had
    // a session to refresh — and retry the original request once. If the
    // refresh itself fails, the user is already logged out inside
    // refreshAccessToken().
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isRefreshCall &&
      useAuthStore.getState().accessToken
    ) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    } else if (status === 401) {
      useAuthStore.getState().logout();
    }

    // The shared ThrottlerGuard kicked in — surface a friendly toast
    // everywhere except the auth pages, which render their own inline alert.
    if (status === 429 && !isAuthCall) {
      toast.error("You're doing that a bit too fast — give it a few seconds and try again.");
    }

    return Promise.reject(error);
  },
);