import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useViewStory } from '../hooks/useViewStory';
import type { StoryView } from '../backend';

interface StoryViewerProps {
  stories: StoryView[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { mutate: viewStory } = useViewStory();

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 7000; // 7 seconds

  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id);
    }
  }, [currentStory, viewStory]);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / STORY_DURATION) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            {index === currentIndex && (
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            )}
            {index < currentIndex && <div className="h-full bg-white" />}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
              ?
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-medium">User</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Story content */}
      <div onClick={handleTap} className="w-full h-full flex items-center justify-center cursor-pointer">
        {currentStory?.media && (
          <img
            src={currentStory.media.getDirectURL()}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}
      {currentIndex < stories.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
}
