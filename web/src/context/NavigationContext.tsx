import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  previousPath: string | null;
  setPreviousPath: (path: string | null) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const location = useLocation();

  // Track navigation history
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't add the same path consecutively
    if (navigationHistory.length === 0 || navigationHistory[navigationHistory.length - 1] !== currentPath) {
      setNavigationHistory(prev => [...prev, currentPath]);
    }
  }, [location.pathname, navigationHistory]);

  // Update previous path when navigation history changes
  useEffect(() => {
    if (navigationHistory.length > 1) {
      setPreviousPath(navigationHistory[navigationHistory.length - 2]);
    }
  }, [navigationHistory]);

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current path
      const targetPath = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setPreviousPath(newHistory.length > 1 ? newHistory[newHistory.length - 2] : null);
      
      // Navigate to the previous path
      window.history.replaceState(null, '', targetPath);
      window.location.reload(); // Force navigation
    }
  };

  const canGoBack = navigationHistory.length > 1;

  const value: NavigationContextType = {
    previousPath,
    setPreviousPath,
    goBack,
    canGoBack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
