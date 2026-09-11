import { useQuery } from '@tanstack/react-query';
import { moviesApi, type MoviesQuery } from '@/api/movies';

export function useMovies(query: MoviesQuery) {
  return useQuery({
    queryKey: ['movies', 'list', query],
    queryFn: async () => (await moviesApi.list(query)).data.data,
    placeholderData: (prev) => prev,
  });
}

export function useSuggestedMovies(movieIds: string[]) {
  return useQuery({
    queryKey: ['movies', 'suggestions', movieIds],
    queryFn: async () => (await moviesApi.getSuggestions(movieIds)).data.data,
    enabled: movieIds.length > 0,
  });
}
