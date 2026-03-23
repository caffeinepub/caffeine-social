import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { StoryView } from "../backend";
import { useViewStory } from "../hooks/useViewStory";

interface StoryViewerProps {
  stories: StoryView[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { mutate: viewStory } = useViewStory();

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (currentStory) viewStory(currentStory.id);
  }, [currentStory, viewStory]);

  useEffect(() => {
    setProgress(0);
    const step = 100 / (STORY_DURATION / 100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    } else {
      if (currentIndex < stories.length - 1) setCurrentIndex((i) => i + 1);
      else onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      data-ocid="story.modal"
    >
      <div className="relative w-full max-w-sm h-full max-h-[100dvh] bg-card">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {stories.map((story, i) => (
            <div
              key={story.id.toString()}
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-none"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="story-ring w-9 h-9">
              <div className="story-ring-inner w-full h-full">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="gradient-bg text-white text-xs">
                    S
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">User</p>
              <p className="text-white/60 text-xs">
                {formatDistanceToNow(
                  Number(currentStory?.expiresAt ?? BigInt(0)) / 1_000_000 -
                    24 * 3600 * 1000,
                  { addSuffix: true },
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
            data-ocid="story.close_button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <button
          type="button"
          className="w-full h-full cursor-pointer block"
          onClick={handleTap}
          aria-label="Tap to navigate story"
        >
          {currentStory?.media ? (
            <img
              src={currentStory.media.getDirectURL()}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-bg flex items-center justify-center">
              <p className="text-white text-2xl font-bold px-8 text-center">
                Story
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
