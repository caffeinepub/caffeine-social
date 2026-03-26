import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLikePost } from "../hooks/useLikePost";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: PostView;
  authorUsername?: string;
  authorPhoto?: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(ns: bigint) {
  return formatDistanceToNow(Number(ns) / 1_000_000, { addSuffix: true });
}

function isVideoUrl(url: string) {
  return (
    /\.(mp4|webm|mov|ogg)$/i.test(url) ||
    url.includes("video") ||
    url.includes("/reel")
  );
}

function VideoMedia({
  src,
  onDoubleTap,
  heartAnim,
}: {
  src: string;
  onDoubleTap: () => void;
  heartAnim: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((m) => !m);
    if (videoRef.current) videoRef.current.muted = !muted;
  };

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden">
      {/* biome-ignore lint/a11y/useMediaCaption: feed video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay
        muted={muted}
        loop
        playsInline
        onDoubleClick={onDoubleTap}
      />
      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart className="w-20 h-20 text-white fill-white opacity-90 animate-heart-pop" />
        </div>
      )}
      {/* Mute toggle */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-3 left-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function MediaCarousel({
  mediaUrls,
  onDoubleTap,
  heartAnim,
}: {
  mediaUrls: string[];
  onDoubleTap: () => void;
  heartAnim: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.min(i + 1, mediaUrls.length - 1));
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50)
      setCurrentIndex((i) => Math.min(i + 1, mediaUrls.length - 1));
    else if (diff < -50) setCurrentIndex((i) => Math.max(i - 1, 0));
    touchStartX.current = null;
  };

  const currentUrl = mediaUrls[currentIndex];

  return (
    <div
      className="relative w-full aspect-square bg-secondary overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isVideoUrl(currentUrl) ? (
        <VideoMedia
          src={currentUrl}
          onDoubleTap={onDoubleTap}
          heartAnim={heartAnim}
        />
      ) : (
        <button
          type="button"
          className="absolute inset-0 w-full h-full cursor-pointer block"
          onDoubleClick={onDoubleTap}
          aria-label="Double-click to like"
        >
          <img
            src={currentUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-20 h-20 text-white fill-white opacity-90 animate-heart-pop" />
            </div>
          )}
        </button>
      )}

      {/* Navigation arrows - only show if multiple images */}
      {mediaUrls.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentIndex < mediaUrls.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {mediaUrls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const REACTIONS = ["❤️", "😍", "🔥", "😂", "👏"];

export default function PostCard({
  post,
  authorUsername,
  authorPhoto,
}: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { mutate: likePost, isPending: liking } = useLikePost();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnPost = currentUserPrincipal === post.author.toString();
  const isLiked = currentUserPrincipal
    ? post.likes.some((p) => p.toString() === currentUserPrincipal)
    : false;

  const handleLike = () => {
    if (!liking && identity) {
      likePost(post.id);
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 300);
    }
  };

  const handleDoubleTap = () => {
    if (identity && !isLiked) handleLike();
  };

  const handleReactionSelect = (emoji: string) => {
    setSelectedReaction((prev) => (prev === emoji ? null : emoji));
    setShowReactionPicker(false);
    if (!isLiked && identity) handleLike();
  };

  const handleHeartMouseEnter = () => {
    setShowReactionPicker(true);
  };

  const handleHeartMouseLeave = () => {
    setShowReactionPicker(false);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleHeartTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 500);
  };

  const handleHeartTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !actor || submitting) return;
    setSubmitting(true);
    try {
      await actor.addComment(post.id, commentText.trim());
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Saminsta",
          text: post.content,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  const handleAuthorClick = () => {
    navigate({
      to: "/user/$userId",
      params: { userId: post.author.toString() },
    });
  };

  const displayName =
    authorUsername || `${post.author.toString().slice(0, 6)}...`;

  const mediaUrls = post.media ? [post.media.getDirectURL()] : [];

  return (
    <article
      className="bg-card border border-border mb-0.5 animate-fade-slide-up"
      data-ocid={`feed.item.${Number(post.id)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={handleAuthorClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          data-ocid={`feed.link.${Number(post.id)}`}
          aria-label={`View ${displayName}'s profile`}
        >
          <div className="story-ring w-9 h-9 flex-shrink-0">
            <div className="story-ring-inner w-full h-full">
              <Avatar className="w-full h-full">
                {authorPhoto && (
                  <AvatarImage src={authorPhoto} alt={displayName} />
                )}
                <AvatarFallback className="gradient-bg text-white text-xs font-bold">
                  {getInitials(authorUsername)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Follow button — only for other users' posts */}
          {!isOwnPost && identity && (
            <button
              type="button"
              onClick={() => setFollowing((f) => !f)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                following
                  ? "border-border text-muted-foreground bg-muted"
                  : "border-transparent bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
              }`}
              data-ocid={`feed.toggle.${Number(post.id)}`}
              aria-label={following ? "Following" : "Follow"}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="More options"
          >
            <span className="text-lg">···</span>
          </button>
        </div>
      </div>

      {/* Media */}
      {mediaUrls.length > 0 ? (
        <MediaCarousel
          mediaUrls={mediaUrls}
          onDoubleTap={handleDoubleTap}
          heartAnim={heartAnim}
        />
      ) : (
        <button
          type="button"
          className="relative w-full aspect-square bg-secondary overflow-hidden cursor-pointer block"
          onDoubleClick={handleDoubleTap}
          aria-label="Double-click to like"
        >
          <div className="w-full h-full gradient-bg flex items-center justify-center">
            <p className="text-white text-center px-6 text-lg font-medium">
              {post.content}
            </p>
          </div>
          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-20 h-20 text-white fill-white opacity-90 animate-heart-pop" />
            </div>
          )}
        </button>
      )}

      {/* Actions */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Heart button with reaction picker */}
            <div
              className="relative"
              onMouseEnter={handleHeartMouseEnter}
              onMouseLeave={handleHeartMouseLeave}
              onTouchStart={handleHeartTouchStart}
              onTouchEnd={handleHeartTouchEnd}
            >
              {showReactionPicker && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1 shadow-lg z-50 whitespace-nowrap">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReactionSelect(emoji)}
                      className={`text-xl hover:scale-125 transition-transform p-0.5 ${
                        selectedReaction === emoji ? "scale-125" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleLike}
                disabled={liking}
                className="flex items-center gap-1 group"
                data-ocid={`feed.button.${Number(post.id)}`}
                aria-label="Like"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-foreground group-hover:text-red-400"
                  }`}
                />
                {selectedReaction && (
                  <span className="text-sm leading-none">
                    {selectedReaction}
                  </span>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="text-foreground hover:text-muted-foreground"
              data-ocid={`feed.secondary_button.${Number(post.id)}`}
              aria-label="Comment"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="text-foreground hover:text-muted-foreground"
              aria-label="Share"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSaved(!saved)}
            className="text-foreground hover:text-muted-foreground"
            aria-label="Save"
          >
            <Bookmark className={`w-6 h-6 ${saved ? "fill-foreground" : ""}`} />
          </button>
        </div>

        {/* Like count */}
        <p className="text-sm font-semibold mb-1">
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </p>

        {/* Caption */}
        {post.media && post.content && (
          <p className="text-sm mb-1">
            <span className="font-semibold mr-2">{displayName}</span>
            {post.content}
          </p>
        )}

        {/* Comments preview */}
        {!showComments && post.comments.length > 0 && (
          <div className="mb-1">
            {post.comments.slice(0, 2).map((c) => (
              <p key={c.id.toString()} className="text-sm">
                <span className="font-semibold mr-2">
                  {c.author.toString().slice(0, 6)}...
                </span>
                {c.content}
              </p>
            ))}
            {post.comments.length > 2 && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground mt-0.5"
                onClick={() => setShowComments(true)}
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        {/* Full comment section */}
        {showComments && (
          <div className="mt-2 pb-2">
            <CommentSection postId={post.id} />
          </div>
        )}
      </div>

      {/* Comment input */}
      {!showComments && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-border mt-1">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleComment();
            }}
            data-ocid={`feed.input.${Number(post.id)}`}
          />
          {commentText.trim() && (
            <button
              type="button"
              onClick={handleComment}
              disabled={submitting}
              className="text-primary text-sm font-semibold hover:text-primary/80"
              data-ocid={`feed.submit_button.${Number(post.id)}`}
            >
              Post
            </button>
          )}
        </div>
      )}
    </article>
  );
}
