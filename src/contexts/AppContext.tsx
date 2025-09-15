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
  const [mode, setMode] = useState<AppMode>(() => (localStorage.getItem('app_mode') as AppMode) || 'dev');
  const [token, setToken] = useState<string>(() => {
    // Auto-set the provided token in dev mode
    const savedToken = localStorage.getItem('gps_dev_token');
    const defaultToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyaWQiOiIyOTQiLCJuYW1laWQiOiJncHNfeml0YSIsInVuaXF1ZV9uYW1lIjoiZ3BzX3ppdGEiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyTGV2ZWwiOiJHbG9iYWwiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9wZXJtaXNzaW9uTWFzayI6IjMiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9kaXN0cmlidXRvciI6IiIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL2NsaWVudCI6IiIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL3VzZXJTaGFyZXMiOiIiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9hY2Nlc3NSdWxlcyI6Ilt7XCJyXCI6dHJ1ZSxcImF0XCI6MX0se1wiZGNcIjpcIkdQU1wiLFwiclwiOmZhbHNlLFwiYXRcIjowfSx7XCJkY1wiOlwiRkxUXCIsXCJyXCI6ZmFsc2UsXCJhdFwiOjB9LHtcImRjXCI6XCJFRkFcIixcInJcIjpmYWxzZSxcImF0XCI6MH0se1wiZGNcIjpcIkFaSVwiLFwiclwiOmZhbHNlLFwiYXRcIjowfV0iLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9kaXN0cmlidXRvcnMiOiJBWkksRUZBLEZMVCxHUFMiLCJpc3MiOiJhczpJc3N1ZXIiLCJhdWQiOiJhczpBdWRpZW5jZUlkIiwiZXhwIjoxNzU3OTMwMjY4LCJuYmYiOjE3NTc5Mjk5Njh9.Aequy03evHJdzMdnSIb8BteRhKesnskpI0yRJfK_CmY';
    return savedToken || defaultToken;
  });
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

  // Persist mode and restore dev token when switching back to dev
  useEffect(() => {
    localStorage.setItem('app_mode', mode);
    if (mode === 'dev') {
      const saved = localStorage.getItem('gps_dev_token');
      if (!token && saved) setToken(saved);
    }
  }, [mode]);

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
    if (mode === 'dev') {
      localStorage.setItem('gps_dev_token', newToken);
    }
  };

  const handleSetMode = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('app_mode', newMode);
    if (newMode === 'production') {
      // Do not lose dev token, just stop using it in production
      setToken('');
    } else if (newMode === 'dev') {
      const saved = localStorage.getItem('gps_dev_token');
      if (saved) setToken(saved);
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