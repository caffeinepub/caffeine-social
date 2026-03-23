import {
  Heart,
  MessageCircle,
  Music2,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import type { PostView } from "../backend";
import { useGetFeed } from "../hooks/useGetFeed";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLikePost } from "../hooks/useLikePost";

const GRADIENT_PALETTES = [
  "from-violet-900 via-purple-800 to-pink-700",
  "from-blue-900 via-indigo-800 to-violet-700",
  "from-rose-900 via-pink-800 to-orange-700",
  "from-emerald-900 via-teal-800 to-cyan-700",
  "from-amber-900 via-orange-800 to-red-700",
  "from-slate-900 via-gray-800 to-zinc-700",
];

const REEL_SONGS = [
  "Midnight Vibes - Lo-Fi Beats",
  "Purple Rain - Original Mix",
  "Neon Lights - Synthwave",
  "Summer Fade - Chill House",
  "City Pulse - Urban Beats",
];

function ReelItem({
  post,
  index,
  isActive,
}: { post: PostView; index: number; isActive: boolean }) {
  const { identity } = useInternetIdentity();
  const { mutate: likePost } = useLikePost();
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = currentUserPrincipal
    ? post.likes.some((p) => p.toString() === currentUserPrincipal)
    : false;

  const gradient = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
  const song = REEL_SONGS[index % REEL_SONGS.length];

  return (
    <div
      className="relative w-full h-screen snap-start flex items-center justify-center bg-black overflow-hidden"
      data-ocid={`reels.item.${index + 1}`}
    >
      {post.media ? (
        <video
          ref={videoRef}
          src={post.media.getDirectURL()}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={isActive}
          loop
          muted={muted}
          playsInline
          aria-label="Reel video"
        >
          <track kind="captions" />
        </video>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

      <div
        className="absolute right-4 bottom-32 flex flex-col items-center gap-6"
        data-ocid={`reels.panel.${index + 1}`}
      >
        <button
          type="button"
          onClick={() => likePost(post.id)}
          className="flex flex-col items-center gap-1 group"
          data-ocid={`reels.toggle.${index + 1}`}
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Heart
              className={`w-7 h-7 transition-colors ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-white group-hover:text-red-400"
              }`}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {post.likes.length}
          </span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1"
          data-ocid={`reels.button.${index + 1}`}
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium">
            {post.comments.length}
          </span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center">
            <Send className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>
        {post.media && (
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-10 h-10 flex items-center justify-center"
          >
            {muted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        )}
      </div>

      <div className="absolute bottom-20 left-4 right-16">
        <p className="text-white font-semibold text-sm mb-1">
          @user_{post.author.toString().slice(0, 6)}
        </p>
        <p className="text-white/90 text-sm mb-3 line-clamp-2">
          {post.content}
        </p>
        <div className="flex items-center gap-2">
          <Music2
            className="w-4 h-4 text-white animate-spin"
            style={{ animationDuration: "4s" }}
          />
          <p className="text-white text-xs">{song}</p>
        </div>
      </div>
    </div>
  );
}

export default function Reels() {
  const { data: allPosts = [], isLoading } = useGetFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const reels = allPosts.length > 0 ? allPosts : SAMPLE_REELS;

  const handleScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight);
    setActiveIndex(idx);
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center"
        data-ocid="reels.loading_state"
      >
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="fixed inset-0 overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-none"
      style={{ top: 0, paddingTop: 0 }}
      data-ocid="reels.list"
    >
      {reels.map((reel, i) => (
        <ReelItem
          key={reel.id.toString()}
          post={reel}
          index={i}
          isActive={i === activeIndex}
        />
      ))}
    </div>
  );
}

const SAMPLE_REELS: PostView[] = [
  {
    id: BigInt(1),
    content:
      "🌆 City at night — the world looks different after midnight. Pure magic. ✨",
    createdAt: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
    author: {
      toString: () => "abc123def456",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "abc123def456",
    } as any,
    likes: [],
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(2),
    content:
      "🎵 Lost in the music, found in the moment. Dance like no one's watching.",
    createdAt: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
    author: {
      toString: () => "xyz789ghi012",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "xyz789ghi012",
    } as any,
    likes: [],
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(3),
    content: "🏔️ Peak views, peak vibes. The climb is always worth it.",
    createdAt: BigInt(Date.now() - 10800000) * BigInt(1_000_000),
    author: {
      toString: () => "mno345pqr678",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "mno345pqr678",
    } as any,
    likes: [],
    comments: [],
    media: undefined,
  },
];
