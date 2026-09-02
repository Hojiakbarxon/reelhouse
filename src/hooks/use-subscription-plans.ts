import { useQuery } from '@tanstack/react-query';
import { subscriptionPlansApi } from '@/api/subscriptions';

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => (await subscriptionPlansApi.listActive()).data.data,
    staleTime: 5 * 60_000,
  });
}