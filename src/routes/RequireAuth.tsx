import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'not_configured' }} />;
  }

  if (isLoading) {
    return <div style={{ padding: '1rem' }}>Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

