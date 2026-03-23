import { useQuery } from "@tanstack/react-query";
import type { Notification } from "../backend";
import { useActor } from "./useActor";

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}
