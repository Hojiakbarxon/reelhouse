import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { moviesApi, type CreateMoviePayload } from '@/api/movies';
import { extractErrorMessage } from '@/api/client';
import type { VideoQuality } from '@/api/types';

export function useAdminMovies() {
  return useQuery({
    queryKey: ['admin', 'movies'],
    queryFn: async () => (await moviesApi.adminList()).data.data,
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMoviePayload) => moviesApi.adminCreate(payload),
    onSuccess: () => {
      toast.success('Movie created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'list'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMoviePayload> }) =>
      moviesApi.adminUpdate(id, payload),
    onSuccess: () => {
      toast.success('Movie updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moviesApi.adminDelete(id),
    onSuccess: () => {
      toast.success('Movie deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useAddMovieFile(movieId: string, slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quality, language, file }: { quality: VideoQuality; language?: string; file: File }) =>
      moviesApi.addFile(movieId, quality, language, file),
    onSuccess: () => {
      toast.success('File added');
      queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRemoveMovieFile(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => moviesApi.removeFile(fileId),
    onSuccess: () => {
      toast.success('File removed');
      queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}


