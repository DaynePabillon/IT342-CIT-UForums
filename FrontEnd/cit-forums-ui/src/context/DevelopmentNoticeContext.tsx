import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import DevelopmentNoticeModal from '../components/DevelopmentNoticeModal';

interface DevelopmentNoticeContextType {
  showDevelopmentNotice: () => void;
}

const DevelopmentNoticeContext = createContext<DevelopmentNoticeContextType | undefined>(undefined);

export const useDevelopmentNotice = () => {
  const context = useContext(DevelopmentNoticeContext);
  if (context === undefined) {
    throw new Error('useDevelopmentNotice must be used within a DevelopmentNoticeProvider');
  }
  return context;
};

interface DevelopmentNoticeProviderProps {
  children: ReactNode;
}

export const DevelopmentNoticeProvider: React.FC<DevelopmentNoticeProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show the modal every time the user enters the site
    setShowModal(true);
  }, []);

  const handleUnderstand = () => {
    setShowModal(false);
  };

  const showDevelopmentNotice = () => {
    setShowModal(true);
  };

  return (
    <DevelopmentNoticeContext.Provider value={{ showDevelopmentNotice }}>
      {children}
      {showModal && <DevelopmentNoticeModal onUnderstand={handleUnderstand} />}
    </DevelopmentNoticeContext.Provider>
  );
};
