import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ConnectionContextType {
  isOnline: boolean;
  lastCheck: string | null;
  checkConnection: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = () => {
    const currentStatus = navigator.onLine;
    setIsOnline(currentStatus);
    setLastCheck(new Date().toLocaleTimeString());
  };

  return (
    <ConnectionContext.Provider value={{ isOnline, lastCheck, checkConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};