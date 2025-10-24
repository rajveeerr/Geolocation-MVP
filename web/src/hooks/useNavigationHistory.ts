import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface NavigationHistory {
  canGoBack: boolean;
  goBack: () => void;
  previousPath: string | null;
}

export const useNavigationHistory = (): NavigationHistory => {
  const navigate = useNavigate();
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  // Track the previous path
  useEffect(() => {
    // Store the current path as previous when navigating away
    const handleBeforeUnload = () => {
      sessionStorage.setItem('previousPath', location.pathname);
    };

    // Get the previous path from session storage
    const storedPreviousPath = sessionStorage.getItem('previousPath');
    if (storedPreviousPath && storedPreviousPath !== location.pathname) {
      setPreviousPath(storedPreviousPath);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  const goBack = () => {
    // Check if there's a previous path in session storage
    const storedPreviousPath = sessionStorage.getItem('previousPath');
    
    if (storedPreviousPath && storedPreviousPath !== location.pathname) {
      // Navigate to the stored previous path
      navigate(storedPreviousPath, { replace: true });
    } else {
      // Fallback to browser back
      navigate(-1);
    }
  };

  const canGoBack = previousPath !== null || window.history.length > 1;

  return {
    canGoBack,
    goBack,
    previousPath,
  };
};
