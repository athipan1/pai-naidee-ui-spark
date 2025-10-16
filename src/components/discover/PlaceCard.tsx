import React from 'react';
import { Heart, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceCardProps {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags?: string[];
  isFavorite?: boolean;
  currentLanguage: 'th' | 'en';
  onFavoriteToggle?: (id: string) => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  id,
  name,
  nameLocal,
  province,
  rating,
  reviewCount,
  image,
  description,
  isFavorite = false,
  currentLanguage,
  onFavoriteToggle,
  onCardClick,
  className = ''
}) => {
  const displayName = currentLanguage === 'th' && nameLocal ? nameLocal : name;

  return (
    <div 
      className={`bg-white rounded-xl shadow hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer group ${className}`}
      onClick={() => onCardClick?.(id)}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
            {displayName}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{province}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500 text-sm">
            ({reviewCount.toLocaleString()} {currentLanguage === 'th' ? 'รีวิว' : 'reviews'})
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;