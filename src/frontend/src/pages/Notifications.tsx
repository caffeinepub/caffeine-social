import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Heart, MessageCircle, UserPlus } from "lucide-react";
import LoginButton from "../components/LoginButton";
import { useGetNotifications } from "../hooks/useGetNotifications";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMarkNotificationAsRead } from "../hooks/useMarkNotificationAsRead";

function getNotifIcon(type: string) {
  if (type.includes("like") || type.includes("Like"))
    return <Heart className="w-4 h-4 text-red-400" />;
  if (type.includes("comment") || type.includes("Comment"))
    return <MessageCircle className="w-4 h-4 text-blue-400" />;
  if (type.includes("follow") || type.includes("Follow"))
    return <UserPlus className="w-4 h-4 text-green-400" />;
  return <Bell className="w-4 h-4 text-primary" />;
}

function getNotifText(type: string) {
  if (type.includes("like") || type.includes("Like")) return "liked your post";
  if (type.includes("comment") || type.includes("Comment"))
    return "commented on your post";
  if (type.includes("follow") || type.includes("Follow"))
    return "started following you";
  return type;
}

export default function Notifications() {
  const { identity } = useInternetIdentity();
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markRead } = useMarkNotificationAsRead();

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Login to see notifications</p>
        <p className="text-sm text-muted-foreground mb-6">
          Stay updated on likes, comments and follows.
        </p>
        <LoginButton />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = () => {
    for (const n of unread) {
      markRead(n.id);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div
        className="flex items-center justify-between px-4 py-4 border-b border-border"
        data-ocid="notifications.panel"
      >
        <h1 className="text-xl font-bold">Notifications</h1>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold"
            data-ocid="notifications.button"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          className="divide-y divide-border"
          data-ocid="notifications.loading_state"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-48 mb-1.5" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <>
          <div
            className="text-center py-10"
            data-ocid="notifications.empty_state"
          >
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              When someone likes or comments, you&apos;ll see it here.
            </p>
          </div>
          <div className="divide-y divide-border">
            {SAMPLE_NOTIFS.map((n, idx) => (
              <div
                key={n.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  n.unread ? "bg-primary/5" : ""
                }`}
                data-ocid={`notifications.item.${idx + 1}`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {n.initial}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                    {n.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{n.user}</span> {n.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.time}
                  </p>
                </div>
                {n.unread && (
                  <div className="w-2.5 h-2.5 gradient-bg rounded-full" />
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="divide-y divide-border" data-ocid="notifications.list">
          {notifications.map((notif, idx) => (
            <button
              key={notif.id.toString()}
              type="button"
              onClick={() => !notif.read && markRead(notif.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left ${
                !notif.read ? "bg-primary/5" : ""
              }`}
              data-ocid={`notifications.item.${idx + 1}`}
            >
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="gradient-bg text-white text-sm font-bold">
                    {notif.senderId.toString().slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                  {getNotifIcon(notif._type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">
                    {notif.senderId.toString().slice(0, 8)}...
                  </span>{" "}
                  {getNotifText(notif._type)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(Number(notif.createdAt) / 1_000_000, {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 gradient-bg rounded-full flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SAMPLE_NOTIFS = [
  {
    id: 1,
    initial: "SK",
    user: "sarah_k",
    action: "liked your post",
    time: "2m ago",
    unread: true,
    icon: <Heart className="w-3 h-3 text-red-400" />,
  },
  {
    id: 2,
    initial: "AH",
    user: "ali_hassan",
    action: "started following you",
    time: "15m ago",
    unread: true,
    icon: <UserPlus className="w-3 h-3 text-green-400" />,
  },
  {
    id: 3,
    initial: "PM",
    user: "priya_m",
    action: 'commented: "This is amazing! 🔥"',
    time: "1h ago",
    unread: false,
    icon: <MessageCircle className="w-3 h-3 text-blue-400" />,
  },
  {
    id: 4,
    initial: "JT",
    user: "jake_t",
    action: "liked your post",
    time: "3h ago",
    unread: false,
    icon: <Heart className="w-3 h-3 text-red-400" />,
  },
  {
    id: 5,
    initial: "LB",
    user: "luna_b",
    action: "started following you",
    time: "5h ago",
    unread: false,
    icon: <UserPlus className="w-3 h-3 text-green-400" />,
  },
  {
    id: 6,
    initial: "OF",
    user: "omar_f",
    action: 'commented: "Keep it up! 💪"',
    time: "1d ago",
    unread: false,
    icon: <MessageCircle className="w-3 h-3 text-blue-400" />,
  },
];
