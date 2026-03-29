import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Circle,
  Film,
  Grid3X3,
  Hash,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreatePost } from "../hooks/useCreatePost";
import { useCreateStory } from "../hooks/useCreateStory";

interface InstagramUploadModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: "post" | "reel" | "story";
}

type UploadType = "post" | "reel" | "story";
type Step = "select" | "details" | "uploading";

const TYPE_CONFIG = {
  post: {
    icon: Grid3X3,
    label: "Post",
    desc: "Share photos",
    color: "from-pink-500 to-rose-500",
  },
  reel: {
    icon: Film,
    label: "Reel",
    desc: "Share videos",
    color: "from-purple-500 to-indigo-500",
  },
  story: {
    icon: Circle,
    label: "Story",
    desc: "24h moment",
    color: "from-orange-400 to-pink-500",
  },
};

export default function InstagramUploadModal({
  open,
  onClose,
  defaultType = "post",
}: InstagramUploadModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [uploadType, setUploadType] = useState<UploadType>(defaultType);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: createStory } = useCreateStory();

  const handleClose = () => {
    setStep("select");
    setFile(null);
    setPreview(null);
    setCaption("");
    setHashtags("");
    setProgress(0);
    setUploadType(defaultType);
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
    setStep("details");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleShare = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setStep("uploading");
    setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mediaBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
        setProgress(Math.round(p)),
      );

      if (uploadType === "story") {
        await createStory({ media: mediaBlob, expirationHours: BigInt(24) });
        toast.success("Story shared!");
      } else {
        const fullCaption = [caption, hashtags].filter(Boolean).join(" ");
        await createPost({ content: fullCaption, media: mediaBlob });
        toast.success(uploadType === "reel" ? "Reel shared!" : "Post shared!");
      }
      handleClose();
    } catch {
      toast.error("Upload failed. Please try again.");
      setStep("details");
      setProgress(0);
    }
  };

  if (!open) return null;

  const isVideo = file?.type.startsWith("video/");
  const isReel = uploadType === "reel";
  const isStory = uploadType === "story";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md"
      data-ocid="upload.modal"
      role="presentation"
      onClick={(e) =>
        e.target === e.currentTarget && step !== "uploading" && handleClose()
      }
      onKeyDown={(e) =>
        e.key === "Escape" && step !== "uploading" && handleClose()
      }
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl mx-0 sm:mx-4 overflow-hidden shadow-2xl border border-white/5"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          {step === "details" ? (
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setFile(null);
                setPreview(null);
              }}
              className="text-white/70 hover:text-white transition-colors p-1 -ml-1"
              data-ocid="upload.cancel_button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-7" />
          )}

          <div className="flex flex-col items-center">
            <span
              className="text-base font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Saminsta
            </span>
            {step !== "select" && (
              <span className="text-white/40 text-[10px] -mt-0.5 uppercase tracking-widest">
                {uploadType}
              </span>
            )}
          </div>

          {step !== "uploading" ? (
            <button
              type="button"
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors p-1 -mr-1"
              data-ocid="upload.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-7" />
          )}
        </div>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(92vh - 64px)" }}
        >
          {/* Step 1: Select */}
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-5"
              >
                {/* Type selector cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {(
                    Object.entries(TYPE_CONFIG) as [
                      UploadType,
                      typeof TYPE_CONFIG.post,
                    ][]
                  ).map(([type, cfg]) => {
                    const Icon = cfg.icon;
                    const active = uploadType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUploadType(type)}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border transition-all ${
                          active
                            ? "border-pink-500/50 bg-pink-500/10"
                            : "border-white/8 bg-white/3 hover:border-white/20"
                        }`}
                        data-ocid="upload.toggle"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center ${
                            active ? "scale-110" : ""
                          } transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-sm font-semibold ${
                              active ? "text-white" : "text-white/60"
                            }`}
                          >
                            {cfg.label}
                          </p>
                          <p className="text-[10px] text-white/30">
                            {cfg.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Drop zone */}
                <button
                  type="button"
                  className={`w-full border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                    isDragging
                      ? "border-pink-500 bg-pink-500/10 scale-[1.01]"
                      : "border-white/12 hover:border-white/30 bg-white/2"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="upload.dropzone"
                  style={{ padding: "clamp(24px, 5vw, 40px)" }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center opacity-90">
                      <Upload className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-base">
                        {isDragging ? "Drop it here!" : "Drag & drop media"}
                      </p>
                      <p className="text-white/40 text-sm mt-1">
                        or tap to choose from your gallery
                      </p>
                    </div>
                    <span className="gradient-bg text-white px-6 py-2.5 rounded-full font-semibold text-sm">
                      Select media
                    </span>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleInputChange}
                  data-ocid="upload.upload_button"
                />
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === "details" && preview && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${
                  isStory
                    ? "flex flex-col items-center p-5"
                    : "flex flex-col sm:flex-row"
                }`}
              >
                {/* Preview */}
                <div
                  className={`bg-black flex items-center justify-center overflow-hidden ${
                    isStory
                      ? "w-full max-w-[240px] rounded-3xl"
                      : isReel
                        ? "sm:w-[45%] w-full"
                        : "sm:w-1/2 w-full"
                  }`}
                  style={{
                    aspectRatio: isStory || isReel ? "9/16" : "1/1",
                    maxHeight: isStory ? "400px" : undefined,
                    ...(isStory
                      ? {
                          padding: "3px",
                          background:
                            "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
                          borderRadius: "24px",
                        }
                      : {}),
                  }}
                >
                  <div
                    className={"w-full h-full overflow-hidden bg-black"}
                    style={isStory ? { borderRadius: "22px" } : {}}
                  >
                    {isVideo ? (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                        controls={false}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Details form */}
                <div
                  className={`p-4 flex flex-col gap-3 ${
                    isStory ? "w-full max-w-[240px]" : "sm:flex-1 w-full"
                  }`}
                >
                  {isStory ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 bg-white/8 rounded-full px-3 py-1.5 mx-auto">
                        <span className="text-[10px] text-white/60 font-medium">
                          ⏱ Expires in 24 hours
                        </span>
                      </div>
                      <Button
                        onClick={handleShare}
                        className="w-full gradient-bg text-white border-0 rounded-2xl font-bold h-12 text-base"
                        data-ocid="upload.submit_button"
                      >
                        Share to Story
                      </Button>
                    </>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={3}
                        className="bg-white/5 border-white/8 text-white placeholder:text-white/25 resize-none text-sm rounded-xl focus:border-pink-500/50"
                        data-ocid="upload.textarea"
                      />
                      <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 focus-within:border-pink-500/50 transition-colors">
                        <Hash className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="hashtag, saminsta"
                          value={hashtags}
                          onChange={(e) => setHashtags(e.target.value)}
                          className="bg-transparent text-white placeholder:text-white/25 text-sm outline-none flex-1"
                          data-ocid="upload.input"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5">
                        <MapPin className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Add location (optional)"
                          className="bg-transparent text-white placeholder:text-white/25 text-sm outline-none flex-1"
                        />
                      </div>
                      <Button
                        onClick={handleShare}
                        className="w-full gradient-bg text-white border-0 rounded-2xl font-bold h-11 mt-auto"
                        data-ocid="upload.submit_button"
                      >
                        Share {isReel ? "Reel" : "Post"}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Uploading */}
            {step === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div
                    className="absolute inset-0 rounded-full gradient-bg opacity-20 animate-ping"
                    style={{ animationDuration: "1.5s" }}
                  />
                  <div className="relative w-full h-full gradient-bg rounded-full flex items-center justify-center">
                    <Upload className="w-9 h-9 text-white" />
                  </div>
                </div>
                <p className="text-white font-bold text-lg mb-1">
                  Sharing your moment...
                </p>
                <p className="text-white/40 text-sm mb-6">
                  {progress < 100 ? `${progress}% uploaded` : "Almost done..."}
                </p>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-white/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #f472b6, #a855f7, #6366f1)",
                      backgroundSize: "200% 100%",
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 text-white/30 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Please keep this window open
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
