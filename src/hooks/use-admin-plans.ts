import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subscriptionPlansApi, type CreatePlanPayload } from '@/api/subscriptions';
import { extractErrorMessage } from '@/api/client';

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'subscription-plans'],
    queryFn: async () => (await subscriptionPlansApi.listAll()).data.data,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => subscriptionPlansApi.create(payload),
    onSuccess: () => {
      toast.success('Plan created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePlanPayload> }) =>
      subscriptionPlansApi.update(id, payload),
    onSuccess: () => {
      toast.success('Plan updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionPlansApi.remove(id),
    onSuccess: () => {
      toast.success('Plan deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
