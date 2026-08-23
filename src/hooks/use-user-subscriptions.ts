import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userSubscriptionsApi } from '@/api/subscriptions';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/auth-store';
import { SubscriptionStatus } from '@/api/types';

export function useMySubscriptions() {
  const userId = useAuthStore((s) => s.userId);
  const isValid = useAuthStore((s) => s.isTokenValid());

  return useQuery({
    queryKey: ['user-subscriptions', 'mine', userId],
    queryFn: async () => (await userSubscriptionsApi.byUser(userId as string)).data.data,
    enabled: !!userId && isValid,
  });
}

export function usePurchasePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, autoRenew }: { planId: string; autoRenew?: boolean }) =>
      userSubscriptionsApi.purchase(planId, autoRenew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

// PATCH /user-subscriptions/:userSubId is ownership-guarded, not admin-only —
// the subscriber themselves can flip auto_renew or cancel their own plan.
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: SubscriptionStatus; auto_renew?: boolean };
    }) => userSubscriptionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
