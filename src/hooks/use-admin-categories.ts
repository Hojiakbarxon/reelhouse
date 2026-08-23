import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoriesApi } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoriesApi.list()).data.data,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => categoriesApi.create(payload),
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string } }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
