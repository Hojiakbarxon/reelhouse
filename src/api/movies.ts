import { api, type ApiEnvelope } from './client';
import type {
  AdminMovieListItem,
  MovieDetail,
  MovieListItem,
  Paginated,
  Review,
  SubscriptionType,
  VideoQuality,
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

  addFile: (movieId: string, quality: VideoQuality, language: string | undefined, file: File) => {
    const form = new FormData();
    form.append('quality', quality);
    if (language) form.append('language', language);
    form.append('file', file);
    return api.post(`/admin/movies/${movieId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateFile: (fileId: string, payload: { quality?: VideoQuality; language?: string }) =>
    api.patch(`/admin/movies/files/${fileId}`, payload),

  removeFile: (fileId: string) => api.delete(`/admin/movies/files/${fileId}`),
};


