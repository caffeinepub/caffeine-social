import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGetNotifications } from '../hooks/useGetNotifications';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { data: notifications = [] } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { data: userProfile } = useGetCallerUserProfile();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notificationId: bigint) => {
    markAsRead(notificationId);
  };

  const getNotificationText = (notification: any) => {
    const type = notification._type;
    if (type === 'like') return 'liked your post';
    if (type === 'comment') return 'commented on your post';
    if (type === 'follow') return 'started following you';
    return 'interacted with your content';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-2 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id.toString()}
                onClick={() => handleNotificationClick(notification.id)}
                className={`px-4 py-3 cursor-pointer ${
                  !notification.read ? 'bg-accent/50' : ''
                }`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-sm">
                    <span className="font-medium">Someone</span>{' '}
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(Number(notification.createdAt) / 1_000_000, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
