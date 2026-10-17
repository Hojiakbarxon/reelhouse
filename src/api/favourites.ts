import { api, type ApiEnvelope } from './client';
import type { FavouriteMovie } from './types';

export const favouritesApi = {
  list: () => api.get<ApiEnvelope<{ movies: FavouriteMovie[]; total: number }>>('/favourites'),
  add: (movie_id: string) => api.post('/favourites', { movie_id }),
  remove: (movieId: string) => api.delete(`/favourites/${movieId}`),
};


