import { Link, useNavigate } from '@tanstack/react-router';
import { Home, Film, Image, User, CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginButton from './LoginButton';
import NotificationBell from './NotificationBell';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/stories', label: 'Stories', icon: Image },
    { to: '/reels', label: 'Reels', icon: Film },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/subscribe', label: 'Subscribe', icon: CreditCard },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Caffeine Social
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                activeProps={{ className: 'text-primary' }}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <>
                <NotificationBell />
                <span className="text-sm font-medium text-foreground/80">
                  {userProfile.username}
                </span>
              </>
            )}
            <LoginButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  activeProps={{ className: 'text-primary' }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {isAuthenticated && userProfile && (
                  <>
                    <NotificationBell />
                    <span className="text-sm font-medium text-foreground/80">
                      {userProfile.username}
                    </span>
                  </>
                )}
                <LoginButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
