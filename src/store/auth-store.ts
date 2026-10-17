import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AccessTokenPayload } from '@/api/types';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  /**
   * "Is there a signed-in session?" — true while we hold a readable access
   * token, EVEN IF that token has expired.
   *
   * The 1-day access token is only the short-lived half of the session. The
   * 7-day refresh token lives in an httpOnly cookie that JavaScript can't see,
   * so the only way to know it is still good is to try it. We therefore keep
   * treating the user as signed in after the access token expires, and let the
   * API client (src/api/client.ts) silently swap in a new one. The user is only
   * signed out when that refresh actually fails.
   * (Name kept so existing guards/hooks keep working unchanged.)
   */
  isTokenValid: () => boolean;
  /** True when the access token is expired (or expires within `skewSeconds`). */
  isAccessTokenExpired: (skewSeconds?: number) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,

      setToken: (token: string) => {
        const payload = jwtDecode<AccessTokenPayload>(token);
        set({ accessToken: token, userId: payload.id });
      },

      logout: () => set({ accessToken: null, userId: null }),

      isTokenValid: () => {
        const { accessToken } = get();
        if (!accessToken) return false;
        try {
          jwtDecode<AccessTokenPayload>(accessToken); // must at least be a readable JWT
          return true;
        } catch {
          return false;
        }
      },

      isAccessTokenExpired: (skewSeconds = 30) => {
        const { accessToken } = get();
        if (!accessToken) return false; // nothing to refresh
        try {
          const { exp } = jwtDecode<AccessTokenPayload>(accessToken);
          return exp * 1000 - skewSeconds * 1000 <= Date.now();
        } catch {
          return true;
        }
      },
    }),
    { name: 'movies-auth' },
  ),
);
