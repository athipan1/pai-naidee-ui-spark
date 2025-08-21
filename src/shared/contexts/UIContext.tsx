import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UIContextType {
  isCreatePostModalOpen: boolean;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

  const openCreatePostModal = () => setCreatePostModalOpen(true);
  const closeCreatePostModal = () => setCreatePostModalOpen(false);

  const value = {
    isCreatePostModalOpen,
    openCreatePostModal,
    closeCreatePostModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
