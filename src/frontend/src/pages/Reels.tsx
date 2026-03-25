import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Loader2,
  MessageCircle,
  Music2,
  Plus,
  Send,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PostView } from "../backend";
import { ExternalBlob } from "../backend";
import { useCreatePost } from "../hooks/useCreatePost";
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

function CreateReelDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!caption.trim() && !file) {
      toast.error("Add a caption or media");
      return;
    }
    try {
      let media: ExternalBlob | null = null;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        media = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setProgress(Math.round(p)),
        );
      }
      await createPost({ content: caption, media });
      toast.success("Reel created!");
      setCaption("");
      setFile(null);
      setProgress(0);
      onClose();
    } catch {
      toast.error("Failed to create reel");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" data-ocid="reels.dialog">
        <DialogHeader>
          <DialogTitle>Create Reel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors"
            data-ocid="reels.upload_button"
          >
            {file ? (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Upload video or image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, MOV, JPG, PNG
                </p>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            data-ocid="reels.textarea"
          />
          {isPending && progress > 0 && (
            <div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {progress}% uploaded
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="gradient-bg text-white border-0 flex-1"
              data-ocid="reels.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isPending ? "Uploading..." : "Share Reel"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="reels.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Reels() {
  const { data: allPosts = [], isLoading } = useGetFeed();
  const { identity } = useInternetIdentity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
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
    <>
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

      {/* Create Reel FAB */}
      {identity && (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="fixed top-16 right-4 z-50 w-10 h-10 gradient-bg rounded-full flex items-center justify-center shadow-glow hover:opacity-90 transition-opacity"
          data-ocid="reels.open_modal_button"
          aria-label="Create reel"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      )}

      <CreateReelDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
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
