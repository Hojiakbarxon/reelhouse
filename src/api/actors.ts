import { api, type ApiEnvelope } from './client';
import type { ActorDetail } from './types';

export const actorsApi = {
    get: (actorId: string) => api.get<ApiEnvelope<ActorDetail>>(`/users/actors/${actorId}`),
};