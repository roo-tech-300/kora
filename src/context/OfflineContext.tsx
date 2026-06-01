import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isOffline } from '../lib/localCache/offlineCache';

type OfflineContextType = {
  offline: boolean;
  showOfflineModal: boolean;
  dismissOfflineModal: () => void;
  goToCourses: () => void;
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [offline, setOffline] = useState(isOffline());
  const [showOfflineModal, setShowOfflineModal] = useState(isOffline());

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => {
      setOffline(true);
      setShowOfflineModal(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = useMemo(() => ({
    offline,
    showOfflineModal,
    dismissOfflineModal: () => setShowOfflineModal(false),
    goToCourses: () => {
      setShowOfflineModal(false);
      navigate('/teacher');
    },
  }), [offline, showOfflineModal, navigate]);

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
