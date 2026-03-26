import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Copy,
  ExternalLink,
  Film,
  Grid3X3,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import { useActor } from "../hooks/useActor";
import { useFollowUser } from "../hooks/useFollowUser";
import { useGetUserPosts } from "../hooks/useGetUserPosts";
import { useGetUserProfile } from "../hooks/useGetUserProfile";
import { useGetUserStats } from "../hooks/useGetUserStats";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUnfollowUser } from "../hooks/useUnfollowUser";

const GRADIENT_PLACEHOLDERS = [
  "from-violet-900 to-pink-700",
  "from-blue-900 to-cyan-600",
  "from-rose-900 to-orange-600",
  "from-emerald-900 to-teal-600",
  "from-amber-900 to-yellow-600",
  "from-indigo-900 to-violet-600",
];

function PostGrid({ posts }: { posts: PostView[] }) {
  if (posts.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="user_profile.empty_state"
      >
        <Grid3X3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-semibold">No posts yet</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-0.5" data-ocid="user_profile.list">
      {posts.map((post, idx) => (
        <div
          key={post.id.toString()}
          className="aspect-square overflow-hidden group cursor-pointer relative"
          data-ocid={`user_profile.item.${idx + 1}`}
        >
          {post.media ? (
            <img
              src={post.media.getDirectURL()}
              alt="Post"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length]} flex items-center justify-center`}
            >
              <p className="text-white text-xs text-center px-2 line-clamp-3 font-medium">
                {post.content}
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-bold">
              ❤️ {post.likes.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserProfilePage({ userId }: { userId: string }) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();

  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(userId);
  } catch {
    principal = null;
  }

  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile(
    principal ?? undefined,
  );
  const { data: userPosts = [], isLoading: postsLoading } = useGetUserPosts(
    principal ?? undefined,
  );
  const { data: userStats, isLoading: statsLoading } = useGetUserStats(
    principal ?? undefined,
  );

  const { data: isFollowingUser, refetch: refetchFollowing } = useQuery({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!actor || !principal) return false;
      return actor.isFollowing(principal);
    },
    enabled: !!actor && !actorFetching && !!identity && !!principal,
  });

  const { mutate: followUser, isPending: followPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: unfollowPending } =
    useUnfollowUser();
  const followLoading = followPending || unfollowPending;

  const handleFollow = () => {
    if (!identity) {
      toast.error("Please log in to follow users");
      return;
    }
    if (!principal) return;
    if (isFollowingUser) {
      unfollowUser(principal, {
        onSuccess: () => {
          toast.success("Unfollowed");
          refetchFollowing();
        },
        onError: () => toast.error("Action failed"),
      });
    } else {
      followUser(principal, {
        onSuccess: () => {
          toast.success("Following!");
          refetchFollowing();
        },
        onError: () => toast.error("Action failed"),
      });
    }
  };

  const handleMessage = () => {
    navigate({ to: "/messages" });
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success("ID copied!");
    } catch {
      toast.error("Could not copy ID");
    }
  };

  if (!principal) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-semibold">Invalid user ID</p>
      </div>
    );
  }

  const isLoading = profileLoading || postsLoading || statsLoading;
  const username = userProfile?.username ?? `${userId.slice(0, 12)}...`;
  const followersCount = userStats ? Number(userStats.followers) : 0;
  const followingCount = userStats ? Number(userStats.following) : 0;
  const reelPosts = userPosts.filter((p) => !!p.media);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto" data-ocid="user_profile.loading_state">
        <div className="h-32 bg-muted animate-pulse" />
        <div className="px-4 -mt-12 pb-4">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto" data-ocid="user_profile.page">
      {/* Cover */}
      <div className="h-32 gradient-bg w-full" />

      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="story-ring w-24 h-24">
            <div className="story-ring-inner w-full h-full">
              <Avatar className="w-full h-full">
                {userProfile?.profilePhoto && (
                  <AvatarImage src={userProfile.profilePhoto} alt={username} />
                )}
                <AvatarFallback className="gradient-bg text-white text-2xl font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Name & bio */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">{username}</h1>
          {userProfile?.bio && (
            <p className="text-sm mt-1 text-muted-foreground">
              {userProfile.bio}
            </p>
          )}
          {userProfile?.website && (
            <a
              href={userProfile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline mt-0.5"
            >
              <ExternalLink className="w-3 h-3" />
              {userProfile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {userId.slice(0, 20)}...
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-4">
          <div className="text-center">
            <p className="text-xl font-bold">{userPosts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{followersCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{followingCount}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleFollow}
            disabled={followLoading}
            className={`flex-1 ${
              isFollowingUser
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "gradient-bg text-white border-0 hover:opacity-90"
            }`}
            data-ocid="user_profile.primary_button"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {isFollowingUser ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-border"
            onClick={handleMessage}
            data-ocid="user_profile.secondary_button"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyId}
            aria-label="Copy ID"
            data-ocid="user_profile.button"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto px-0">
          <TabsTrigger
            value="posts"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="user_profile.tab"
          >
            <Grid3X3 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="reels"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="user_profile.tab"
          >
            <Film className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-0">
          <PostGrid posts={userPosts} />
        </TabsContent>
        <TabsContent value="reels" className="mt-0">
          <PostGrid posts={reelPosts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
