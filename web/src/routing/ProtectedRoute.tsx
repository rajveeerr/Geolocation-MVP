// src/routing/ProtectedRoute.tsx
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { useRedirect } from '@/context/RedirectContext';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import { useState, useEffect } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoadingUser } = useAuth();
  const { setRedirectPath } = useRedirect();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      // Store the path the user was trying to access
      setRedirectPath(location.pathname);
      // Show the login prompt
      setIsModalOpen(true);
    }
  }, [isLoadingUser, user, location, setRedirectPath]);

  if (isLoadingUser) {
    return <LoadingOverlay message="Verifying your account..." />;
  }

  if (user) {
    // If user is logged in, show the actual page content
    return children as any;
  }
  
  // If not logged in, show the blurred background (current page) and the modal on top
  return (
    <>
        <div className="filter blur-sm">
            {/* Render a placeholder of the previous page or home page */}
        </div>
        <LoginPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
