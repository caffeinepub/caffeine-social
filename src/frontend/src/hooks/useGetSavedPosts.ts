import { useQuery } from "@tanstack/react-query";
import type { PostView } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetSavedPosts() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PostView[]>({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedPosts();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
