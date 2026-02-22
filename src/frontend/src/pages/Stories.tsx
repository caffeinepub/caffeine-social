import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useGetActiveStories } from '../hooks/useGetActiveStories';
import StoryViewer from '../components/StoryViewer';
import CreateStoryForm from '../components/CreateStoryForm';
import { Loader2 } from 'lucide-react';

export default function Stories() {
  const { data: stories = [], isLoading } = useGetActiveStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Stories</h1>
        <div className="fixed bottom-8 right-8 z-40">
          <CreateStoryForm />
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-semibold mb-2">No active stories</p>
          <p className="text-muted-foreground">Be the first to share a story!</p>
        </div>
      ) : (
        <>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {stories.map((story, index) => (
                <button
                  key={story.id.toString()}
                  onClick={() => handleStoryClick(index)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-500">
                      <Avatar className="w-full h-full border-4 border-background">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                          ?
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-xs text-center max-w-[80px] truncate">User</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {stories.map((story, index) => (
              <button
                key={story.id.toString()}
                onClick={() => handleStoryClick(index)}
                className="aspect-[9/16] rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              >
                {story.media && (
                  <img
                    src={story.media.getDirectURL()}
                    alt="Story thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {viewerOpen && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
