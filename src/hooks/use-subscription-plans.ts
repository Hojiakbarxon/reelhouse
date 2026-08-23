import { useQuery } from '@tanstack/react-query';
import { subscriptionPlansApi } from '@/api/subscriptions';
import { useAuthStore } from '@/store/auth-store';

// GET /subscription-plans requires a logged-in user on this backend too.
export function useSubscriptionPlans() {
  const isValid = useAuthStore((s) => s.isTokenValid());

  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => (await subscriptionPlansApi.listActive()).data.data,
    enabled: isValid,
    staleTime: 5 * 60_000,
  });
}
