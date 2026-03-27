import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateStory } from "../hooks/useCreateStory";

export default function CreateStoryForm() {
  const [open, setOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const { mutate: createStory, isPending } = useCreateStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileIsVideo = file.type.startsWith("video/");
      const maxSize = fileIsVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          `File size must be less than ${fileIsVideo ? "50MB" : "10MB"}`,
        );
        return;
      }
      setMediaFile(file);
      setIsVideo(fileIsVideo);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!mediaFile) {
      toast.error("Please select a photo or video for your story");
      return;
    }

    const arrayBuffer = await mediaFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
      (percentage) => {
        setUploadProgress(percentage);
      },
    );

    createStory(
      { media: mediaBlob, expirationHours: BigInt(24) },
      {
        onSuccess: () => {
          setMediaFile(null);
          setMediaPreview(null);
          setUploadProgress(0);
          setIsVideo(false);
          setOpen(false);
          toast.success("Story created successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to create story: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {mediaPreview ? (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              {isVideo ? (
                <video
                  src={mediaPreview}
                  className="w-full h-auto max-h-96 object-cover"
                  controls
                  muted
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-cover"
                />
              )}
              {/* File type badge */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                {isVideo ? "🎬 Video" : "📷 Photo"}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                  setIsVideo(false);
                }}
                disabled={isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                document.getElementById("story-media-input")?.click()
              }
              className="w-full border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Plus className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select a photo or video
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                📷 Images up to 10MB · 🎬 Videos up to 50MB
              </p>
            </button>
          )}
          <input
            id="story-media-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isPending || !mediaFile}
            className="w-full"
          >
            {isPending ? "Creating Story..." : "Share Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
