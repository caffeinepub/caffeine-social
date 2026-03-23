import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import LoginButton from "../components/LoginButton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Conversation {
  id: number;
  name: string;
  initial: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  mine: boolean;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "sarah_k",
    initial: "SK",
    lastMessage: "That photo is gorgeous! Where was it taken?",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "ali_hassan",
    initial: "AH",
    lastMessage: "Thanks for the follow! 🙏",
    time: "18m",
    unread: 1,
    online: true,
  },
  {
    id: 3,
    name: "priya_m",
    initial: "PM",
    lastMessage: "Loved your latest reel!",
    time: "1h",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "jake_t",
    initial: "JT",
    lastMessage: "We should collab sometime 🎥",
    time: "3h",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "luna_b",
    initial: "LB",
    lastMessage: "Haha yes exactly! 😂",
    time: "5h",
    unread: 0,
    online: true,
  },
  {
    id: 6,
    name: "omar_f",
    initial: "OF",
    lastMessage: "Check out my new post!",
    time: "1d",
    unread: 0,
    online: false,
  },
];

const CHAT_MESSAGES: Record<number, Message[]> = {
  1: [
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
      text: "That photo is gorgeous! Where was it taken?",
      mine: false,
      time: "10:35",
    },
  ],
  2: [
    { id: 1, text: "Just followed you!", mine: false, time: "9:00" },
    { id: 2, text: "Thanks for the follow! 🙏", mine: false, time: "9:01" },
  ],
};

export default function Messages() {
  const { identity } = useInternetIdentity();
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] =
    useState<Record<number, Message[]>>(CHAT_MESSAGES);

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

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const msg: Message = {
      id: Date.now(),
      text: input.trim(),
      mine: true,
      time: new Date().toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] ?? []), msg],
    }));
    setInput("");
  };

  if (activeConv) {
    const convMessages = messages[activeConv.id] ?? [];
    return (
      <div
        className="flex flex-col h-[calc(100dvh-56px-56px)] md:h-[calc(100dvh-56px)] max-w-lg mx-auto"
        data-ocid="messages.panel"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <button
            type="button"
            onClick={() => setActiveConv(null)}
            className="text-foreground"
            data-ocid="messages.close_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="story-ring w-9 h-9">
            <div className="story-ring-inner w-full h-full">
              <Avatar className="w-full h-full">
                <AvatarFallback className="gradient-bg text-white text-xs font-bold">
                  {activeConv.initial}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{activeConv.name}</p>
            {activeConv.online && (
              <p className="text-xs text-green-400">Active now</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {convMessages.length === 0 ? (
            <div className="text-center py-10" data-ocid="messages.empty_state">
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hi! 👋
              </p>
            </div>
          ) : (
            convMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                data-ocid={`messages.item.${msg.id}`}
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
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            data-ocid="messages.input"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center hover:opacity-90"
            data-ocid="messages.submit_button"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto" data-ocid="messages.list">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold">Messages</h1>
        <span className="text-xs text-muted-foreground">Direct messages</span>
      </div>
      <div className="divide-y divide-border">
        {CONVERSATIONS.map((conv, idx) => (
          <button
            key={conv.id}
            type="button"
            onClick={() => setActiveConv(conv)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            data-ocid={`messages.item.${idx + 1}`}
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
              <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {conv.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
