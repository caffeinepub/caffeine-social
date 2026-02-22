import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useViewStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.viewStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeStories'] });
    },
  });
}
