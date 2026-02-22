import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import type { PostView } from '../backend';

export default function Home() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<PostView[]>([]);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  // Fetch posts from backend canister
  const fetchPosts = async () => {
    if (!actor) return;
    try {
      const postsFromBackend = await actor.getFeed();
      setPosts(postsFromBackend);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [actor]);

  // Handle adding a comment
  const handleAddComment = async (postId: bigint) => {
    const text = newComments[postId.toString()];
    if (!text || !actor) return;

    try {
      // Call backend canister to add comment
      await actor.addComment(postId, text);
      setNewComments({ ...newComments, [postId.toString()]: '' });
      fetchPosts(); // refresh feed to show new comment
      // Also invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId.toString()] });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-4">
        <h1 className="text-2xl font-bold mb-4">RunInsta Feed</h1>

        {posts.map((post) => (
          <div key={post.id.toString()} className="mb-6">
            <PostCard post={post} />

            {/* Comments */}
            <div className="mt-2 pl-2">
              <h3 className="font-semibold text-sm text-gray-600">Comments</h3>
              <div className="mt-1">
                {post.comments.map((c, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    <span className="font-semibold">{c.author.toString().slice(0, 8)}...: </span>
                    {c.content}
                  </p>
                ))}
              </div>

              {/* Add new comment */}
              <div className="flex mt-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 border rounded-l-md px-2 py-1 focus:outline-none"
                  value={newComments[post.id.toString()] || ''}
                  onChange={(e) =>
                    setNewComments({ ...newComments, [post.id.toString()]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment(post.id);
                  }}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
