import { useState } from 'react';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetComments } from '../hooks/useGetComments';
import { useAddComment } from '../hooks/useAddComment';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: bigint;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { data: comments = [], isLoading } = useGetComments(postId);
  const { mutate: addComment, isPending } = useAddComment();
  const { identity } = useInternetIdentity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    addComment(
      { postId, content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
          toast.success('Comment added!');
        },
        onError: (error) => {
          toast.error('Failed to add comment: ' + error.message);
        },
      }
    );
  };

  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
  };

  // Sort comments by creation time (oldest first)
  const sortedComments = [...comments].sort((a, b) => {
    const timeA = Number(a.createdAt);
    const timeB = Number(b.createdAt);
    return timeA - timeB;
  });

  // Show only first 3 comments unless expanded
  const displayedComments = showAll ? sortedComments : sortedComments.slice(0, 3);
  const hasMoreComments = sortedComments.length > 3;

  return (
    <div className="w-full space-y-3">
      {isLoading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-2 text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div key={comment.id.toString()} className="flex gap-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs">
                    {getInitials(comment.author.toString())}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                  <p className="text-sm font-medium">
                    {comment.author.toString().slice(0, 8)}...
                  </p>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(Number(comment.createdAt) / 1_000_000, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMoreComments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View all {sortedComments.length} comments
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isPending || !identity}
        />
        <Button type="submit" size="icon" disabled={isPending || !commentText.trim() || !identity}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
