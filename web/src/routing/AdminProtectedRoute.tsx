// web/src/routing/AdminProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { PATHS } from './paths';

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAdminStatus();

  if (isLoading) {
    return <LoadingOverlay message="Verifying permissions..." />;
  }

  if (!isAdmin) {
    return <Navigate to={PATHS.HOME} replace />;
  }
  
  return <>{children}</>;
};
