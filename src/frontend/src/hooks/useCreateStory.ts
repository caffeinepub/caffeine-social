import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      media,
      expirationHours,
    }: {
      media: ExternalBlob | null;
      expirationHours: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createStory(media, expirationHours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}
