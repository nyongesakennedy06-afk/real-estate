import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Menu,
  X,
  Home,
  Building2,
  ClipboardList,
  User,
  Calendar,
  LogIn,
  ShieldAlert,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Listings', path: '/properties', icon: Building2 },
    { name: 'Request Valuation', path: '/valuation/new', icon: ClipboardList },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo variant="dark" />

        {/* Desktop Navigation */}
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

        {/* Desktop Auth / User Menu */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 relative">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="border-brand-primary text-brand-primary hover:bg-brand-background">
                  <Link to="/admin" className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-brand-accent" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              )}

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-background text-sm font-medium text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-brand-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-brand-surface border border-brand-border shadow-lg py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-brand-border/60">
                      <p className="text-xs font-semibold text-brand-primary truncate">{displayName}</p>
                      <p className="text-[11px] text-brand-muted truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account/bookings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-ink hover:bg-brand-background hover:text-brand-primary transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-brand-accent" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/account/valuations"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-ink hover:bg-brand-background hover:text-brand-primary transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 text-brand-accent" />
                      <span>My Valuations</span>
                    </Link>

                    <Link
                      to="/account/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-ink hover:bg-brand-background hover:text-brand-primary transition-colors"
                    >
                      <User className="w-4 h-4 text-brand-accent" />
                      <span>Profile Settings</span>
                    </Link>

                    <div className="border-t border-brand-border/60 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
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

      {/* Mobile Drawer Menu */}
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
            {user ? (
              <>
                <div className="px-3 py-2 bg-brand-background rounded-lg border border-brand-border mb-1">
                  <p className="text-sm font-semibold text-brand-primary">{displayName}</p>
                  <p className="text-xs text-brand-muted">{user.email}</p>
                </div>

                {isAdmin && (
                  <Button variant="outline" asChild className="w-full justify-start h-11 border-brand-primary text-brand-primary">
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-brand-accent" />
                      <span>Admin Panel</span>
                    </Link>
                  </Button>
                )}

                <Button variant="outline" asChild className="w-full justify-start h-11">
                  <Link to="/account/bookings" className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-accent" />
                    <span>My Bookings</span>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start h-11">
                  <Link to="/account/valuations" className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-brand-accent" />
                    <span>My Valuations</span>
                  </Link>
                </Button>

                <Button variant="secondary" asChild className="w-full justify-start h-11">
                  <Link to="/account/profile" className="flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-accent" />
                    <span>Profile Settings</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full justify-start h-11 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5 mr-2 text-rose-600" />
                  <span>Log Out</span>
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" asChild className="h-11">
                  <Link to="/login">Log In</Link>
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
