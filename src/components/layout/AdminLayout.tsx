import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  ClipboardList,
  Users,
  FileSpreadsheet,
  History,
  Menu,
  X,
  ArrowLeft,
  Bell,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Listings', path: '/admin/listings', icon: Building },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck, badge: 0 },
    { name: 'Valuations', path: '/admin/valuations', icon: ClipboardList, badge: 0 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-surface border-r border-brand-border">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-brand-border flex items-center justify-between">
        <Logo variant="dark" />
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-brand-background text-brand-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted px-3 mb-2">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-brand-ink/80 hover:bg-brand-background hover:text-brand-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accent-light' : 'text-brand-muted'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-brand-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-brand-border space-y-2">
        <Button variant="outline" size="sm" asChild className="w-full justify-start text-xs border-brand-border">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-brand-background">
      {/* Desktop/Tablet Static Sidebar (lg:flex) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-brand-surface shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Navigation Bar */}
        <header className="h-16 border-b border-brand-border bg-brand-surface/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-brand-background text-brand-ink"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif font-semibold text-lg text-brand-primary">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-brand-background text-brand-muted hover:text-brand-ink relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent"></span>
              </button>
            </div>
            <div className="h-6 w-px bg-brand-border"></div>
            <div className="flex items-center gap-2 text-sm text-brand-ink font-medium">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-xs font-bold">
                AD
              </div>
              <span className="hidden sm:inline">Administrator</span>
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
