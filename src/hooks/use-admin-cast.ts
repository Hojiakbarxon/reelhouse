import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { moviesApi, type AddCastMemberPayload } from '@/api/movies';
import { extractErrorMessage } from '@/api/client';

export function useTmdbSearch(query: string) {
    return useQuery({
        queryKey: ['admin', 'tmdb', 'search', query],
        queryFn: async () => (await moviesApi.tmdbSearch(query)).data.results,
        enabled: query.trim().length > 1,
    });
}

export function useTmdbCast(movieId: string, enabled: boolean) {
    return useQuery({
        queryKey: ['admin', 'tmdb', 'cast', movieId],
        queryFn: async () => (await moviesApi.tmdbCast(movieId)).data,
        enabled,
    });
}

export function useConnectTmdb(movieId: string, slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tmdbId: number) => moviesApi.connectTmdb(movieId, tmdbId),
        onSuccess: () => {
            toast.success('Movie connected to TMDB');
            queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
    });
}

export function useAddCastMember(movieId: string, slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddCastMemberPayload) => moviesApi.addCastMember(movieId, payload),
        onSuccess: () => {
            toast.success('Actor added to cast');
            queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
    });
}

export function useAddCastMembersBulk(movieId: string, slug: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddCastMemberPayload[]) => moviesApi.addCastMembersBulk(movieId, payload),
        onSuccess: (response) => {
            const results = response.data.data.results;
            const added = results.filter((r) => r.status === 'added').length;
            const skipped = results.filter((r) => r.status === 'skipped').length;
            const failed = results.filter((r) => r.status === 'failed').length;
            const parts = [`Added ${added} actor${added === 1 ? '' : 's'}`];
            if (skipped) parts.push(`${skipped} already in cast`);
            if (failed) parts.push(`${failed} failed`);
            toast.success(parts.join(', '));
            queryClient.invalidateQueries({ queryKey: ['movies', 'detail', slug] });
        },
        onError: (error) => toast.error(extractErrorMessage(error)),
    });
}