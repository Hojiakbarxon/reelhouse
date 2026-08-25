import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies';

export function useMovieDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ['movies', 'detail', slug],
    queryFn: async () => (await moviesApi.bySlug(slug as string)).data.data,
    enabled: !!slug,
    // Hitting this endpoint is what increments view_count on the backend, so
    // a cached response (even a fresh-looking one) would understate it on
    // repeat visits. Always hit the network on mount.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}


