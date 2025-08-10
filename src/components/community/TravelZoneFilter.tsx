import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { TravelZone } from '@/shared/types/community';
import { 
  Mountain, 
  Palmtree, 
  Users, 
  UserCheck, 
  UtensilsCrossed, 
  Camera, 
  Leaf, 
  Wallet 
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TravelZoneFilterProps {
  selectedZone?: TravelZone;
  onZoneChange: (zone: TravelZone | undefined) => void;
  className?: string;
}

const travelZones: Array<{
  key: TravelZone;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = [
  {
    key: 'adventure',
    label: 'สายผจญภัย',
    icon: <Mountain className="h-4 w-4" />,
    color: 'bg-red-500 hover:bg-red-600',
    description: 'ปีนเขา ดำน้ำ กีฬาเสี่ยงภัย'
  },
  {
    key: 'chill',
    label: 'สายชิล',
    icon: <Palmtree className="h-4 w-4" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'พักผ่อน ชมวิว นวดสปา'
  },
  {
    key: 'family',
    label: 'ครอบครัว',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'เที่ยวกับครอบครัว เด็กๆ'
  },
  {
    key: 'solo',
    label: 'เที่ยวคนเดียว',
    icon: <UserCheck className="h-4 w-4" />,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Solo travel แบกเป้'
  },
  {
    key: 'foodie',
    label: 'สายกิน',
    icon: <UtensilsCrossed className="h-4 w-4" />,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'ร้านอาหาร ตลาด ขนมหวาน'
  },
  {
    key: 'culture',
    label: 'วัฒนธรรม',
    icon: <Camera className="h-4 w-4" />,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    description: 'วัด ประเพณี งานเทศกาล'
  },
  {
    key: 'nature',
    label: 'ธรรมชาติ',
    icon: <Leaf className="h-4 w-4" />,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    description: 'ป่า น้ำตก อุทยาน'
  },
  {
    key: 'budget',
    label: 'ประหยัด',
    icon: <Wallet className="h-4 w-4" />,
    color: 'bg-pink-500 hover:bg-pink-600',
    description: 'เที่ยวงบน้อย คุ้มค่า'
  }
];

export const TravelZoneFilter: React.FC<TravelZoneFilterProps> = ({
  selectedZone,
  onZoneChange,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">โซนการเดินทาง</h3>
        {selectedZone && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onZoneChange(undefined)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ล้างทั้งหมด
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {travelZones.map((zone) => {
          const isSelected = selectedZone === zone.key;
          
          return (
            <motion.div
              key={zone.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: travelZones.indexOf(zone) * 0.05 }}
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full justify-start p-3 cursor-pointer transition-all duration-200",
                  "hover:shadow-md",
                  isSelected 
                    ? `${zone.color} text-white shadow-lg` 
                    : "hover:bg-muted"
                )}
                onClick={() => onZoneChange(isSelected ? undefined : zone.key)}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className={cn(
                    "flex-shrink-0",
                    isSelected ? "text-white" : "text-muted-foreground"
                  )}>
                    {zone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs font-medium truncate",
                      isSelected ? "text-white" : "text-foreground"
                    )}>
                      {zone.label}
                    </div>
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isSelected ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {zone.description}
                    </div>
                  </div>
                </div>
              </Badge>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Zone Info */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 bg-muted/50 rounded-lg border"
        >
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">กำลังแสดงโพสต์ในโซน:</span>
            <Badge variant="secondary" className="text-xs">
              {travelZones.find(z => z.key === selectedZone)?.label}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TravelZoneFilter;