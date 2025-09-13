import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface QuotePanelContextType {
  isQuotePanelOpen: boolean;
  setIsQuotePanelOpen: (isOpen: boolean) => void;
  hasBeenManuallyClosed: boolean;
  setHasBeenManuallyClosed: (hasClosed: boolean) => void;
}

const QuotePanelContext = createContext<QuotePanelContextType | undefined>(undefined);

export const useQuotePanel = () => {
  const context = useContext(QuotePanelContext);
  if (context === undefined) {
    throw new Error('useQuotePanel must be used within a QuotePanelProvider');
  }
  return context;
};

interface QuotePanelProviderProps {
  children: ReactNode;
}

export const QuotePanelProvider: React.FC<QuotePanelProviderProps> = ({ children }) => {
  const [isQuotePanelOpen, setIsQuotePanelOpen] = useState(false);
  const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);

  const value = {
    isQuotePanelOpen,
    setIsQuotePanelOpen,
    hasBeenManuallyClosed,
    setHasBeenManuallyClosed,
  };

  return (
    <QuotePanelContext.Provider value={value}>
      {children}
    </QuotePanelContext.Provider>
  );
};