// web/src/context/ModalContext.tsx
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';

interface ModalContextType {
  openModal: () => void;
}
const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ModalContext.Provider value={{ openModal }}>
      {children}
      <LoginPromptModal isOpen={isModalOpen} onClose={closeModal} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
