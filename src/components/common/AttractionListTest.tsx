import React, { useState, useEffect } from 'react';
import { getLegacyAttractions } from '@/services/attraction.service';
import { SearchResult } from '@/shared/types/search';
import AttractionCard from './AttractionCard';
import { AttractionListSkeleton } from './SkeletonLoader';
import APIErrorDisplay from './APIErrorDisplay';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDevelopment, debugLog } from '@/shared/utils/devUtils';

// Mock data for fallback when Supabase is not configured or fails
const mockAttractions: SearchResult[] = [
  {
    id: "mock-1",
    name: "Phi Phi Islands",
    nameLocal: "หมู่เกาะพีพี",
    province: "กระบี่",
    category: "Beach",
    tags: ["Beach", "Snorkeling", "Island", "Photography"],
    rating: 4.8,
    reviewCount: 2547,
    image: "https://via.placeholder.com/400x250/0ea5e9/ffffff?text=Phi+Phi+Islands",
    description: "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
    confidence: 1.0,
    matchedTerms: ["Beach"],
    amenities: ["Swimming", "Snorkeling", "Photography"],
    location: { lat: 7.740, lng: 98.778 }
  },
  {
    id: "mock-2", 
    name: "Wat Phra Kaew",
    nameLocal: "วัดพระแก้ว",
    province: "กรุงเทพฯ",
    category: "Culture",
    tags: ["Temple", "Culture", "Buddhism", "History"],
    rating: 4.9,
    reviewCount: 5243,
    image: "https://via.placeholder.com/400x250/f59e0b/ffffff?text=Wat+Phra+Kaew",
    description: "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
    confidence: 1.0,
    matchedTerms: ["Culture"],
    amenities: ["Guided Tours", "Cultural Shows", "Photography"],
    location: { lat: 13.751, lng: 100.492 }
  },
  {
    id: "mock-3",
    name: "Doi Inthanon",
    nameLocal: "ดอยอินทนนท์",
    province: "เชียงใหม่",
    category: "Nature",
    tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
    rating: 4.7,
    reviewCount: 1876,
    image: "https://via.placeholder.com/400x250/10b981/ffffff?text=Doi+Inthanon",
    description: "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
    confidence: 1.0,
    matchedTerms: ["Nature"],
    amenities: ["Hiking Trails", "Waterfalls", "Cool Weather"],
    location: { lat: 18.589, lng: 98.521 }
  }
];

const AttractionListTest: React.FC = () => {
  // State for attractions, loading status, and errors
  const [attractions, setAttractions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  // State for language and favorite status (for demonstration purposes)
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('th');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      debugLog('Attempting to fetch attractions from Supabase...');
      
      // Call the new service function
      const attractionsData = await getLegacyAttractions();
      
      if (attractionsData && attractionsData.length > 0) {
        debugLog('Successfully fetched attractions from Supabase:', attractionsData.length);
        setAttractions(attractionsData);
        setUsingMockData(false);
      } else {
        debugLog('No attractions returned from Supabase, using mock data');
        setAttractions(mockAttractions);
        setUsingMockData(true);
      }
      
    } catch (err) {
      debugLog('Error fetching attractions from Supabase, falling back to mock data:', err);
      
      // Fallback to mock data when Supabase fails
      setAttractions(mockAttractions);
      setUsingMockData(true);
      
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred while fetching attractions'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  // Handler for the favorite button toggle
  const handleFavoriteToggle = (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // Handler for clicking on a card
  const handleCardClick = (id: string) => {
    // In a real app, this would navigate to the attraction's detail page
    debugLog(`Card clicked: ${id}. Would navigate to /attraction/${id}`);
    // For demo purposes, show an alert only in development
    if (isDevelopment) {
      const attraction = attractions.find(a => a.id === id);
      if (attraction) {
        alert(`จะไปที่: ${currentLanguage === 'th' && attraction.nameLocal ? attraction.nameLocal : attraction.name}`);
      }
    }
  };

  const handleRetry = () => {
    fetchAttractions();
  };

  // Only render this component in development mode
  if (!isDevelopment) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <AttractionListSkeleton count={4} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {usingMockData ? (
            <AlertCircle className="h-6 w-6 text-orange-500" />
          ) : (
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
          {usingMockData ? 'ข้อมูลตัวอย่าง (Mock Data)' : 'ข้อมูลจาก Supabase'}
        </h2>
        
        {/* Language toggle button */}
        <Button
          onClick={() => setCurrentLanguage(lang => (lang === 'th' ? 'en' : 'th'))}
          variant="outline"
          size="sm"
        >
          {currentLanguage === 'th' ? 'English' : 'ไทย'}
        </Button>
      </div>

      {/* Show error/fallback message */}
      {(error || usingMockData) && (
        <APIErrorDisplay
          error={error}
          isLoading={loading}
          onRetry={error ? handleRetry : undefined}
          showRetryButton={!!error}
          fallbackMessage={
            usingMockData && !error
              ? currentLanguage === 'th'
                ? "กำลังแสดงข้อมูลตัวอย่าง เนื่องจาก Supabase ยังไม่ได้ตั้งค่า"
                : "Showing sample data because Supabase is not configured"
              : undefined
          }
          currentLanguage={currentLanguage}
        />
      )}

      {attractions.length === 0 ? (
        <div className="text-center py-12">
          <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {currentLanguage === 'th' ? 'ไม่พบข้อมูลสถานที่ท่องเที่ยว' : 'No attractions found'}
          </p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {currentLanguage === 'th' ? 'ลองใหม่' : 'Try Again'}
          </Button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {currentLanguage === 'th' 
              ? `พบ ${attractions.length} สถานที่` 
              : `Found ${attractions.length} places`}
          </div>
          
          {/* Use a responsive grid to display the cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                nameLocal={attraction.nameLocal}
                province={attraction.province}
                category={attraction.category}
                rating={attraction.rating}
                reviewCount={attraction.reviewCount}
                image={attraction.image}
                description={attraction.description}
                tags={attraction.tags || []}
                isFavorite={favorites.has(attraction.id)}
                currentLanguage={currentLanguage}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AttractionListTest;
