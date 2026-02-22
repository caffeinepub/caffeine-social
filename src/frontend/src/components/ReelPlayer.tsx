import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLikePost } from '../hooks/useLikePost';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { PostView } from '../backend';

interface ReelPlayerProps {
  post: PostView;
  authorUsername?: string;
  isInView: boolean;
}

export default function ReelPlayer({ post, authorUsername, isInView }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { identity } = useInternetIdentity();
  const { mutate: likePost, isPending } = useLikePost();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = currentUserPrincipal
    ? post.likes.some((p) => p.toString() === currentUserPrincipal)
    : false;

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isInView]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    if (!isPending) {
      likePost(post.id);
    }
  };

  return (
    <div className="relative w-full h-screen snap-start bg-black">
      {post.media && (
        <video
          ref={videoRef}
          src={post.media.getDirectURL()}
          className="w-full h-full object-contain"
          loop
          playsInline
          onClick={togglePlay}
        />
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <Play className="w-10 h-10" />
          </Button>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                  {authorUsername?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">{authorUsername || 'Anonymous'}</span>
            </div>
            <p className="text-white text-sm">{post.content}</p>
          </div>

          <div className="flex flex-col gap-4 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={isPending}
              className={`rounded-full ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <div className="text-center text-white text-sm">{post.likes.length}</div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
