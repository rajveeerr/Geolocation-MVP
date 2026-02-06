import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface CityOption {
  id: number;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
}

interface CityContextType {
  selectedCity: CityOption | null;
  setSelectedCity: (city: CityOption | null) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

const STORAGE_KEY = 'yohop_selected_city';

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCityState] = useState<CityOption | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setSelectedCity = (city: CityOption | null) => {
    setSelectedCityState(city);
    if (city) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within a CityProvider');
  return ctx;
};
