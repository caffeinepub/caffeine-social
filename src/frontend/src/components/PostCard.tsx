import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLikePost } from '../hooks/useLikePost';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import type { PostView } from '../backend';

interface PostCardProps {
  post: PostView;
  authorUsername?: string;
}

export default function PostCard({ post, authorUsername }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { mutate: likePost, isPending } = useLikePost();
  const [showComments, setShowComments] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = currentUserPrincipal
    ? post.likes.some((p) => p.toString() === currentUserPrincipal)
    : false;
  const isAuthor = currentUserPrincipal === post.author.toString();

  const handleLike = () => {
    if (!isPending) {
      likePost(post.id);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
            {getInitials(authorUsername)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{authorUsername || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(Number(post.createdAt) / 1_000_000, { addSuffix: true })}
          </p>
        </div>
        {isAuthor && (
          <Badge variant="secondary" className="text-xs">
            Your Post
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>
        {post.media && (
          <div className="rounded-lg overflow-hidden bg-muted">
            <img
              src={post.media.getDirectURL()}
              alt="Post media"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isPending}
            className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length > 0 ? post.comments.length : 'Comment'}</span>
          </Button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </CardFooter>
    </Card>
  );
}
