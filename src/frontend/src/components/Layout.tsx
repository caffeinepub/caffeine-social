import { Outlet } from "@tanstack/react-router";
import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import TopHeader from "./TopHeader";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed top header */}
      <TopHeader />

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SideNav />
      </div>

      {/* Main content — padded for top header (56px) + bottom nav (56px) */}
      <main className="flex-1 pt-14 pb-16 md:pb-0 md:pl-64">
        {children || <Outlet />}
      </main>

      {/* Bottom nav (mobile only) */}
      <BottomNav />

      {/* Footer */}
      <footer className="hidden md:block border-t border-border py-4 md:pl-64">
        <div className="max-w-xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Saminsta. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-text font-medium hover:opacity-80"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
