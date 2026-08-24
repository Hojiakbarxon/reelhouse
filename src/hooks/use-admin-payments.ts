import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/api/payments';
import { extractErrorMessage } from '@/api/client';

// GET /payments (all of them) is @Roles(SUPERADMIN, ADMIN) on the backend.
export function useAdminPayments() {
  return useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => (await paymentsApi.listAll()).data.data,
  });
}

// Refund is ownership-guarded; admins/superadmins bypass ownership, so this
// works for any user's payment, not just the admin's own.
export function useAdminRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.refund(paymentId),
    onSuccess: () => {
      toast.success('Payment refunded');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-subscriptions'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
