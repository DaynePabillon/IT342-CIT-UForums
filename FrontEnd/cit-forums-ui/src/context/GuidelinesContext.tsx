import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import GuidelinesModal from '../components/GuidelinesModal';

interface GuidelinesContextType {
  hasAcceptedGuidelines: boolean;
  showGuidelines: () => void;
}

const GuidelinesContext = createContext<GuidelinesContextType | undefined>(undefined);

export const useGuidelines = () => {
  const context = useContext(GuidelinesContext);
  if (context === undefined) {
    throw new Error('useGuidelines must be used within a GuidelinesProvider');
  }
  return context;
};

interface GuidelinesProviderProps {
  children: ReactNode;
}

export const GuidelinesProvider: React.FC<GuidelinesProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasAcceptedGuidelines, setHasAcceptedGuidelines] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    // Check if user has already accepted guidelines
    const accepted = localStorage.getItem('guidelinesAccepted') === 'true';
    setHasAcceptedGuidelines(accepted);
    
    // If not accepted, show the modal
    if (!accepted) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    setHasAcceptedGuidelines(true);
    setShowModal(false);
  };

  const showGuidelines = () => {
    setShowModal(true);
  };

  return (
    <GuidelinesContext.Provider value={{ hasAcceptedGuidelines, showGuidelines }}>
      {children}
      {showModal && <GuidelinesModal onAccept={handleAccept} />}
    </GuidelinesContext.Provider>
  );
};
