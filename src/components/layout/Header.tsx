import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Building2, ClipboardList, User, Calendar, LogIn, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  // We will wire up real auth state in Phase 3
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  isAdmin = false,
  userName = 'User',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on navigate
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Listings', path: '/properties', icon: Building2 },
    { name: 'Request Valuation', path: '/valuation/new', icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo variant="dark" />

        {/* Desktop Navigation (>= 768px tablet & desktop) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-primary bg-brand-background font-semibold'
                    : 'text-brand-ink/80 hover:text-brand-primary hover:bg-brand-background/60'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth / CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="border-brand-primary text-brand-primary">
                  <Link to="/admin" className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-brand-accent" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/account/bookings" className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-muted" />
                  <span>My Bookings</span>
                </Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/account/profile" className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-muted" />
                  <span>{userName}</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button (< 768px) */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg text-brand-ink hover:text-brand-primary hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-brand-surface px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium min-h-[44px] ${
                      isActive
                        ? 'text-brand-primary bg-brand-background font-semibold'
                        : 'text-brand-ink hover:text-brand-primary hover:bg-brand-background/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-brand-accent" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="pt-4 border-t border-brand-border/80 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button variant="outline" asChild className="w-full justify-start h-11 border-brand-primary">
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-brand-accent" />
                      <span>Admin Panel</span>
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="w-full justify-start h-11">
                  <Link to="/account/bookings" className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-muted" />
                    <span>My Bookings</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start h-11">
                  <Link to="/account/valuations" className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-brand-muted" />
                    <span>My Valuations</span>
                  </Link>
                </Button>
                <Button variant="secondary" asChild className="w-full justify-start h-11">
                  <Link to="/account/profile" className="flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-muted" />
                    <span>Profile ({userName})</span>
                  </Link>
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" asChild className="h-11">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="default" asChild className="h-11">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
