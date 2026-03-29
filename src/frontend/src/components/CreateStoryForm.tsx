import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AtSign, Clock, Plus, Sliders, Type, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateStory } from "../hooks/useCreateStory";

const FILTERS = [
  { name: "Normal", css: "none" },
  { name: "Warm", css: "sepia(0.3) saturate(1.5) brightness(1.05)" },
  { name: "Cool", css: "hue-rotate(20deg) saturate(1.2) brightness(1.05)" },
  { name: "Fade", css: "opacity(0.85) brightness(1.1) saturate(0.8)" },
  { name: "Vivid", css: "saturate(1.8) contrast(1.1)" },
  { name: "Dark", css: "brightness(0.7) contrast(1.2)" },
  { name: "Rose", css: "sepia(0.2) hue-rotate(-10deg) saturate(1.5)" },
];

const TEXT_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Yellow", value: "#fde047" },
  { label: "Pink", value: "#f472b6" },
  { label: "Purple", value: "#c084fc" },
];

const TEXT_SIZES = [
  { label: "S", value: "text-sm", px: "14px" },
  { label: "M", value: "text-xl", px: "20px" },
  { label: "L", value: "text-3xl", px: "30px" },
];

export default function CreateStoryForm() {
  const [open, setOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideo, setIsVideo] = useState(false);

  // Text overlay
  const [showTextInput, setShowTextInput] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(TEXT_SIZES[1]);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);

  // Tags
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [storyTags, setStoryTags] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
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
      // reset overlays on new media
      setStoryText("");
      setSelectedFilter(FILTERS[0]);
      setStoryTags([]);
      setShowTextInput(false);
      setShowFilters(false);
      setShowTagInput(false);
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
      (percentage) => setUploadProgress(percentage),
    );

    createStory(
      { media: mediaBlob, expirationHours: BigInt(24) },
      {
        onSuccess: () => {
          handleReset();
          setOpen(false);
          toast.success("Story shared!");
        },
        onError: (error) => {
          toast.error(`Failed to create story: ${error.message}`);
        },
      },
    );
  };

  const handleReset = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setIsVideo(false);
    setUploadProgress(0);
    setStoryText("");
    setSelectedFilter(FILTERS[0]);
    setStoryTags([]);
    setShowTextInput(false);
    setShowFilters(false);
    setShowTagInput(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !storyTags.includes(trimmed)) {
      setStoryTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  return (
    <>
      {/* Trigger: Instagram-style story circle */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 group"
        data-ocid="stories.open_modal_button"
      >
        <div
          className="w-16 h-16 rounded-full p-0.5"
          style={{
            background: "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
          }}
        >
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center border-2 border-zinc-900">
            <div className="w-full h-full rounded-full gradient-bg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <Plus className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <span className="text-xs text-white/60 font-medium">Your Story</span>
      </button>

      {/* Full-screen Story Creator Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start overflow-y-auto"
            data-ocid="stories.modal"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                handleReset();
                setOpen(false);
              }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              data-ocid="stories.close_button"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="flex flex-col items-center gap-4 w-full max-w-xs px-4 pt-14 pb-8"
            >
              {/* Title */}
              <div className="text-center">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #f9a8d4, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Add Story
                </h2>
              </div>

              {/* 9:16 Preview */}
              <div
                className="relative w-full cursor-pointer"
                style={{ aspectRatio: "9/16", maxHeight: "60vh" }}
                onClick={() => !mediaPreview && inputRef.current?.click()}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !mediaPreview &&
                  inputRef.current?.click()
                }
              >
                {mediaPreview ? (
                  <>
                    {/* Gradient ring */}
                    <div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        padding: "3px",
                        background:
                          "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
                        borderRadius: "24px",
                      }}
                    >
                      <div className="w-full h-full rounded-[22px] overflow-hidden bg-black relative">
                        {isVideo ? (
                          <video
                            src={mediaPreview}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls={false}
                          />
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Story preview"
                            className="w-full h-full object-cover"
                            style={{
                              filter:
                                selectedFilter.css === "none"
                                  ? undefined
                                  : selectedFilter.css,
                            }}
                          />
                        )}

                        {/* Text overlay */}
                        {storyText && (
                          <div className="absolute top-8 left-0 right-0 flex justify-center px-4 pointer-events-none">
                            <span
                              className="font-bold text-center drop-shadow-lg px-2 py-1 rounded-lg"
                              style={{
                                color: textColor,
                                fontSize: textSize.px,
                                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                                background: "rgba(0,0,0,0.25)",
                                backdropFilter: "blur(2px)",
                              }}
                            >
                              {storyText}
                            </span>
                          </div>
                        )}

                        {/* Tags overlay */}
                        {storyTags.length > 0 && (
                          <div className="absolute bottom-8 left-0 right-0 flex flex-wrap justify-center gap-1.5 px-3 pointer-events-none">
                            {storyTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #f9a8d4aa, #c084fcaa)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                @{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove media button */}
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Type badge */}
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {isVideo ? "🎬 Video" : "📷 Photo"}
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full h-full rounded-3xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-colors"
                    style={{ minHeight: "200px" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #f9a8d4, #c084fc)",
                      }}
                    >
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-white font-semibold">
                        Select Photo or Video
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Images up to 10MB · Videos up to 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Toolbar — only when media selected */}
              <AnimatePresence>
                {mediaPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-full flex flex-col gap-3"
                  >
                    {/* Icon toolbar */}
                    <div className="flex items-center justify-center gap-6">
                      {/* Text button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowTextInput(!showTextInput);
                          setShowFilters(false);
                          setShowTagInput(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                          showTextInput
                            ? "text-pink-400"
                            : "text-white/60 hover:text-white"
                        }`}
                        data-ocid="stories.toggle"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            showTextInput
                              ? "bg-pink-500/20 border border-pink-500/50"
                              : "bg-white/10"
                          }`}
                        >
                          <Type className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Text</span>
                      </button>

                      {/* Filter button — only for photos */}
                      {!isVideo && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowFilters(!showFilters);
                            setShowTextInput(false);
                            setShowTagInput(false);
                          }}
                          className={`flex flex-col items-center gap-1 transition-colors ${
                            showFilters
                              ? "text-purple-400"
                              : "text-white/60 hover:text-white"
                          }`}
                          data-ocid="stories.secondary_button"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              showFilters
                                ? "bg-purple-500/20 border border-purple-500/50"
                                : "bg-white/10"
                            }`}
                          >
                            <Sliders className="w-5 h-5" />
                          </div>
                          <span className="text-xs">Filter</span>
                        </button>
                      )}

                      {/* Tag button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowTagInput(!showTagInput);
                          setShowTextInput(false);
                          setShowFilters(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                          showTagInput
                            ? "text-blue-400"
                            : "text-white/60 hover:text-white"
                        }`}
                        data-ocid="stories.button"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            showTagInput
                              ? "bg-blue-500/20 border border-blue-500/50"
                              : "bg-white/10"
                          }`}
                        >
                          <AtSign className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Tag</span>
                      </button>
                    </div>

                    {/* Text panel */}
                    <AnimatePresence>
                      {showTextInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3"
                        >
                          <input
                            type="text"
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                            placeholder="Type text on story..."
                            maxLength={80}
                            className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none border-b border-white/15 pb-2"
                            data-ocid="stories.input"
                          />
                          {/* Color picker */}
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs mr-1">
                              Color
                            </span>
                            {TEXT_COLORS.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => setTextColor(c.value)}
                                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                                style={{
                                  backgroundColor: c.value,
                                  borderColor:
                                    textColor === c.value
                                      ? "#c084fc"
                                      : "transparent",
                                }}
                                title={c.label}
                              />
                            ))}
                          </div>
                          {/* Size picker */}
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs mr-1">
                              Size
                            </span>
                            {TEXT_SIZES.map((s) => (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => setTextSize(s)}
                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                                  textSize.value === s.value
                                    ? "bg-pink-500/30 text-pink-400 border border-pink-500/50"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Filter panel */}
                    <AnimatePresence>
                      {showFilters && !isVideo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full overflow-x-auto"
                        >
                          <div
                            className="flex gap-2.5 pb-1"
                            style={{ minWidth: "max-content" }}
                          >
                            {FILTERS.map((f) => (
                              <button
                                key={f.name}
                                type="button"
                                onClick={() => setSelectedFilter(f)}
                                className="flex flex-col items-center gap-1.5"
                                data-ocid="stories.tab"
                              >
                                <div
                                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                                    selectedFilter.name === f.name
                                      ? "border-pink-400 scale-105"
                                      : "border-white/15 hover:border-white/40"
                                  }`}
                                >
                                  <img
                                    src={mediaPreview!}
                                    alt={f.name}
                                    className="w-full h-full object-cover"
                                    style={{
                                      filter:
                                        f.css === "none" ? undefined : f.css,
                                    }}
                                  />
                                </div>
                                <span
                                  className={`text-xs ${
                                    selectedFilter.name === f.name
                                      ? "text-pink-400 font-semibold"
                                      : "text-white/50"
                                  }`}
                                >
                                  {f.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tag panel */}
                    <AnimatePresence>
                      {showTagInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                              placeholder="Username or Principal ID..."
                              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none border-b border-white/15 pb-1"
                              data-ocid="stories.search_input"
                            />
                            <button
                              type="button"
                              onClick={addTag}
                              className="text-xs px-3 py-1 rounded-full font-semibold text-white"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f9a8d4, #c084fc)",
                              }}
                              data-ocid="stories.save_button"
                            >
                              Add
                            </button>
                          </div>
                          {storyTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {storyTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f9a8d4, #c084fc)",
                                  }}
                                >
                                  @{tag}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStoryTags((prev) =>
                                        prev.filter((t) => t !== tag),
                                      )
                                    }
                                    className="ml-0.5 hover:opacity-70"
                                    data-ocid="stories.delete_button"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                ref={inputRef}
                id="story-media-input"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload progress */}
              <AnimatePresence>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full space-y-1.5"
                  >
                    <Progress
                      value={uploadProgress}
                      className="h-1.5 bg-white/10"
                    />
                    <p className="text-xs text-center text-white/40">
                      Uploading... {uploadProgress}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expiry badge */}
              <div className="flex items-center gap-1.5 bg-white/8 rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/50 font-medium">
                  Story expires in 24 hours
                </span>
              </div>

              {/* Action buttons */}
              <div className="w-full flex flex-col gap-2">
                {!mediaPreview ? (
                  <Button
                    onClick={() => inputRef.current?.click()}
                    className="w-full gradient-bg text-white border-0 rounded-2xl font-bold h-12 text-base"
                    data-ocid="stories.upload_button"
                  >
                    Choose Media
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || !mediaFile}
                    className="w-full gradient-bg text-white border-0 rounded-2xl font-bold h-12 text-base"
                    data-ocid="stories.submit_button"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sharing...
                      </span>
                    ) : (
                      "Add to Story"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
