import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, content);
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this specific post
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId.toString()] });
      // Also invalidate the feed to update comment counts on PostCard
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
