import { Link } from "@tanstack/react-router";
import {
  Film,
  Home,
  MessageCircle,
  Search,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Search", icon: Search },
  { to: "/reels", label: "Reels", icon: Film },
  { to: "/messages", label: "DMs", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur border-t border-border flex md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          activeProps={{
            className:
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-primary",
          }}
          data-ocid="nav.link"
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
