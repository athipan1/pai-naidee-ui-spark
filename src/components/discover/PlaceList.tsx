import React from 'react';
import PlaceCard from './PlaceCard';
import { SearchResult } from '@/shared/types/search';
import { Skeleton } from '@/components/ui/skeleton';

interface PlaceListProps {
  places: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  currentLanguage: 'th' | 'en';
  onCardClick: (id: string) => void;
}

const PlaceList: React.FC<PlaceListProps> = ({
  places,
  isLoading,
  error,
  currentLanguage,
  onCardClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[225px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading places: {error.message}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-10">
        <p>No places found.</p>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          currentLanguage={currentLanguage}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default PlaceList;