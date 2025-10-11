import React, { useState } from 'react';
import { Heart, Star, MapPin, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/shared/types/search';

interface PlaceCardProps {
  place: SearchResult;
  isFavorite?: boolean;
  currentLanguage: 'th' | 'en';
  onFavoriteToggle?: (id: string) => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isFavorite = false,
  currentLanguage,
  onFavoriteToggle,
  onCardClick,
  className = ''
}) => {
  const { id, name, nameLocal, province, rating, reviewCount, image, description } = place;
  const displayName = currentLanguage === 'th' && nameLocal ? nameLocal : name;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col ${className}`}
      onClick={() => onCardClick?.(id)}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        {image && !imageError ? (
          <img
            src={image}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-500">
            <ImageOff className="w-12 h-12" />
            <span className="mt-2 text-sm">No Image Available</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-900/70 dark:hover:bg-gray-900/90 rounded-full h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
          />
        </Button>

        {/* Overlay gradient for better text readability */}
        {!imageError && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-grow flex flex-col">
        {/* Title and Location */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-1" title={displayName}>
            {displayName}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate" title={province}>{province}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 pt-2">
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            ({reviewCount.toLocaleString()} {currentLanguage === 'th' ? 'รีวิว' : 'reviews'})
          </span>
        </div>

        {/* Description (Hidden but available for tooltip or future use) */}
        {/*
        <p className="text-gray-600 text-sm line-clamp-2">
          {description}
        </p>
        */}
      </div>
    </div>
  );
};

export default PlaceCard;