import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import LoginButton from "./LoginButton";
import NotificationBell from "./NotificationBell";

export default function TopHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4 md:left-64">
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="gradient-text text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        data-ocid="nav.link"
      >
        Saminsta
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <NotificationBell />
            <Link to="/messages" data-ocid="nav.link">
              <MessageCircle className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
            </Link>
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}
