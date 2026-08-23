import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies';

export function useMovieDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ['movies', 'detail', slug],
    queryFn: async () => (await moviesApi.bySlug(slug as string)).data.data,
    enabled: !!slug,
  });
}
