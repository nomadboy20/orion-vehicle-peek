import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Settings, Key, Globe, Code, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { gpsService, type Group } from '@/services/gpsService';

export function AppHeader() {
  const { mode, setMode, token, setToken, isTokenValid, selectedGroup, setSelectedGroup } = useApp();
  const [shouldShowHeader, setShouldShowHeader] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const handleTokenSubmit = () => {
    if (inputToken.trim()) {
      setToken(inputToken.trim());
      setInputToken('');
    }
  };

  const handleModeToggle = () => {
    setMode(mode === 'dev' ? 'production' : 'dev');
  };

  const fetchGroups = async () => {
    if (!isTokenValid) return;
    
    setLoadingGroups(true);
    try {
      const fetchedGroups = await gpsService.getGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    // Safe check: show header only when embedded in Lovable editor
    const isInIframe = window.self !== window.top;
    const referrer = document.referrer || '';
    const parentContainsLovable = referrer.includes('lovable.dev');

    const shouldShow = isInIframe && parentContainsLovable;
    setShouldShowHeader(shouldShow);

    // Set default mode based on environment but avoid redundant resets
    const desiredMode = shouldShow ? 'dev' : 'production';
    if (mode !== desiredMode) {
      setMode(desiredMode);
    }
  }, [mode, setMode]);

  // Fetch groups when token becomes valid
  useEffect(() => {
    if (isTokenValid) {
      fetchGroups();
    } else {
      setGroups([]);
      setSelectedGroup('');
    }
  }, [isTokenValid, setSelectedGroup]);

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">GPS Dozor Dashboard</h1>
          </div>
          
          <Badge variant={isTokenValid ? "default" : "destructive"} className="flex items-center gap-1">
            <Key className="w-3 h-3" />
            {isTokenValid ? 'Token aktívny' : 'Token chýba'}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Režim:</span>
            <Button
              variant={mode === 'dev' ? 'default' : 'outline'}
              size="sm"
              onClick={handleModeToggle}
              className="flex items-center gap-2"
            >
              {mode === 'dev' ? (
                <>
                  <Code className="w-4 h-4" />
                  Dev Mode
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Produkcia
                </>
              )}
            </Button>
          </div>

          {/* Group Selector (only in dev mode) */}
          {mode === 'dev' && isTokenValid && (
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Skupina:</span>
                <Combobox
                  options={[
                    { value: '', label: 'Všetky skupiny' },
                    ...groups.map(group => ({ value: group.code, label: group.name }))
                  ]}
                  value={selectedGroup}
                  onValueChange={setSelectedGroup}
                  placeholder="Vyberte skupinu..."
                  emptyText="Žiadne skupiny"
                  className="w-48"
                  disabled={loadingGroups}
                />
              </div>
            </Card>
          )}

          {/* Token Input (only in dev mode) */}
          {mode === 'dev' && (
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="Vložte access token..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-64"
                  onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
                />
                <Button
                  size="sm"
                  onClick={handleTokenSubmit}
                  disabled={!inputToken.trim()}
                >
                  Nastaviť
                </Button>
              </div>
            </Card>
          )}

          {mode === 'production' && (
            <div className="text-sm text-muted-foreground">
              {isTokenValid ? 'Token prijatý z parent window' : 'Čakám na token z parent window...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}