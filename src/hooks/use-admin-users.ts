import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi, type CreateUserPayload } from '@/api/users';
import { extractErrorMessage } from '@/api/client';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await usersApi.list()).data.data,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createAdmin(payload),
    onSuccess: () => {
      toast.success('Admin created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
