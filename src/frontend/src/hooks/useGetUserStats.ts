import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetUserStats(userPrincipal: Principal | string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ followers: bigint; following: bigint }>({
    queryKey: ["userStats", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal)
        throw new Error("Actor or user principal not available");
      const principal =
        typeof userPrincipal === "string"
          ? Principal.fromText(userPrincipal)
          : userPrincipal;
      return actor.getUserStats(principal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}
