/**
 * Supabase Demo Page
 * Demonstrates the Supabase integration for PaiNaiDee app
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, MapPin, Search, Loader2 } from 'lucide-react';
import { getPlaces, getPlacesByCategory, searchPlaces } from '@/services/supabase.service';

interface Place {
  id: string;
  name: string;
  description?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

const SupabaseDemoPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGetAllPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaces();
      setPlaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  const handleGetPlacesByCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlacesByCategory(category);
      setPlaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places by category');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlaces = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await searchPlaces(searchTerm);
      setPlaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load places on component mount
    handleGetAllPlaces();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Supabase Integration Demo
            </CardTitle>
            <CardDescription>
              Demonstration of Supabase connection for PaiNaiDee app using @supabase/supabase-js
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Supabase URL:</strong>
                  <code className="ml-2 px-2 py-1 bg-background rounded">
                    {process.env.EXPO_PUBLIC_SUPABASE_URL || 'Not configured'}
                  </code>
                </div>
                <div>
                  <strong>API Key:</strong>
                  <code className="ml-2 px-2 py-1 bg-background rounded">
                    {process.env.EXPO_PUBLIC_SUPABASE_KEY ? 'Configured' : 'Not configured'}
                  </code>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleGetAllPlaces} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Get All Places
              </Button>
              
              <Button 
                onClick={() => handleGetPlacesByCategory('temple')} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Get Temples
              </Button>
              
              <Button 
                onClick={() => handleGetPlacesByCategory('beach')} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Get Beaches
              </Button>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchPlaces()}
              />
              <Button 
                onClick={handleSearchPlaces} 
                disabled={loading || !searchTerm.trim()}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            <div>
              <h3 className="font-semibold mb-3">
                Results ({places.length} places)
              </h3>
              
              {places.length === 0 && !loading && !error && (
                <p className="text-muted-foreground">No places found. Make sure Supabase is configured correctly.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map((place) => (
                  <Card key={place.id} className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{place.name}</CardTitle>
                      {place.category && (
                        <Badge variant="secondary" className="w-fit">
                          {place.category}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-2">
                        {place.description || 'No description available'}
                      </p>
                      {place.latitude && place.longitude && (
                        <p className="text-xs text-muted-foreground">
                          📍 {place.latitude}, {place.longitude}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Features Used */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Features Implemented</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>✅ react-native-url-polyfill/auto for URL API support</li>
                <li>✅ AsyncStorage for session persistence</li>
                <li>✅ createClient with custom auth options</li>
                <li>✅ autoRefreshToken, persistSession, detectSessionInUrl configuration</li>
                <li>✅ Process lock for auth operations</li>
                <li>✅ getPlaces() function to fetch from 'places' table</li>
                <li>✅ Additional helper functions (getPlacesByCategory, searchPlaces)</li>
                <li>✅ Proper error handling and user feedback</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseDemoPage;