import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The backend has no "list my payments" endpoint (GET /payments is
// admin/superadmin only), so the only way a regular user's browser can know
// a payment_id — to later request a refund — is to remember it from the
// moment they paid. This is a pragmatic client-side workaround, not a
// substitute for a real "my payments" endpoint.
interface PaymentsMapState {
  bySubscriptionId: Record<string, string>;
  record: (subscriptionId: string, paymentId: string) => void;
}

export const usePaymentsMap = create<PaymentsMapState>()(
  persist(
    (set) => ({
      bySubscriptionId: {},
      record: (subscriptionId, paymentId) =>
        set((s) => ({ bySubscriptionId: { ...s.bySubscriptionId, [subscriptionId]: paymentId } })),
    }),
    { name: 'movies-payments-map' },
  ),
);
