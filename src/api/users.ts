import { api, type ApiEnvelope } from './client';
import type { User } from './types';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  country?: string;
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
  updateAccount: (userId: string, payload: { username?: string; email?: string; avatar?: File }) =>
    api.patch(`/users/${userId}`, toUserFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProfile: (userId: string, payload: UpdateProfilePayload) =>
    api.patch(`/users/${userId}/profile`, payload),

  // --- admin ---
  list: () => api.get<ApiEnvelope<User[]>>('/users'),
  create: (payload: CreateUserPayload) =>
    api.post('/users', toUserFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } }),
  createAdmin: (payload: CreateUserPayload) =>
    api.post('/users/admin', toUserFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (userId: string) => api.delete(`/users/${userId}`),
};
