import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userSubscriptionsApi } from '@/api/subscriptions';
import { extractErrorMessage } from '@/api/client';
import type { SubscriptionStatus } from '@/api/types';

// GET /user-subscriptions (all of them) is @Roles(SUPERADMIN, ADMIN) on the
// backend — both roles can see every subscriber's subscriptions here.
export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ['admin', 'user-subscriptions'],
    queryFn: async () => (await userSubscriptionsApi.listAll()).data.data,
  });
}

// PATCH is ownership-guarded, and admins/superadmins bypass ownership — so an
// admin can correct or cancel any user's subscription from here too.
export function useAdminUpdateSubscription() {
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
      toast.success('Subscription updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-subscriptions'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

// DELETE /user-subscriptions/:id is @Roles(SUPERADMIN, ADMIN) — a hard delete,
// distinct from canceling (status update above).
export function useAdminDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userSubscriptionsApi.remove(id),
    onSuccess: () => {
      toast.success('Subscription deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-subscriptions'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}


