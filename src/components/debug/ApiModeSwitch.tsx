
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Database, Globe } from 'lucide-react';
import { useApiClient } from '@/shared/hooks/useApiClient';

interface ApiModeSwitchProps {
  className?: string;
}

const ApiModeSwitch = ({ className }: ApiModeSwitchProps) => {
  const { currentMode, toggleApiMode, isMockMode } = useApiClient();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Settings className="w-4 h-4 mr-2" />
        API Mode
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <Card className="fixed bottom-16 right-4 z-50 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              API Mode Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Mode Display */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Current Mode:</Label>
              <Badge variant={isMockMode ? "secondary" : "default"}>
                {isMockMode ? (
                  <>
                    <Database className="w-3 h-3 mr-1" />
                    Mock API
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Real API
                  </>
                )}
              </Badge>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="api-mode-switch" className="text-sm">
                Use Mock API
              </Label>
              <Switch
                id="api-mode-switch"
                checked={isMockMode}
                onCheckedChange={toggleApiMode}
              />
            </div>

            {/* Mode Description */}
            <div className="text-xs text-muted-foreground">
              {isMockMode ? (
                <p>
                  🔄 Using mock data for all API calls. Perfect for development
                  without backend dependency.
                </p>
              ) : (
                <p>
                  🌐 Using real API endpoints. Will fallback to mock data if
                  requests fail.
                </p>
              )}
            </div>

            {/* Environment Info */}
            <div className="text-xs text-muted-foreground border-t pt-2">
              <p>
                <strong>API Base URL:</strong>{' '}
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
              </p>
              <p>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ApiModeSwitch;
