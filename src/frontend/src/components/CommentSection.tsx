import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetComments } from '../hooks/useGetComments';
import { useAddComment } from '../hooks/useAddComment';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: bigint;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { data: comments = [], isLoading } = useGetComments(postId);
  const { mutate: addComment, isPending } = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={isPending || !commentText.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {isLoading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id.toString()} className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                  <p className="text-sm font-medium">User</p>
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
        </ScrollArea>
      )}
    </div>
  );
}
