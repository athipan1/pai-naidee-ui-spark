import { useState } from 'react';
import { getEnvironmentInfo, isFeatureEnabled } from '@/shared/utils/devUtils';

interface DevToolsProps {
  isVisible?: boolean;
}

const DevTools = ({ isVisible = false }: DevToolsProps) => {
  const [showDevTools, setShowDevTools] = useState(isVisible);
  const [showInfo, setShowInfo] = useState(false);
  
  // Only show in development mode
  if (!isFeatureEnabled('debug')) {
    return null;
  }

  const envInfo = getEnvironmentInfo();

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {!showDevTools ? (
        <button
          onClick={() => setShowDevTools(true)}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Show Dev Tools"
        >
          🛠️
        </button>
      ) : (
        <div className="bg-white border shadow-lg rounded-lg p-4 w-64 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Dev Tools</h3>
            <button
              onClick={() => setShowDevTools(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Environment Info {showInfo ? '▼' : '▶'}
            </button>
            
            {showInfo && (
              <div className="pl-2 space-y-1 text-xs text-gray-600">
                <p><strong>Mode:</strong> {envInfo.mode}</p>
                <p><strong>Version:</strong> {envInfo.version}</p>
                <p><strong>API:</strong> {envInfo.apiUrl}</p>
                <p><strong>Debug:</strong> {envInfo.features.debug ? '✅' : '❌'}</p>
                <p><strong>Analytics:</strong> {envInfo.features.analytics ? '✅' : '❌'}</p>
              </div>
            )}
            
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full text-left p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Clear Storage & Reload
            </button>
            
            <button
              onClick={() => {
                console.log('App State:', {
                  favorites: localStorage.getItem('painaidee_favorites'),
                  language: localStorage.getItem('painaidee_language'),
                  url: window.location.href,
                  timestamp: new Date().toISOString()
                });
              }}
              className="w-full text-left p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Log App State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;