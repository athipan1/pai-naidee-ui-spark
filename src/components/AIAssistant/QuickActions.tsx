import React from 'react';
import { 
  MapPin, 
  Map, 
  Star, 
  Navigation, 
  Camera, 
  Utensils,
  Mountain,
  Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onActionClick: (action: string, query: string) => void;
  language: 'th' | 'en' | 'auto';
  disabled?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, language, disabled = false }) => {
  const quickActions = {
    th: [
      {
        id: 'nearby',
        icon: MapPin,
        label: 'หาที่ใกล้ฉัน',
        query: 'หาสถานที่ท่องเที่ยวใกล้ฉัน',
        color: 'bg-travel-green-100 hover:bg-travel-green-300 text-travel-green-500'
      },
      {
        id: 'map',
        icon: Map,
        label: 'แผนที่ท่องเที่ยว',
        query: 'แสดงแผนที่สถานที่ท่องเที่ยวในประเทศไทย',
        color: 'bg-travel-blue-50 hover:bg-travel-blue-300 text-travel-blue-500'
      },
      {
        id: 'top-attractions',
        icon: Star,
        label: 'สถานที่ยอดนิยม',
        query: 'แนะนำสถานที่ท่องเที่ยวยอดนิยมในประเทศไทย',
        color: 'bg-yellow-100 hover:bg-yellow-300 text-yellow-600'
      },
      {
        id: 'food',
        icon: Utensils,
        label: 'อาหารท้องถิ่น',
        query: 'แนะนำอาหารท้องถิ่นและร้านอาหารดีๆ',
        color: 'bg-orange-100 hover:bg-orange-300 text-orange-600'
      }
    ],
    en: [
      {
        id: 'nearby',
        icon: MapPin,
        label: 'Find places near me',
        query: 'Find tourist attractions near my location',
        color: 'bg-travel-green-100 hover:bg-travel-green-300 text-travel-green-500'
      },
      {
        id: 'map',
        icon: Map,
        label: 'Travel map',
        query: 'Show me a travel map of Thailand',
        color: 'bg-travel-blue-50 hover:bg-travel-blue-300 text-travel-blue-500'
      },
      {
        id: 'top-attractions',
        icon: Star,
        label: 'Top attractions',
        query: 'Recommend top tourist attractions in Thailand',
        color: 'bg-yellow-100 hover:bg-yellow-300 text-yellow-600'
      },
      {
        id: 'food',
        icon: Utensils,
        label: 'Local food',
        query: 'Recommend local Thai food and restaurants',
        color: 'bg-orange-100 hover:bg-orange-300 text-orange-600'
      }
    ]
  };

  const currentActions = language === 'th' ? quickActions.th : quickActions.en;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {currentActions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => onActionClick(action.id, action.query)}
            disabled={disabled}
            className={`
              h-auto p-4 flex flex-col items-center space-y-2 
              border-0 transition-all duration-200 hover:scale-105 hover:shadow-md
              ${action.color}
            `}
          >
            <IconComponent className="h-6 w-6" />
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;