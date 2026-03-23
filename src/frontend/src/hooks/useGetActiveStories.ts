import { useQuery } from "@tanstack/react-query";
import type { StoryView } from "../backend";
import { useActor } from "./useActor";

export function useGetActiveStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryView[]>({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 60000, // Refresh every minute
  });
}
