import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories';
import { useAuthStore } from '@/store/auth-store';

// GET /categories requires a logged-in user on this backend (AuthGuard is applied
// to the whole controller), so anonymous visitors simply don't get a category filter.
export function useCategories() {
  const isValid = useAuthStore((s) => s.isTokenValid());

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoriesApi.list()).data.data,
    enabled: isValid,
    staleTime: 5 * 60_000,
  });
}
