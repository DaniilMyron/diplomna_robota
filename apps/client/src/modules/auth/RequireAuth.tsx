import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './providers/auth';

export function RequireAuth({ children }: PropsWithChildren) {
  const { isCheckingSession, user } = useAuth();

  if (isCheckingSession) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
