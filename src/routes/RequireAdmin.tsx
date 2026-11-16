import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAdminProps {
  children: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  // In Phase 1, placeholder. In Phase 3, this checks useAuth().isAdmin
  const isAdmin = true;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
