import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gpsService } from '@/services/gpsService';

type AppMode = 'dev' | 'production';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  token: string;
  setToken: (token: string) => void;
  isTokenValid: boolean;
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
  const [receivedFromParent, setReceivedFromParent] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  // Update GPS service token when token or mode changes
  useEffect(() => {
    if (token) {
      gpsService.setToken(token);
    }
    // In production mode, we need both token and selectedGroup to be valid
    const valid = mode === 'dev' 
      ? Boolean(token) 
      : Boolean(token && receivedFromParent && selectedGroup);
    console.log('🔍 Token validation:', { mode, token: !!token, receivedFromParent, selectedGroup, valid });
    setIsTokenValid(valid);
  }, [token, mode, receivedFromParent, selectedGroup]);

  // Listen for postMessage in production mode
  useEffect(() => {
    if (mode === 'production') {
      const handleMessage = (event: MessageEvent) => {
        const data: any = event.data || {};
        console.log('📨 Received message from parent:', data);
        
        const accessToken = data.access_token || data.token || data?.payload?.access_token;
        const groupCode = data.group_code || data.groupCode || data['data-group-code'] || data?.payload?.group_code || (data.type === 'set_group_code' ? data.value : undefined);

        if (accessToken) {
          console.log('🔑 Received token from parent:', accessToken);
          setToken(accessToken);
          setReceivedFromParent(true);
        }
        
        if (typeof groupCode === 'string' && groupCode.length > 0) {
          console.log('🏷️ Received group code from parent:', groupCode);
          setSelectedGroup(groupCode);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Request initial data from parent
      console.log('📤 Requesting initial data from parent');
      try {
        window.parent.postMessage({ type: 'lovable_iframe_ready' }, '*');
        window.parent.postMessage({ type: 'request_data' }, '*');
      } catch (e) {
        console.warn('⚠️ Unable to postMessage to parent:', e);
      }
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [mode]);

  // Listen for iframe data-group-code changes in production mode
  useEffect(() => {
    if (mode === 'production') {
      console.log("🔍 Production mode: Setting up iframe observer");
      
      function getGroupCode() {
        const iframeElement = window.frameElement;
        console.log("🔍 Iframe element:", iframeElement);
        const code = iframeElement ? iframeElement.getAttribute("data-group-code") : null;
        console.log("🔍 Group code from iframe:", code);
        return code;
      }

      function onGroupCodeChange(newCode: string | null) {
        console.log("🏷️ New groupCode:", newCode);
        setSelectedGroup(newCode || '');
      }

      console.log("🔍 Checking for frameElement:", window.frameElement);
      
      if (window.frameElement) {
        console.log("✅ Found frameElement, setting up observer");
        const observer = new MutationObserver(() => {
          console.log("🔍 Iframe attribute changed, checking group code");
          const code = getGroupCode();
          onGroupCodeChange(code);
        });

        observer.observe(window.frameElement, {
          attributes: true,
          attributeFilter: ["data-group-code"]
        });

        // Initialize with current value
        console.log("🔍 Initializing with current group code");
        onGroupCodeChange(getGroupCode());

        return () => {
          console.log("🔍 Disconnecting iframe observer");
          observer.disconnect();
        };
      } else {
        console.log("❌ No frameElement found - not in iframe?");
      }
    }
  }, [mode]);

  // Persist mode and restore dev token when switching back to dev
  useEffect(() => {
    localStorage.setItem('app_mode', mode);
    if (mode === 'dev') {
      setReceivedFromParent(true);
      const saved = localStorage.getItem('gps_dev_token');
      if (!token && saved) setToken(saved);
    } else {
      setReceivedFromParent(false);
    }
  }, [mode]);

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
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