import React, { useState, useEffect } from 'react';
import { getLegacyAttractions } from '@/services/attraction.service';
import { SearchResult } from '@/shared/types/search';
import AttractionCard from './AttractionCard'; // Use the existing AttractionCard component

// This is a test component to demonstrate fetching data from the legacy endpoint
// and rendering it with the existing AttractionCard component.

const AttractionListTest: React.FC = () => {
  // State for attractions, loading status, and errors
  const [attractions, setAttractions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for language and favorite status (for demonstration purposes)
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('th');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        // Call the new service function
        const attractionsData = await getLegacyAttractions();
        setAttractions(attractionsData);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error('Error fetching attractions:', err);
      } finally {
        setLoading(false);
      }
    };

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
  const handleCardClick = (id:string) => {
    // In a real app, this would navigate to the attraction's detail page
    console.log(`Card clicked: ${id}. Would navigate to /attraction/${id}`);
    alert(`Card clicked: ${id}`);
  };


  if (loading) {
    // A more user-friendly loading state
    return <div className="text-center p-10">Loading attractions...</div>;
  }

  if (error) {
    // A more user-friendly error state
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Attractions from HuggingFace Backend</h2>
        {/* Language toggle button */}
        <button
          onClick={() => setCurrentLanguage(lang => (lang === 'th' ? 'en' : 'th'))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Switch to {currentLanguage === 'th' ? 'English' : 'Thai'}
        </button>
      </div>

      {attractions.length === 0 ? (
        <p>No attractions found.</p>
      ) : (
        // Use a responsive grid to display the cards
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
      )}
    </div>
  );
};

export default AttractionListTest;
