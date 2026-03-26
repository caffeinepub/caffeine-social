import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, MessageCircle, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PostView } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLikePost } from "../hooks/useLikePost";

interface ReelPlayerProps {
  post: PostView;
  authorUsername?: string;
  isInView: boolean;
}

export default function ReelPlayer({
  post,
  authorUsername,
  isInView,
}: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
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
        // biome-ignore lint/a11y/useMediaCaption: reels player
        <video
          ref={videoRef}
          src={post.media.getDirectURL()}
          className="w-full h-full object-contain"
          loop
          playsInline
        />
      )}

      {/* Play/Pause overlay - clickable area */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-pointer bg-transparent"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 text-white pointer-events-none"
          >
            <Play className="w-10 h-10" />
          </Button>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="flex items-end justify-between">
          {/* Left: author info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 pointer-events-auto flex-wrap">
              <Avatar className="w-10 h-10 border-2 border-white flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                  {authorUsername?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">
                {authorUsername || "Anonymous"}
              </span>
              {/* Follow button */}
              <button
                type="button"
                onClick={() => setFollowing((f) => !f)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                  following
                    ? "border-white/50 text-white/60 bg-white/10"
                    : "border-white text-white hover:bg-white/20"
                }`}
                data-ocid="reels.toggle"
                aria-label={following ? "Following" : "Follow"}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
            <p className="text-white text-sm">{post.content}</p>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-col gap-4 ml-4 pointer-events-auto">
            {/* Like */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={isPending}
              className={`rounded-full ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-white hover:bg-white/20"
              }`}
              data-ocid="reels.toggle"
            >
              <Heart className={`w-8 h-8 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <div className="text-center text-white text-sm">
              {post.likes.length}
            </div>

            {/* Comment */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/20"
              data-ocid="reels.button"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>

            {/* Save */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSaved((s) => !s)}
              className={`rounded-full ${
                saved
                  ? "text-yellow-400 hover:text-yellow-500"
                  : "text-white hover:bg-white/20"
              }`}
              data-ocid="reels.secondary_button"
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Bookmark className={`w-8 h-8 ${saved ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
