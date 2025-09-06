import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bug, Link as LinkIcon, RefreshCw, Download, Trash2 } from 'lucide-react';
import error404Monitor, { Error404Event } from '@/lib/error404Monitor';
import { getApiConfig, checkApiHealth } from '@/config/api';

const Error404Dashboard = () => {
  const [events, setEvents] = useState<Error404Event[]>([]);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Load initial events
    setEvents(error404Monitor.getEvents());

    // Check API health on load
    handleCheckApiHealth();

    // Refresh events every 5 seconds
    const interval = setInterval(() => {
      setEvents(error404Monitor.getEvents());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckApiHealth = async () => {
    setIsChecking(true);
    try {
      const health = await checkApiHealth();
      setApiHealth(health);
    } catch (error) {
      setApiHealth(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClearEvents = () => {
    error404Monitor.clear();
    setEvents([]);
  };

  const handleExportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `404-errors-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const summary = error404Monitor.getSummary();
  const apiConfig = getApiConfig();

  const renderEventItem = (event: Error404Event, index: number) => (
    <Card key={index} className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={event.type === '404_api' ? 'destructive' : event.type === '404_route' ? 'secondary' : 'outline'}>
              {event.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="font-mono text-sm break-all">
            <strong>Path:</strong> {event.path}
          </div>
          
          {event.referrer && (
            <div className="text-xs text-gray-600">
              <strong>Referrer:</strong> {event.referrer}
            </div>
          )}
          
          {event.context && Object.keys(event.context).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500">Show context</summary>
              <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(event.context, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="w-6 h-6" />
          404 Error Dashboard
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleCheckApiHealth} variant="outline" size="sm" disabled={isChecking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check API
          </Button>
          <Button onClick={handleExportEvents} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleClearEvents} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* API Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            API Configuration & Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Environment:</strong> {apiConfig.environment}</div>
                <div><strong>Current API:</strong> <code>{apiConfig.current}</code></div>
                <div><strong>Primary URL:</strong> <code>{apiConfig.primary || 'Not set'}</code></div>
                <div><strong>Fallback URL:</strong> <code>{apiConfig.fallback || 'Not set'}</code></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Health Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant={apiHealth === true ? 'default' : apiHealth === false ? 'destructive' : 'secondary'}>
                  {apiHealth === true ? 'Healthy' : apiHealth === false ? 'Unhealthy' : 'Unknown'}
                </Badge>
                {apiHealth === false && (
                  <span className="text-sm text-gray-600">API not responding</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total 404s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(summary.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type.replace('404_', '')}</span>
                  <span className="font-mono">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Most Common</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {summary.mostCommonPaths.slice(0, 3).map(([path, count]) => (
                <div key={path} className="text-sm">
                  <div className="font-mono text-xs truncate">{path}</div>
                  <div className="text-xs text-gray-500">{count} times</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent 404 Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({events.length})</TabsTrigger>
              <TabsTrigger value="route">Routes ({events.filter(e => e.type === '404_route').length})</TabsTrigger>
              <TabsTrigger value="api">API ({events.filter(e => e.type === '404_api').length})</TabsTrigger>
              <TabsTrigger value="asset">Assets ({events.filter(e => e.type === '404_asset').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No 404 errors tracked yet
                  </div>
                ) : (
                  events.slice().reverse().map((event, index) => renderEventItem(event, index))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="route" className="mt-4">
              <div className="max-h-96 overflow-y-auto">
                {events.filter(e => e.type === '404_route').slice().reverse().map((event, index) => renderEventItem(event, index))}
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="mt-4">
              <div className="max-h-96 overflow-y-auto">
                {events.filter(e => e.type === '404_api').slice().reverse().map((event, index) => renderEventItem(event, index))}
              </div>
            </TabsContent>
            
            <TabsContent value="asset" className="mt-4">
              <div className="max-h-96 overflow-y-auto">
                {events.filter(e => e.type === '404_asset').slice().reverse().map((event, index) => renderEventItem(event, index))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error404Dashboard;