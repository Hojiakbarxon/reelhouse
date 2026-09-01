import { useQuery } from '@tanstack/react-query';
import { actorsApi } from '@/api/actors';

export function useActorDetail(actorId: string | undefined) {
    return useQuery({
        queryKey: ['actors', 'detail', actorId],
        queryFn: async () => (await actorsApi.get(actorId as string)).data.data,
        enabled: !!actorId,
    });
}