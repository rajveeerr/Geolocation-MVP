import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = ({ offset = 0 }: { offset?: number }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: offset, behavior: 'smooth' });
      } catch {
        // fallback
        window.scrollTo(0, offset);
      }
    }
  }, [pathname, offset]);

  return null;
};
