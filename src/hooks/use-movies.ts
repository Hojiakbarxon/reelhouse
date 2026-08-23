import { useQuery } from '@tanstack/react-query';
import { moviesApi, type MoviesQuery } from '@/api/movies';

export function useMovies(query: MoviesQuery) {
  return useQuery({
    queryKey: ['movies', 'list', query],
    queryFn: async () => (await moviesApi.list(query)).data.data,
    placeholderData: (prev) => prev,
  });
}
