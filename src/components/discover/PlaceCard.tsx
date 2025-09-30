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
  category,
  rating,
  reviewCount,
  image,
  description,
  tags,
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
        {/* Category and Rating */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
            {category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{rating}</span>
            <span className="text-gray-500 text-sm">({reviewCount.toLocaleString()})</span>
          </div>
        </div>

        {/* Title and Location */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {displayName}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{province}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 h-10">
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;