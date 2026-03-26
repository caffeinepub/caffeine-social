import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import LoginButton from "../components/LoginButton";
import { useActor } from "../hooks/useActor";
import { useGetConversations } from "../hooks/useGetConversations";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const SAMPLE_CONVERSATIONS = [
  {
    name: "sarah_k",
    initial: "SK",
    lastMessage: "That photo is gorgeous! Where was it taken?",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    name: "ali_hassan",
    initial: "AH",
    lastMessage: "Thanks for the follow! 🙏",
    time: "18m",
    unread: 1,
    online: true,
  },
  {
    name: "priya_m",
    initial: "PM",
    lastMessage: "Loved your latest reel!",
    time: "1h",
    unread: 0,
    online: false,
  },
  {
    name: "jake_t",
    initial: "JT",
    lastMessage: "We should collab sometime 🎥",
    time: "3h",
    unread: 0,
    online: false,
  },
  {
    name: "luna_b",
    initial: "LB",
    lastMessage: "Haha yes exactly! 😂",
    time: "5h",
    unread: 0,
    online: true,
  },
];

function NewMessageDialog({
  open,
  onClose,
  onStart,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (principalStr: string) => void;
}) {
  const [principalInput, setPrincipalInput] = useState("");

  const handleStart = () => {
    const trimmed = principalInput.trim();
    if (!trimmed) return;
    onStart(trimmed);
    setPrincipalInput("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="messages.dialog">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Enter Principal ID..."
            value={principalInput}
            onChange={(e) => setPrincipalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
            data-ocid="messages.input"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleStart}
              disabled={!principalInput.trim()}
              className="gradient-bg text-white border-0 flex-1"
              data-ocid="messages.submit_button"
            >
              Start Chat
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="messages.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChatWindow({
  principalStr,
  onBack,
}: { principalStr: string; onBack: () => void }) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);

  let recipientPrincipal: Principal | null = null;
  try {
    recipientPrincipal = Principal.fromText(principalStr);
  } catch {
    recipientPrincipal = null;
  }

  const { data: backendMessages = [] } = useQuery({
    queryKey: ["messages", principalStr],
    queryFn: async () => {
      if (!actor || !recipientPrincipal) return [];
      return actor.getMessages(recipientPrincipal);
    },
    enabled: !!actor && !actorFetching && !!identity && !!recipientPrincipal,
    refetchInterval: 5000,
  });

  const myPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !actor || !recipientPrincipal || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    setIsTyping(false);
    try {
      await actor.sendMessage(recipientPrincipal, text);
      queryClient.invalidateQueries({ queryKey: ["messages", principalStr] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      toast.error("Failed to send message");
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const displayName =
    principalStr.length > 16
      ? `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`
      : principalStr;

  const FALLBACK_MESSAGES = [
    {
      id: 1,
      text: "Hey! Loved your latest post 🔥",
      mine: false,
      time: "10:30",
    },
    {
      id: 2,
      text: "Thank you so much! Really appreciate it 😊",
      mine: true,
      time: "10:32",
    },
    {
      id: 3,
      text: "Keep posting, your content is fire!",
      mine: false,
      time: "10:35",
    },
  ];

  const displayMessages =
    backendMessages.length > 0
      ? backendMessages.map((msg: any) => ({
          id: msg.id?.toString() ?? Math.random(),
          text: msg.content,
          mine: msg.sender?.toString() === myPrincipal,
          time: msg.createdAt
            ? new Date(Number(msg.createdAt) / 1_000_000).toLocaleTimeString(
                "en",
                { hour: "2-digit", minute: "2-digit" },
              )
            : "",
        }))
      : FALLBACK_MESSAGES;

  return (
    <div
      className="flex flex-col h-[calc(100dvh-56px-56px)] md:h-[calc(100dvh-56px)]"
      data-ocid="messages.panel"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-foreground md:hidden"
          data-ocid="messages.close_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="story-ring w-9 h-9">
          <div className="story-ring-inner w-full h-full">
            <Avatar className="w-full h-full">
              <AvatarFallback className="gradient-bg text-white text-xs font-bold">
                {principalStr.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-green-400">Active now</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {displayMessages.map((msg, i) => (
            <div
              key={`${msg.id}-${i}`}
              className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
              data-ocid={`messages.item.${i + 1}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.mine
                    ? "gradient-bg text-white rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text}
                <p className="text-[10px] mt-1 opacity-60 text-right">
                  {msg.time}
                </p>
              </div>
              {/* Seen indicator under last sent message */}
              {i === displayMessages.length - 1 && msg.mine && (
                <p className="absolute text-[10px] text-muted-foreground text-right mt-0.5 mr-2 self-end translate-y-5">
                  Seen
                </p>
              )}
            </div>
          ))}
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mt-2">
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0">
        <input
          type="text"
          placeholder="Message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          data-ocid="messages.input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
          className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50"
          data-ocid="messages.submit_button"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Messages() {
  const { identity } = useInternetIdentity();
  const [activeConvPrincipal, setActiveConvPrincipal] = useState<string | null>(
    null,
  );
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedSamples, setDeletedSamples] = useState<Set<string>>(new Set());
  const [deletedBackend, setDeletedBackend] = useState<Set<string>>(new Set());
  const { data: conversations = [], isLoading: convLoading } =
    useGetConversations();

  const handleDeleteSample = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletedSamples((prev) => new Set([...prev, name]));
    toast.success("Conversation deleted");
  };

  const handleDeleteBackend = (principal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletedBackend((prev) => new Set([...prev, principal]));
    toast.success("Conversation deleted");
  };

  const filteredConversations = conversations.filter(
    (p: Principal) =>
      !deletedBackend.has(p.toString()) &&
      p.toString().toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSamples = SAMPLE_CONVERSATIONS.filter(
    (c) =>
      !deletedSamples.has(c.name) &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Login to access messages</p>
        <p className="text-sm text-muted-foreground mb-6">
          Connect with your friends and followers.
        </p>
        <LoginButton />
      </div>
    );
  }

  if (activeConvPrincipal) {
    return (
      <ChatWindow
        principalStr={activeConvPrincipal}
        onBack={() => setActiveConvPrincipal(null)}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto" data-ocid="messages.list">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold">Messages</h1>
        <button
          type="button"
          onClick={() => setNewMsgOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center gradient-bg text-white hover:opacity-90"
          data-ocid="messages.open_modal_button"
          aria-label="New message"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            data-ocid="messages.search_input"
          />
        </div>
      </div>

      {convLoading ? (
        <div
          className="divide-y divide-border"
          data-ocid="messages.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-2.5 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length > 0 ? (
        <div className="divide-y divide-border">
          {filteredConversations.map((principal: Principal, idx: number) => (
            <div
              key={principal.toString()}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
              data-ocid={`messages.item.${idx + 1}`}
            >
              <button
                type="button"
                onClick={() => setActiveConvPrincipal(principal.toString())}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="story-ring w-12 h-12 flex-shrink-0">
                  <div className="story-ring-inner w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarFallback className="gradient-bg text-white text-sm font-bold">
                        {principal.toString().slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {principal.toString().slice(0, 12)}...
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Tap to view messages
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteBackend(principal.toString(), e)}
                className="opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all flex-shrink-0"
                aria-label="Delete conversation"
                data-ocid={`messages.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredSamples.map((conv, idx) => (
            <div
              key={conv.name}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
              data-ocid={`messages.item.${idx + 1}`}
            >
              <button
                type="button"
                onClick={() => setActiveConvPrincipal(conv.name)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="relative">
                  <div className="story-ring w-12 h-12">
                    <div className="story-ring-inner w-full h-full">
                      <Avatar className="w-full h-full">
                        <AvatarFallback className="gradient-bg text-white text-sm font-bold">
                          {conv.initial}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{conv.name}</p>
                    <p className="text-xs text-muted-foreground">{conv.time}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                    {conv.unread}
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteSample(conv.name, e)}
                className="md:opacity-0 md:group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all flex-shrink-0"
                aria-label="Delete conversation"
                data-ocid={`messages.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {conversations.length === 0 &&
        !convLoading &&
        filteredSamples.length === 0 &&
        searchQuery && (
          <div className="text-center py-8" data-ocid="messages.empty_state">
            <p className="text-sm text-muted-foreground">
              No conversations found for "{searchQuery}"
            </p>
          </div>
        )}

      {conversations.length === 0 && !convLoading && !searchQuery && (
        <div
          className="text-center py-10 border-t border-border"
          data-ocid="messages.empty_state"
        >
          <p className="font-semibold">Start a real conversation</p>
          <p className="text-sm text-muted-foreground mt-1">
            Enter a Principal ID to message someone
          </p>
          <Button
            className="gradient-bg text-white border-0 mt-4"
            onClick={() => setNewMsgOpen(true)}
            data-ocid="messages.primary_button"
          >
            New Message
          </Button>
        </div>
      )}

      <NewMessageDialog
        open={newMsgOpen}
        onClose={() => setNewMsgOpen(false)}
        onStart={(p) => setActiveConvPrincipal(p)}
      />
    </div>
  );
}
