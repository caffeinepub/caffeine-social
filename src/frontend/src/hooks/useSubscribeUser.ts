import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useSubscribeUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.subscribeUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
