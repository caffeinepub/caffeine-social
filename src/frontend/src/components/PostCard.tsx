import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import type { PostView } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLikePost } from "../hooks/useLikePost";

interface PostCardProps {
  post: PostView;
  authorUsername?: string;
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

export default function PostCard({ post, authorUsername }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { mutate: likePost, isPending: liking } = useLikePost();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
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

  const displayName =
    authorUsername || `${post.author.toString().slice(0, 6)}...`;

  return (
    <article
      className="bg-card border border-border mb-0.5"
      data-ocid={`feed.item.${Number(post.id)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="story-ring w-9 h-9 flex-shrink-0">
            <div className="story-ring-inner w-full h-full">
              <Avatar className="w-full h-full">
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
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          aria-label="More options"
        >
          <span className="text-lg">···</span>
        </button>
      </div>

      {/* Media */}
      <button
        type="button"
        className="relative w-full aspect-square bg-secondary overflow-hidden cursor-pointer block"
        onDoubleClick={handleDoubleTap}
        aria-label="Double-click to like"
      >
        {post.media ? (
          <img
            src={post.media.getDirectURL()}
            alt="Post"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-bg flex items-center justify-center">
            <p className="text-white text-center px-6 text-lg font-medium">
              {post.content}
            </p>
          </div>
        )}
        {heartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 text-white fill-white opacity-90 animate-heart-pop" />
          </div>
        )}
      </button>

      {/* Actions */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className="flex items-center gap-1 group"
              data-ocid={`feed.toggle.${Number(post.id)}`}
              aria-label="Like"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-foreground group-hover:text-red-400"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="text-foreground hover:text-muted-foreground"
              data-ocid={`feed.button.${Number(post.id)}`}
              aria-label="Comment"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              type="button"
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
        {post.comments.length > 0 && (
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
      </div>

      {/* Comment input */}
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
    </article>
  );
}
