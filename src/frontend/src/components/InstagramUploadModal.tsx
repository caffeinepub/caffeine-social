import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Film, ImageIcon, Loader2, Upload, X } from "lucide-react";
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

  const titleText =
    step === "select"
      ? "Create New Post"
      : step === "uploading"
        ? "Sharing..."
        : `New ${uploadType === "story" ? "Story" : uploadType === "reel" ? "Reel" : "Post"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      data-ocid="upload.modal"
      role="presentation"
      onClick={(e) =>
        e.target === e.currentTarget && step !== "uploading" && handleClose()
      }
      onKeyDown={(e) =>
        e.key === "Escape" && step !== "uploading" && handleClose()
      }
    >
      <div className="bg-zinc-900 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          {step === "details" ? (
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setFile(null);
                setPreview(null);
              }}
              className="text-white/70 hover:text-white text-sm"
              data-ocid="upload.cancel_button"
            >
              Back
            </button>
          ) : (
            <div className="w-12" />
          )}
          <h2 className="text-white font-semibold text-sm">{titleText}</h2>
          {step !== "uploading" ? (
            <button
              type="button"
              onClick={handleClose}
              className="text-white/70 hover:text-white"
              data-ocid="upload.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* Step 1: Select */}
        {step === "select" && (
          <div className="p-8">
            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-pink-500 bg-pink-500/10"
                  : "border-white/20 hover:border-white/40"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              data-ocid="upload.dropzone"
            >
              <div className="w-20 h-20 mx-auto mb-4 gradient-bg rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                Drag photos and videos here
              </p>
              <p className="text-white/50 text-sm mb-6">
                Share your moments with the world
              </p>
              <span className="gradient-bg text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity inline-block">
                Select from gallery
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleInputChange}
              data-ocid="upload.upload_button"
            />
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && preview && (
          <div className="flex flex-col md:flex-row">
            {/* Preview */}
            <div className="md:w-1/2 bg-black flex items-center justify-center aspect-square md:aspect-auto">
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

            {/* Details form */}
            <div className="md:w-1/2 p-4 flex flex-col gap-3">
              {/* Type selector */}
              <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {(["post", "reel", "story"] as UploadType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUploadType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      uploadType === t
                        ? "gradient-bg text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                    data-ocid="upload.toggle"
                  >
                    {t === "reel" && <Film className="w-3 h-3 inline mr-1" />}
                    {t}
                  </button>
                ))}
              </div>

              {/* Caption */}
              {uploadType !== "story" && (
                <>
                  <Textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-sm"
                    data-ocid="upload.textarea"
                  />
                  <input
                    type="text"
                    placeholder="#hashtag, #saminsta"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-500 transition-colors"
                    data-ocid="upload.input"
                  />
                </>
              )}

              <Button
                onClick={handleShare}
                className="w-full gradient-bg text-white border-0 rounded-xl font-semibold mt-auto"
                data-ocid="upload.submit_button"
              >
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Uploading */}
        {step === "uploading" && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-6 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-semibold mb-1">
              Sharing your moment...
            </p>
            <p className="text-white/50 text-sm mb-6">
              {progress < 100 ? `${progress}% uploaded` : "Finishing up..."}
            </p>
            <Progress value={progress} className="h-1.5 bg-white/10" />
            <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Please don&apos;t close this window
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
