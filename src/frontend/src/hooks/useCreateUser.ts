import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCreateUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      try {
        await actor.createUser();
      } catch (e: any) {
        if (!String(e).includes("already exists")) throw e;
      }
    },
  });
}
