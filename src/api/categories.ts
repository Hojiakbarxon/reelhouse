import { api, type ApiEnvelope } from './client';
import type { Category } from './types';

export const categoriesApi = {
  list: () => api.get<ApiEnvelope<Category[]>>('/categories'),
  one: (id: string) => api.get<ApiEnvelope<Category>>(`/categories/${id}`),
  create: (payload: { name: string; description?: string }) =>
    api.post<ApiEnvelope<Category>>('/categories', payload),
  update: (id: string, payload: { name?: string; description?: string }) =>
    api.patch<ApiEnvelope<Category>>(`/categories/${id}`, payload),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
