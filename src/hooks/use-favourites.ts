import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { favouritesApi } from '@/api/favourites';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/auth-store';

export function useFavourites() {
  const isValid = useAuthStore((s) => s.isTokenValid());

  return useQuery({
    queryKey: ['favourites'],
    queryFn: async () => (await favouritesApi.list()).data.data,
    enabled: isValid,
  });
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (movieId: string) => favouritesApi.add(movieId),
    onSuccess: () => {
      toast.success('Added to My List');
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (movieId: string) => favouritesApi.remove(movieId),
    onSuccess: () => {
      toast.success('Removed from My List');
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return { add, remove };
}


