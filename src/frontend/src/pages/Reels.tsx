import { useRef, useEffect, useState } from 'react';
import { useGetFeed } from '../hooks/useGetFeed';
import ReelPlayer from '../components/ReelPlayer';
import { Loader2 } from 'lucide-react';

export default function Reels() {
  const { data: allPosts = [], isLoading } = useGetFeed();
  const [visibleReelIndex, setVisibleReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter posts that have video media
  const reels = allPosts.filter((post) => post.media);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const index = Math.round(scrollTop / windowHeight);
      setVisibleReelIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">No reels available</p>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {reels.map((reel, index) => (
        <ReelPlayer
          key={reel.id.toString()}
          post={reel}
          authorUsername="User"
          isInView={index === visibleReelIndex}
        />
      ))}
    </div>
  );
}
