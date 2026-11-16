import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  // In Phase 1, auth state is placeholder. In Phase 3, this reads from useAuth()
  const isAuthenticated = true;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};
