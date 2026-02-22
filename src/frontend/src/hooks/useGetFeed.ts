import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PostView } from '../backend';

export function useGetFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}
