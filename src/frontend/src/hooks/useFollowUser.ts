import type { Principal } from "@dfinity/principal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useFollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Not connected");
      try {
        await actor.createUser();
      } catch {}
      await actor.followUser(principal);
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ["isFollowing", p.toString()] });
      qc.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}
