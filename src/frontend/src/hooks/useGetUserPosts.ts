import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import type { PostView } from "../backend";
import { useActor } from "./useActor";

export function useGetUserPosts(userPrincipal: Principal | string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ["userPosts", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      const principal =
        typeof userPrincipal === "string"
          ? Principal.fromText(userPrincipal)
          : userPrincipal;
      return actor.getUserPosts(principal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}
