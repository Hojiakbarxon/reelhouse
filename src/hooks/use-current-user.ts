import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/store/auth-store';

export function useCurrentUser() {
  const userId = useAuthStore((s) => s.userId);
  const isValid = useAuthStore((s) => s.isTokenValid());

  return useQuery({
    queryKey: ['users', 'me', userId],
    queryFn: async () => (await usersApi.me(userId as string)).data.data,
    enabled: !!userId && isValid,
    staleTime: 60_000,
  });
}
