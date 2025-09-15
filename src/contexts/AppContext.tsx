import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gpsService } from '@/services/gpsService';

type AppMode = 'dev' | 'production';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  token: string;
  setToken: (token: string) => void;
  isTokenValid: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('dev');
  const [token, setToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  // Update GPS service token when token changes
  useEffect(() => {
    if (token) {
      gpsService.setToken(token);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  // Listen for postMessage in production mode
  useEffect(() => {
    if (mode === 'production') {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.access_token) {
          console.log('🔑 Received token from parent:', event.data.access_token);
          setToken(event.data.access_token);
        }
      };

      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [mode]);

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
  };

  const handleSetMode = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'production') {
      // Clear manual token when switching to production
      setToken('');
    }
  };

  return (
    <AppContext.Provider value={{
      mode,
      setMode: handleSetMode,
      token,
      setToken: handleSetToken,
      isTokenValid,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}