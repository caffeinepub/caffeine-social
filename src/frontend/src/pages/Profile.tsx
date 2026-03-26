import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Camera,
  Crown,
  ExternalLink,
  Film,
  Grid3X3,
  Loader2,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import LoginButton from "../components/LoginButton";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useGetSavedPosts } from "../hooks/useGetSavedPosts";
import { useGetUserPosts } from "../hooks/useGetUserPosts";
import { useGetUserStats } from "../hooks/useGetUserStats";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const GRADIENT_PLACEHOLDERS = [
  "from-violet-900 to-pink-700",
  "from-blue-900 to-cyan-600",
  "from-rose-900 to-orange-600",
  "from-emerald-900 to-teal-600",
  "from-amber-900 to-yellow-600",
  "from-indigo-900 to-violet-600",
];

function PostDetailModal({
  post,
  idx,
  onClose,
}: {
  post: PostView;
  idx: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      data-ocid="profile.modal"
    >
      {/* Backdrop button for close */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-card border border-border rounded-xl overflow-hidden max-w-lg w-full max-h-[90vh] flex flex-col z-10">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          data-ocid="profile.close_button"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media */}
        <div className="aspect-square bg-secondary overflow-hidden flex-shrink-0">
          {post.media ? (
            <img
              src={post.media.getDirectURL()}
              alt="Post"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length]} flex items-center justify-center`}
            >
              <p className="text-white text-center px-6 text-lg font-medium">
                {post.content}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 overflow-y-auto">
          {post.content && post.media && (
            <p className="text-sm mb-3">{post.content}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-base">❤️</span>
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.comments.length}{" "}
              {post.comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
          {post.comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.comments.slice(0, 5).map((c) => (
                <p key={c.id.toString()} className="text-sm">
                  <span className="font-semibold mr-2">
                    {c.author.toString().slice(0, 8)}...
                  </span>
                  {c.content}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostGrid({
  posts,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDesc,
}: {
  posts: PostView[];
  emptyIcon: React.ElementType;
  emptyTitle: string;
  emptyDesc: string;
}) {
  const [selectedPost, setSelectedPost] = useState<{
    post: PostView;
    idx: number;
  } | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="profile.empty_state">
        <EmptyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground mt-1">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5" data-ocid="profile.list">
        {posts.map((post, idx) => (
          <button
            key={post.id.toString()}
            type="button"
            className="aspect-square overflow-hidden group cursor-pointer relative"
            data-ocid={`profile.item.${idx + 1}`}
            onClick={() => setSelectedPost({ post, idx })}
            aria-label="View post"
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost.post}
          idx={selectedPost.idx}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}

export default function Profile() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: userPosts = [], isLoading: postsLoading } =
    useGetUserPosts(currentUserPrincipal);
  const { data: userStats, isLoading: statsLoading } =
    useGetUserStats(currentUserPrincipal);
  const { data: savedPosts = [], isLoading: savedLoading } = useGetSavedPosts();
  const { mutate: saveProfile } = useSaveCallerUserProfile();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveProfile(
        { ...userProfile, profilePhoto: dataUrl },
        {
          onSuccess: () => {
            toast.success("Profile photo updated!");
            setUploadingPhoto(false);
          },
          onError: () => {
            toast.error("Failed to update photo");
            setUploadingPhoto(false);
          },
        },
      );
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 gradient-bg rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">?</span>
        </div>
        <p className="text-xl font-bold mb-2">Sign in to view profile</p>
        <p className="text-sm text-muted-foreground mb-6">
          Login to view and manage your Saminsta profile.
        </p>
        <LoginButton />
      </div>
    );
  }

  if (profileLoading || postsLoading || statsLoading) {
    return (
      <div className="max-w-xl mx-auto" data-ocid="profile.loading_state">
        <div className="h-32 bg-muted animate-pulse" />
        <div className="px-4 -mt-12 pb-4">
          <div className="flex items-end justify-between mb-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-6 w-10 mb-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const username =
    userProfile?.username ??
    currentUserPrincipal?.toString().slice(0, 12) ??
    "user";
  const followersCount = userStats ? Number(userStats.followers) : 0;
  const followingCount = userStats ? Number(userStats.following) : 0;

  return (
    <div className="max-w-xl mx-auto">
      {/* Cover gradient */}
      <div className="h-32 gradient-bg w-full" />

      {/* Avatar + info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <div className="story-ring w-24 h-24">
              <div className="story-ring-inner w-full h-full">
                <Avatar className="w-full h-full">
                  {userProfile?.profilePhoto && (
                    <AvatarImage
                      src={userProfile.profilePhoto}
                      alt={username}
                    />
                  )}
                  <AvatarFallback className="gradient-bg text-white text-2xl font-bold">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            {/* Camera icon overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center border-2 border-background hover:opacity-90 transition-opacity"
              aria-label="Change profile photo"
              data-ocid="profile.upload_button"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:border-primary hover:text-primary"
              asChild
              data-ocid="profile.edit_button"
            >
              <Link to="/settings">Edit Profile</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0" asChild>
              <Link to="/settings" data-ocid="nav.link">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Name & bio */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{username}</h1>
            {userProfile?.subscription && (
              <span className="flex items-center gap-1 gradient-bg text-white text-xs px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          {userProfile?.bio && (
            <p className="text-sm mt-1">{userProfile.bio}</p>
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
          {userProfile?.email && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {userProfile.email}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            ID: {currentUserPrincipal?.toString().slice(0, 20)}...
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-4" data-ocid="profile.panel">
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto px-0">
          <TabsTrigger
            value="posts"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Grid3X3 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="reels"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Film className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Bookmark className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <PostGrid
            posts={userPosts}
            emptyIcon={Grid3X3}
            emptyTitle="No Posts Yet"
            emptyDesc="When you share photos, they'll appear here."
          />
        </TabsContent>
        <TabsContent value="reels" className="mt-0">
          <PostGrid
            posts={userPosts.filter((p) => !!p.media)}
            emptyIcon={Film}
            emptyTitle="No Reels Yet"
            emptyDesc="Your reels will appear here."
          />
        </TabsContent>
        <TabsContent value="saved" className="mt-0">
          {savedLoading ? (
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : (
            <PostGrid
              posts={savedPosts}
              emptyIcon={Bookmark}
              emptyTitle="No Saved Posts"
              emptyDesc="Posts you save will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
