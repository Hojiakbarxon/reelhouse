import { api, type ApiEnvelope } from './client';
import type { PaginatedUsers, User, UserRole } from './types';

export interface UpdateProfilePayload {
  full_name?: string;
  country?: string;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  role?: UserRole | '';
  search?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  avatar?: File;
}

function toUserFormData(payload: CreateUserPayload | Partial<CreateUserPayload>) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'avatar') form.append('avatar', value as File);
    else form.append(key, String(value));
  });
  return form;
}

export const usersApi = {
  me: (userId: string) => api.get<ApiEnvelope<User>>(`/users/${userId}`),
  updateAccount: (userId: string, payload: { username?: string; avatar?: File }) =>
    api.patch(`/users/${userId}`, toUserFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProfile: (userId: string, payload: UpdateProfilePayload) =>
    api.patch(`/users/${userId}/profile`, payload),

  // --- admin ---
  list: (query: UsersQuery = {}) =>
    api.get<ApiEnvelope<PaginatedUsers>>('/users', { params: query }),
  create: (payload: CreateUserPayload) =>
    api.post('/users', toUserFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } }),
  createAdmin: (payload: CreateUserPayload) =>
    api.post('/users/admin', toUserFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (userId: string) => api.delete(`/users/${userId}`),
};


