import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}
