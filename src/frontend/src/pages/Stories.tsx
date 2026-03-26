import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import InstagramUploadModal from "../components/InstagramUploadModal";
import StoryViewer from "../components/StoryViewer";
import { useGetActiveStories } from "../hooks/useGetActiveStories";

const STORY_COLORS = [
  "from-pink-500 to-violet-600",
  "from-orange-400 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-cyan-500",
  "from-yellow-400 to-orange-500",
  "from-violet-500 to-purple-600",
];

export default function Stories() {
  const { data: stories = [], isLoading } = useGetActiveStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="stories.loading_state"
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stories</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 gradient-bg text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90"
          data-ocid="stories.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          Add Story
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-20" data-ocid="stories.empty_state">
          <div className="w-20 h-20 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg font-semibold mb-1">No stories yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to share a story!
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gradient-bg text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90"
            data-ocid="stories.primary_button"
          >
            Create Story
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          data-ocid="stories.list"
        >
          {stories.map((story, index) => (
            <button
              key={story.id.toString()}
              type="button"
              onClick={() => handleStoryClick(index)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden group"
              data-ocid={`stories.item.${index + 1}`}
            >
              {story.media ? (
                <img
                  src={story.media.getDirectURL()}
                  alt="Story"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    STORY_COLORS[index % STORY_COLORS.length]
                  } flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <div className="story-ring w-10 h-10">
                  <div className="story-ring-inner w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarFallback className="gradient-bg text-white text-xs font-bold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
              <p className="absolute bottom-3 left-3 text-white text-xs font-medium">
                {new Date(
                  Number(story.expiresAt) / 1_000_000 - 24 * 3600 * 1000,
                ).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      <InstagramUploadModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultType="story"
      />

      {viewerOpen && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
