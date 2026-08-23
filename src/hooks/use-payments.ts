import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import type { PaymentMethod } from '@/api/types';

export function usePay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userSubscriptionId,
      paymentMethod,
      paymentDetails,
    }: {
      userSubscriptionId: string;
      paymentMethod: PaymentMethod;
      paymentDetails?: Record<string, unknown>;
    }) =>
      paymentsApi.pay({
        user_subscription_id: userSubscriptionId,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.refund(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// GET /payments/:payment_id is ownership-guarded, so the paying user can look
// up their own payment's full detail (amount, method, status, transaction id,
// and the payment_details they submitted) — there's just no "list mine"
// endpoint, hence the local subscription->payment id map elsewhere.
export function usePaymentDetail(paymentId: string | null) {
  return useQuery({
    queryKey: ['payments', 'detail', paymentId],
    queryFn: async () => (await paymentsApi.one(paymentId as string)).data.data,
    enabled: !!paymentId,
  });
}
