import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
