import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  nameLocal?: string;
  icon: LucideIcon;
  color: string;
  count?: number;
  currentLanguage: 'th' | 'en';
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  nameLocal,
  icon: Icon,
  color,
  count,
  currentLanguage,
  isSelected = false,
  onClick
}) => {
  const displayName = currentLanguage === 'th' && nameLocal ? nameLocal : name;

  return (
    <div
      className={`
        bg-white rounded-xl shadow p-4 cursor-pointer transition-all duration-300
        hover:scale-105 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
      `}
      onClick={() => onClick?.(id)}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon 
            className="w-6 h-6" 
            style={{ color }}
          />
        </div>

        {/* Category Name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {displayName}
          </h3>
          {count !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {count} {currentLanguage === 'th' ? 'แห่ง' : 'places'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;