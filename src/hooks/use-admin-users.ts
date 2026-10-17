import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi, type CreateUserPayload, type UsersQuery } from '@/api/users';
import { extractErrorMessage } from '@/api/client';

export function useAdminUsers(query: UsersQuery = {}) {
  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: async () => (await usersApi.list(query)).data.data,
    placeholderData: (prev) => prev,   
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


