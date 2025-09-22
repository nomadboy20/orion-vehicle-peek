import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gpsService } from '@/services/gpsService';

type AppMode = 'dev' | 'production';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  token: string;
  setToken: (token: string) => void;
  isTokenValid: boolean;
  isUserToken: boolean; // True if user has explicitly set a token
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
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
  const [isUserToken, setIsUserToken] = useState<boolean>(false); // Track if user explicitly set token
  const [receivedFromParent, setReceivedFromParent] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  // Update GPS service token when token or mode changes
  useEffect(() => {
    if (token) {
      gpsService.setToken(token);
    }
    // In dev mode, only consider token valid if user explicitly set it
    // In production mode, we need both token and selectedGroup to be valid
    const valid = mode === 'dev' 
      ? Boolean(token && isUserToken) 
      : Boolean(token && receivedFromParent && selectedGroup);
    console.log('🔍 Token validation:', { mode, token: !!token, isUserToken, receivedFromParent, selectedGroup, valid });
    setIsTokenValid(valid);
  }, [token, mode, isUserToken, receivedFromParent, selectedGroup]);

  // Listen for postMessage in production mode
  useEffect(() => {
    if (mode === 'production') {
      const handleMessage = (event: MessageEvent) => {
        const data: any = event.data || {};
        console.log('📨 Received message from parent:', data);
        
        // Handle access_token response
        if (data.access_token) {
          console.log('🔑 Received access_token from parent:', data.access_token);
          setToken(data.access_token);
          setIsUserToken(true); // Token from parent is considered user token
          setReceivedFromParent(true);
        }
        
        // Handle group_code response
        if (data.group_code) {
          console.log('🏷️ Received group_code from parent:', data.group_code);
          setSelectedGroup(data.group_code);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Request access_token and group_code from parent
      const requestDataFromParent = () => {
        console.log('📤 Requesting access_token from parent');
        try {
          window.parent.postMessage({ type: 'request_access_token' }, '*');
        } catch (e) {
          console.warn('⚠️ Unable to request access_token:', e);
        }
        
        console.log('📤 Requesting group_code from parent');
        try {
          window.parent.postMessage({ type: 'request_group_code' }, '*');
        } catch (e) {
          console.warn('⚠️ Unable to request group_code:', e);
        }
      };

      // Initial request
      requestDataFromParent();
      
      // Request data every 2 seconds until we have both token and group
      const interval = setInterval(() => {
        if (!token || !selectedGroup) {
          console.log('🔄 Retrying requests for missing data...', { hasToken: !!token, hasGroup: !!selectedGroup });
          requestDataFromParent();
        } else {
          console.log('✅ All required data received, stopping requests');
          clearInterval(interval);
        }
      }, 2000);
      
      return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(interval);
      };
    }
  }, [mode, token, selectedGroup]);


  // Persist mode and restore dev token when switching back to dev
  useEffect(() => {
    localStorage.setItem('app_mode', mode);
    if (mode === 'dev') {
      setReceivedFromParent(true);
      const saved = localStorage.getItem('gps_dev_token');
      if (!token && saved) {
        setToken(saved);
        setIsUserToken(true); // Restored token is considered user token
      }
    } else {
      setReceivedFromParent(false);
    }
  }, [mode]);

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
    setIsUserToken(true); // Mark as user-set token
    if (mode === 'dev') {
      localStorage.setItem('gps_dev_token', newToken);
      setReceivedFromParent(true);
    }
  };

  const handleSetMode = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('app_mode', newMode);
    if (newMode === 'production') {
      setReceivedFromParent(false);
      // Avoid wiping a token received from parent; only clear if it's the dev token
      const savedDev = localStorage.getItem('gps_dev_token');
      if (token && savedDev && token === savedDev) {
        setToken('');
      }
    } else if (newMode === 'dev') {
      setReceivedFromParent(true);
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
      isUserToken,
      selectedGroup,
      setSelectedGroup,
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