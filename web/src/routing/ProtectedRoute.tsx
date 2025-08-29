// src/routing/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { PATHS } from './paths';

export const ProtectedRoute = () => {
  const { user, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <LoadingOverlay message="Verifying your account..." />;
  }

  return user ? <Outlet /> : <Navigate to={PATHS.LOGIN} replace />;
};
