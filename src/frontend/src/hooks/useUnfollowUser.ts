import type { Principal } from "@dfinity/principal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useUnfollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.unfollowUser(principal);
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", p.toString()] });
      qc.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}
