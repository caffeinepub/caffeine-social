import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetUserProfile(
  userPrincipal: Principal | string | undefined,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal)
        throw new Error("Actor or user principal not available");
      const principal =
        typeof userPrincipal === "string"
          ? Principal.fromText(userPrincipal)
          : userPrincipal;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
    retry: false,
  });
}
