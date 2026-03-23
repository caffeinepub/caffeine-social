import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StripeConfiguration } from "../backend";
import { useActor } from "./useActor";

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isStripeConfigured"] });
    },
  });
}
