import { useGetFeed } from '../hooks/useGetFeed';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: posts = [], isLoading } = useGetFeed();
  const { data: userProfile } = useGetCallerUserProfile();

  // Create a map of author principals to usernames
  const authorMap = new Map<string, string>();
  if (userProfile) {
    authorMap.set(userProfile.email, userProfile.username);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePostForm />

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-semibold mb-2">No posts yet</p>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id.toString()}
              post={post}
              authorUsername={authorMap.get(post.author.toString()) || 'User'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
