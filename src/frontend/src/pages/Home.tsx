import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import StoryViewer from "../components/StoryViewer";
import { useGetActiveStories } from "../hooks/useGetActiveStories";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useGetFeed } from "../hooks/useGetFeed";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const DEMO_NAMES: Record<string, string> = {};
const DEMO_STORY_USERS = [
  { name: "Sarah K.", initial: "SK" },
  { name: "Ali Hassan", initial: "AH" },
  { name: "Priya M.", initial: "PM" },
  { name: "Jake T.", initial: "JT" },
  { name: "Luna B.", initial: "LB" },
  { name: "Omar F.", initial: "OF" },
];

export default function Home() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: posts = [], isLoading: postsLoading } = useGetFeed();
  const { data: stories = [] } = useGetActiveStories();

  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const isAuthenticated = !!identity;
  const myInitial = userProfile?.username?.slice(0, 2).toUpperCase() ?? "?";

  const openStory = (idx: number) => {
    if (stories.length === 0) return;
    setStoryIndex(idx);
    setStoryViewerOpen(true);
  };

  return (
    <div className="max-w-[468px] mx-auto">
      {/* Stories Bar */}
      <div className="flex items-center gap-3 px-3 py-3 overflow-x-auto scrollbar-none border-b border-border">
        {/* My story / add button */}
        <button
          type="button"
          onClick={() => navigate({ to: "/stories" })}
          className="flex flex-col items-center gap-1 flex-shrink-0"
          data-ocid="stories.open_modal_button"
        >
          <div className="relative">
            <div className="story-ring w-16 h-16">
              <div className="story-ring-inner w-full h-full">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="gradient-bg text-white font-bold">
                    {myInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 gradient-bg rounded-full flex items-center justify-center border-2 border-background">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
            {userProfile?.username ?? "Your story"}
          </span>
        </button>

        {/* Active stories */}
        {stories.length > 0
          ? stories.slice(0, 8).map((story, idx) => (
              <button
                key={story.id.toString()}
                type="button"
                onClick={() => openStory(idx)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
                data-ocid={`stories.item.${idx + 1}`}
              >
                <div className="story-ring w-16 h-16">
                  <div className="story-ring-inner w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarFallback className="gradient-bg text-white text-sm font-bold">
                        {
                          DEMO_STORY_USERS[idx % DEMO_STORY_USERS.length]
                            .initial
                        }
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
                  {DEMO_STORY_USERS[idx % DEMO_STORY_USERS.length].name}
                </span>
              </button>
            ))
          : DEMO_STORY_USERS.map((user, idx) => (
              <button
                key={user.name}
                type="button"
                onClick={() => navigate({ to: "/stories" })}
                className="flex flex-col items-center gap-1 flex-shrink-0"
                data-ocid={`stories.item.${idx + 1}`}
              >
                <div className="story-ring w-16 h-16">
                  <div className="story-ring-inner w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarFallback
                        className="text-white text-sm font-bold"
                        style={{
                          background: `hsl(${(idx * 47 + 200) % 360}, 60%, 45%)`,
                        }}
                      >
                        {user.initial}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
                  {user.name}
                </span>
              </button>
            ))}
      </div>

      {/* Feed */}
      {postsLoading ? (
        <div className="space-y-1 mt-1" data-ocid="feed.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card">
              <div className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="w-full aspect-square" />
              <div className="p-3">
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20" data-ocid="feed.empty_state">
          <p className="text-lg font-semibold mb-1">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Follow people to see their posts here
          </p>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate({ to: "/explore" })}
              className="mt-4 gradient-bg text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90"
              data-ocid="feed.primary_button"
            >
              Explore People
            </button>
          )}
        </div>
      ) : (
        <div data-ocid="feed.list">
          {posts.map((post) => (
            <PostCard
              key={post.id.toString()}
              post={post}
              authorUsername={
                DEMO_NAMES[post.author.toString()] ??
                `user_${post.author.toString().slice(0, 6)}`
              }
            />
          ))}
        </div>
      )}

      {/* FAB - create post */}
      {isAuthenticated && (
        <button
          type="button"
          onClick={() => setCreatePostOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 gradient-bg rounded-full shadow-glow flex items-center justify-center hover:opacity-90 transition-opacity z-40"
          data-ocid="home.open_modal_button"
          aria-label="Create post"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="max-w-md" data-ocid="home.dialog">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <CreatePostForm />
        </DialogContent>
      </Dialog>

      {storyViewerOpen && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={storyIndex}
          onClose={() => setStoryViewerOpen(false)}
        />
      )}
    </div>
  );
}
