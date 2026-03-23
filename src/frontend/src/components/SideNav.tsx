import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CreditCard,
  Film,
  Home,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/reels", label: "Reels", icon: Film },
  { to: "/stories", label: "Stories", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/subscribe", label: "Subscribe", icon: CreditCard },
];

export default function SideNav() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-background flex flex-col pt-14 pb-4 z-40">
      <div className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm font-medium"
            activeProps={{
              className:
                "flex items-center gap-3 px-3 py-3 rounded-xl text-foreground bg-secondary font-semibold text-sm",
            }}
            data-ocid="nav.link"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </div>
      {isAuthenticated && (
        <div className="px-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm font-medium w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
