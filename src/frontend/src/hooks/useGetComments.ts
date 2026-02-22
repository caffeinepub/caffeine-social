import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Comment } from '../backend';

export function useGetComments(postId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !actorFetching,
  });
}
