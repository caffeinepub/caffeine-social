import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      media,
    }: { content: string; media: ExternalBlob | null }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPost(content, media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
