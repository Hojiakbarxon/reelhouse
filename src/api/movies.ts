import { api, type ApiEnvelope } from './client';
import {
  SourceType,
  type AdminMovieListItem,
  type MovieDetail,
  type MovieListItem,
  type Paginated,
  type Review,
  type SubscriptionType,
  type SuggestedMovie,
  type VideoQuality,
} from './types';

export interface MoviesQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  subscription_type?: SubscriptionType | '';
}

export interface CreateMoviePayload {
  title: string;
  description?: string;
  release_year: number;
  duration_minutes: number;
  subscription_type?: SubscriptionType;
  category_ids: string[];
  rating?: number;
  poster?: File;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface AddCastMemberPayload {
  tmdbId: number;
  characterName: string;
  castOrder: number;
}

export interface BulkAddResult {
  tmdbId: number;
  status: 'added' | 'skipped' | 'failed';
  actorId?: string;
  reason?: string;
}

function toMovieFormData(payload: CreateMoviePayload | Partial<CreateMoviePayload>) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'category_ids') {
      form.append('category_ids', JSON.stringify(value));
    } else if (key === 'poster') {
      form.append('poster', value as File);
    } else {
      form.append(key, String(value));
    }
  });
  return form;
}

export const moviesApi = {
  list: (query: MoviesQuery) =>
    api.get<ApiEnvelope<Paginated<MovieListItem>>>('/movies', { params: query }),

  bySlug: (slug: string) => api.get<ApiEnvelope<MovieDetail>>(`/movies/${slug}`),

  createReview: (movieId: string, payload: { rating: number; comment: string }) =>
    api.post<ApiEnvelope<Review>>(`/movies/${movieId}/reviews`, payload),

  deleteReview: (movieId: string, reviewId: string) =>
    api.delete(`/movies/${movieId}/reviews/${reviewId}`),

  // --- admin ---
  adminList: () => api.get<ApiEnvelope<{ movies: AdminMovieListItem[]; total: number }>>('/admin/movies'),

  adminCreate: (payload: CreateMoviePayload) =>
    api.post('/admin/movies', toMovieFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  adminUpdate: (id: string, payload: Partial<CreateMoviePayload>) =>
    api.patch(`/admin/movies/${id}`, toMovieFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  adminDelete: (id: string) => api.delete(`/admin/movies/${id}`),

  addFile: (
    movieId: string,
    payload: {
      quality: VideoQuality;
      language?: string;
      sourceType: SourceType;
      externalUrl?: string;
      file?: File;
    },
  ) => {
    const form = new FormData();
    form.append('quality', payload.quality);
    if (payload.language) form.append('language', payload.language);
    form.append('source_type', payload.sourceType);

    if (payload.sourceType === SourceType.EXTERNAL) {
      form.append('external_url', payload.externalUrl ?? '');
    } else if (payload.file) {
      form.append('file', payload.file);
    }

    return api.post(`/admin/movies/${movieId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getSuggestions: (movieIds: string[]) =>
    api.get<ApiEnvelope<SuggestedMovie[]>>('/movies/suggestions/list', {
      params: { ids: movieIds.join(',') },
    }),

  updateFile: (fileId: string, payload: { quality?: VideoQuality; language?: string }) =>
    api.patch(`/admin/movies/files/${fileId}`, payload),

  removeFile: (fileId: string) => api.delete(`/admin/movies/files/${fileId}`),

  tmdbSearch: (query: string) =>
    api.get<{ results: TmdbSearchResult[] }>('/admin/movies/tmdb/search', { params: { query } }),

  tmdbCast: (movieId: string) => api.get<TmdbCastMember[]>(`/admin/movies/${movieId}/tmdb/cast`),

  connectTmdb: (movieId: string, tmdbId: number) =>
    api.patch<ApiEnvelope<Record<string, never>>>(`/admin/movies/${movieId}/tmdb`, { tmdbId }),

  addCastMember: (movieId: string, payload: AddCastMemberPayload) =>
    api.post<ApiEnvelope<{ actorId: string }>>(`/admin/movies/${movieId}/add-actor`, payload),

  addCastMembersBulk: (movieId: string, payload: AddCastMemberPayload[]) =>
    api.post<ApiEnvelope<{ results: BulkAddResult[] }>>(`/admin/movies/${movieId}/add-actors`, { actors: payload }),
};


