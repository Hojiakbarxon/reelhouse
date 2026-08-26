import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AccessTokenPayload } from '@/api/types';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isTokenValid: () => boolean;
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
          const { exp } = jwtDecode<AccessTokenPayload>(accessToken);
          return exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
    }),
    { name: 'movies-auth' },
  ),
);