import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Crown, Film, Grid3X3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import LoginButton from "../components/LoginButton";
import { useGetUserPosts } from "../hooks/useGetUserPosts";
import { useGetUserProfile } from "../hooks/useGetUserProfile";
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

function PostGrid({ posts }: { posts: PostView[] }) {
  const GRADIENT_PLACEHOLDERS = [
    "from-violet-900 to-pink-700",
    "from-blue-900 to-cyan-600",
    "from-rose-900 to-orange-600",
    "from-emerald-900 to-teal-600",
    "from-amber-900 to-yellow-600",
    "from-indigo-900 to-violet-600",
  ];

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="profile.empty_state">
        <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">No Posts Yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          When you share photos, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5" data-ocid="profile.list">
      {posts.map((post, idx) => (
        <div
          key={post.id.toString()}
          className="aspect-square overflow-hidden group cursor-pointer"
          data-ocid={`profile.item.${idx + 1}`}
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
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const { data: userProfile, isLoading: profileLoading } =
    useGetUserProfile(currentUserPrincipal);
  const { data: userPosts = [], isLoading: postsLoading } =
    useGetUserPosts(currentUserPrincipal);
  const { data: userStats, isLoading: statsLoading } =
    useGetUserStats(currentUserPrincipal);
  const { mutate: saveProfile, isPending: isSaving } =
    useSaveCallerUserProfile();

  useEffect(() => {
    if (userProfile) {
      setEditUsername(userProfile.username ?? "");
      setEditEmail(userProfile.email ?? "");
    }
  }, [userProfile]);

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
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const username =
    userProfile?.username ??
    currentUserPrincipal?.toString().slice(0, 12) ??
    "user";
  const followersCount = userStats ? Number(userStats.followers) : 0;
  const followingCount = userStats ? Number(userStats.following) : 0;

  const handleSaveProfile = () => {
    saveProfile(
      {
        username: editUsername,
        email: editEmail,
        subscription: userProfile?.subscription ?? false,
      },
      {
        onSuccess: () => {
          setEditMode(false);
          toast.success("Profile updated successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to update profile: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Cover gradient */}
      <div className="h-32 gradient-bg w-full" />

      {/* Avatar + info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="story-ring w-24 h-24">
            <div className="story-ring-inner w-full h-full">
              <Avatar className="w-full h-full">
                <AvatarFallback className="gradient-bg text-white text-2xl font-bold">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Button
            onClick={() => setEditMode(!editMode)}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary hover:text-primary"
            data-ocid="profile.edit_button"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Edit form */}
        {editMode && (
          <div
            className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3"
            data-ocid="profile.panel"
          >
            <h2 className="text-sm font-semibold mb-2">Edit Profile</h2>
            <div className="space-y-1">
              <Label htmlFor="edit-username" className="text-xs">
                Username
              </Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
                disabled={isSaving}
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-xs">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email"
                disabled={isSaving}
                data-ocid="profile.input"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving || !editUsername.trim()}
                size="sm"
                className="gradient-bg text-white border-0"
                data-ocid="profile.save_button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                variant="outline"
                size="sm"
                disabled={isSaving}
                data-ocid="profile.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

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
          {userProfile?.email && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {userProfile.email}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {currentUserPrincipal?.toString().slice(0, 20)}...
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4" data-ocid="profile.panel">
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
            className="flex-1 flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Grid3X3 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="reels"
            className="flex-1 flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Film className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex-1 flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
            data-ocid="profile.tab"
          >
            <Bookmark className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <PostGrid posts={userPosts} />
        </TabsContent>
        <TabsContent value="reels" className="mt-0">
          <PostGrid posts={userPosts.filter((p) => !!p.media)} />
        </TabsContent>
        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-16" data-ocid="profile.empty_state">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No Saved Posts</p>
            <p className="text-sm text-muted-foreground mt-1">
              Posts you save will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
