import { api, type ApiEnvelope } from './client';
import type { Payment, PaymentMethod } from './types';

export const paymentsApi = {
  pay: (payload: { user_subscription_id: string; payment_method: PaymentMethod; payment_details?: Record<string, unknown> }) =>
    api.post<ApiEnvelope<Payment>>('/payments', payload),
  one: (paymentId: string) => api.get<ApiEnvelope<Payment>>(`/payments/${paymentId}`),
  refund: (paymentId: string) => api.patch<ApiEnvelope<Payment>>(`/payments/${paymentId}/refund`),
  listAll: () => api.get<ApiEnvelope<Payment[]>>('/payments'),
};


