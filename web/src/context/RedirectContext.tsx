// web/src/context/RedirectContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface RedirectContextType {
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  consumeRedirectPath: () => string | null;
}

const RedirectContext = createContext<RedirectContextType | undefined>(
  undefined,
);

export const RedirectProvider = ({ children }: { children: ReactNode }) => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // This function gets the path and then immediately clears it, so it's only used once.
  const consumeRedirectPath = () => {
    const path = redirectPath;
    setRedirectPath(null);
    return path;
  };

  return (
    <RedirectContext.Provider
      value={{ redirectPath, setRedirectPath, consumeRedirectPath }}
    >
      {children}
    </RedirectContext.Provider>
  );
};

export const useRedirect = () => {
  const context = useContext(RedirectContext);
  if (!context) {
    throw new Error('useRedirect must be used within a RedirectProvider');
  }
  return context;
};
