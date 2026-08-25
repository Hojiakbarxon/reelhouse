import { api, type ApiEnvelope } from './client';
import type { SubscriptionPlan, UserSubscription } from './types';

export interface CreatePlanPayload {
  name: string;
  price: number;
  duration_days: number;
  features?: string[];
  is_active?: boolean;
}

export const subscriptionPlansApi = {
  listActive: () => api.get<ApiEnvelope<SubscriptionPlan[]>>('/subscription-plans'),
  listAll: () => api.get<ApiEnvelope<SubscriptionPlan[]>>('/subscription-plans/all'),
  one: (id: string) => api.get<ApiEnvelope<SubscriptionPlan>>(`/subscription-plans/${id}`),
  create: (payload: CreatePlanPayload) => api.post<ApiEnvelope<SubscriptionPlan>>('/subscription-plans', payload),
  update: (id: string, payload: Partial<CreatePlanPayload>) =>
    api.patch<ApiEnvelope<SubscriptionPlan>>(`/subscription-plans/${id}`, payload),
  remove: (id: string) => api.delete(`/subscription-plans/${id}`),
};

export const userSubscriptionsApi = {
  purchase: (plan_id: string, auto_renew?: boolean) =>
    api.post<ApiEnvelope<UserSubscription>>('/user-subscriptions/purchase', { plan_id, auto_renew }),
  byUser: (userId: string) =>
    api.get<ApiEnvelope<UserSubscription[]>>(`/user-subscriptions/user/${userId}`),
  one: (userSubId: string) => api.get<ApiEnvelope<UserSubscription>>(`/user-subscriptions/${userSubId}`),
  update: (userSubId: string, payload: { status?: string; auto_renew?: boolean }) =>
    api.patch<ApiEnvelope<UserSubscription>>(`/user-subscriptions/${userSubId}`, payload),
  remove: (id: string) => api.delete(`/user-subscriptions/${id}`),
  listAll: () => api.get<ApiEnvelope<UserSubscription[]>>('/user-subscriptions'),
};


