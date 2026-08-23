import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { moviesApi } from '@/api/movies';
import { extractErrorMessage } from '@/api/client';

export function useCreateReview(movieId: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => moviesApi.createReview(movieId, payload),
    onSuccess: () => {
      toast.success('Review posted');
      queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'reviews', movieId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteReview(movieId: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => moviesApi.deleteReview(movieId, reviewId),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'reviews', movieId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
