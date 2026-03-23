import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useGetNotifications } from "../hooks/useGetNotifications";

export default function NotificationBell() {
  const { data: notifications = [] } = useGetNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Link
      to="/notifications"
      className="relative"
      data-ocid="notifications.link"
    >
      <Bell className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 gradient-bg rounded-full flex items-center justify-center text-[9px] text-white font-bold">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
