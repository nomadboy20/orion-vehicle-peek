import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Globe, Code } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function AppHeader() {
  const { mode, setMode, token, setToken, isTokenValid } = useApp();
  const [shouldShowHeader, setShouldShowHeader] = useState(false);
  const [inputToken, setInputToken] = useState('');

  const handleTokenSubmit = () => {
    if (inputToken.trim()) {
      setToken(inputToken.trim());
      setInputToken('');
    }
  };

  const handleModeToggle = () => {
    setMode(mode === 'dev' ? 'production' : 'dev');
  };

  useEffect(() => {
    // Check if we're in an iframe and if parent URL contains lovable.dev
    const isInIframe = window !== window.parent;
    let parentContainsLovable = false;
    
    if (isInIframe) {
      try {
        // Try to access parent location - this will throw SecurityError for cross-origin
        const parentHref = window.parent.location.href;
        parentContainsLovable = parentHref.includes('lovable.dev');
      } catch (e) {
        // If we can't access parent location due to CORS, assume it's not lovable.dev
        parentContainsLovable = false;
      }
    }
    
    const shouldShow = isInIframe && parentContainsLovable;
    setShouldShowHeader(shouldShow);
    
    // Set default mode based on environment
    if (shouldShow) {
      setMode('dev'); // Default to dev mode in lovable.dev iframe
    } else {
      setMode('production'); // Default to production mode otherwise
    }
  }, [setMode]);

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