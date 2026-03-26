import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import type { PostView } from "../backend";
import { useGetFeed } from "../hooks/useGetFeed";

const FILTER_TABS = ["All", "Photos", "Videos", "People"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const TRENDING_HASHTAGS = [
  "#funny",
  "#gym",
  "#reels",
  "#dance",
  "#fashion",
  "#tech",
  "#cricket",
  "#travel",
  "#food",
  "#art",
  "#viral",
  "#music",
  "#photography",
  "#fitness",
  "#memes",
];

const GRADIENT_PLACEHOLDERS = [
  "from-violet-900 to-pink-700",
  "from-blue-900 to-cyan-600",
  "from-rose-900 to-orange-600",
  "from-emerald-900 to-teal-600",
  "from-amber-900 to-yellow-600",
  "from-indigo-900 to-violet-600",
  "from-pink-900 to-rose-600",
  "from-teal-900 to-green-600",
  "from-orange-900 to-amber-600",
];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const { data: posts = [], isLoading } = useGetFeed();
  const navigate = useNavigate();

  const filtered = posts.filter((p) => {
    const searchStr = query || (activeHashtag ?? "");
    const matchesQuery =
      searchStr === "" ||
      p.content.toLowerCase().includes(searchStr.toLowerCase());
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Photos" && !!p.media) ||
      (activeTab === "Videos" && !!p.media) ||
      activeTab === "People";
    return matchesQuery && matchesTab;
  });

  const displayPosts =
    filtered.length > 0
      ? filtered
      : posts.length === 0
        ? SAMPLE_EXPLORE_POSTS
        : [];

  // Extract unique authors for People tab
  const allPosts = posts.length > 0 ? posts : SAMPLE_EXPLORE_POSTS;
  const authorMap = new Map<string, { principal: string; name: string }>();
  for (const p of allPosts) {
    const pid = p.author.toString();
    if (!authorMap.has(pid)) {
      authorMap.set(pid, { principal: pid, name: pid });
    }
  }
  const authors = Array.from(authorMap.values()).filter((a) =>
    query ? a.principal.toLowerCase().includes(query.toLowerCase()) : true,
  );

  const handleHashtag = (tag: string) => {
    setActiveHashtag(activeHashtag === tag ? null : tag);
    setQuery("");
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts, people..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveHashtag(null);
          }}
          className="w-full bg-secondary border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          data-ocid="explore.search_input"
        />
      </div>

      {/* Trending hashtags */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-medium mb-2">
          Trending
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {TRENDING_HASHTAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleHashtag(tag)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeHashtag === tag
                  ? "gradient-bg text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
              }`}
              data-ocid="explore.tab"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 mb-4 overflow-x-auto scrollbar-none"
        data-ocid="explore.tab"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? "gradient-bg text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="explore.tab"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* People tab */}
      {activeTab === "People" ? (
        isLoading ? (
          <div className="space-y-3" data-ocid="explore.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-20" data-ocid="explore.empty_state">
            <p className="text-lg font-semibold mb-1">No users found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search
            </p>
          </div>
        ) : (
          <div className="space-y-1" data-ocid="explore.list">
            {authors.map((author, idx) => (
              <button
                key={author.principal}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/user/$userId",
                    params: { userId: author.principal },
                  })
                }
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                data-ocid={`explore.item.${idx + 1}`}
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className="gradient-bg text-white font-bold">
                    {author.principal.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {author.principal.slice(0, 12)}...
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {author.principal}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gradient-bg text-white border-0 hover:opacity-90 flex-shrink-0 pointer-events-none"
                  data-ocid="explore.primary_button"
                  asChild={false}
                >
                  View Profile
                </Button>
              </button>
            ))}
          </div>
        )
      ) : /* Grid for All/Photos/Videos */
      isLoading ? (
        <div
          className="grid grid-cols-3 gap-0.5"
          data-ocid="explore.loading_state"
        >
          {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"].map((k) => (
            <Skeleton key={k} className="aspect-square" />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-20" data-ocid="explore.empty_state">
          <p className="text-lg font-semibold mb-1">No results</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5" data-ocid="explore.list">
          {displayPosts.map((post, idx) => (
            <button
              key={post.id.toString()}
              type="button"
              onClick={() =>
                navigate({
                  to: "/user/$userId",
                  params: { userId: post.author.toString() },
                })
              }
              className="aspect-square overflow-hidden relative group cursor-pointer"
              data-ocid={`explore.item.${idx + 1}`}
            >
              {post.media ? (
                <img
                  src={post.media.getDirectURL()}
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length]
                  } flex items-center justify-center`}
                >
                  <p className="text-white text-xs text-center px-2 line-clamp-3 font-medium">
                    {post.content}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs font-semibold">
                  ❤️ {post.likes.length}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SAMPLE_EXPLORE_POSTS: PostView[] = [
  {
    id: BigInt(101),
    content: "🌸 Cherry blossoms in full bloom — Tokyo spring is unreal",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "aaa111",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "aaa111",
    } as any,
    likes: Array(142),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(102),
    content: '🎨 New digital art drop — "Neon Dreamscape" collection',
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "bbb222",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "bbb222",
    } as any,
    likes: Array(89),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(103),
    content: "🍜 Homemade ramen at 2am hits different — recipe in bio",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "ccc333",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "ccc333",
    } as any,
    likes: Array(267),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(104),
    content: "🏄 Surfing golden hour — nothing beats this feeling",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "ddd444",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "ddd444",
    } as any,
    likes: Array(198),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(105),
    content: '📚 Currently reading: "The Midnight Library" — 10/10 recommend',
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "eee555",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "eee555",
    } as any,
    likes: Array(54),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(106),
    content: "🌙 Late night coding session — building something cool 👀",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "fff666",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "fff666",
    } as any,
    likes: Array(322),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(107),
    content: "🎸 Jam session with the crew — pure magic",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "ggg777",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "ggg777",
    } as any,
    likes: Array(75),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(108),
    content: "🌊 Ocean therapy — reset your mind, body, soul",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "hhh888",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "hhh888",
    } as any,
    likes: Array(411),
    comments: [],
    media: undefined,
  },
  {
    id: BigInt(109),
    content: "☕ Morning ritual — coffee, journal, gratitude",
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    author: {
      toString: () => "iii999",
      isAnonymous: () => false,
      compareTo: () => "eq",
      toUint8Array: () => new Uint8Array(),
      toText: () => "iii999",
    } as any,
    likes: Array(188),
    comments: [],
    media: undefined,
  },
];
