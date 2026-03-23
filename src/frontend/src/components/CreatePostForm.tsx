import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Image, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreatePost } from "../hooks/useCreatePost";

export default function CreatePostForm() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: createPost, isPending } = useCreatePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    let mediaBlob: ExternalBlob | null = null;

    if (mediaFile) {
      const arrayBuffer = await mediaFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        },
      );
    }

    createPost(
      { content: content.trim(), media: mediaBlob },
      {
        onSuccess: () => {
          setContent("");
          setMediaFile(null);
          setMediaPreview(null);
          setUploadProgress(0);
          toast.success("Post created successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to create post: ${error.message}`);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            rows={4}
            className="resize-none"
          />
          {mediaPreview && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full h-auto max-h-64 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveMedia}
                disabled={isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById("post-media-input")?.click()
              }
              disabled={isPending}
              className="gap-2"
            >
              <Image className="w-4 h-4" />
              Add Photo
            </Button>
            <input
              id="post-media-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="submit"
              disabled={isPending || !content.trim()}
              className="ml-auto"
            >
              {isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
