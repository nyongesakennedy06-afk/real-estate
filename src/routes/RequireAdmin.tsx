import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RequireAdminProps {
  children: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-brand-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <span className="text-xs font-semibold text-brand-muted tracking-wider uppercase">
          Verifying administrative privileges...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    toast.error('Access restricted. Administrative privileges required.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
