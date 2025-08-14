import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface ImageFilter {
  name: string;
  label: string;
  filter: string;
}

const FILTERS: ImageFilter[] = [
  { name: 'none', label: 'ต้นฉบับ', filter: 'none' },
  { name: 'bright', label: 'สว่าง', filter: 'brightness(1.2) contrast(1.1)' },
  { name: 'warm', label: 'อบอุ่น', filter: 'sepia(0.3) saturate(1.2) brightness(1.1)' },
  { name: 'vintage', label: 'วินเทจ', filter: 'sepia(0.5) contrast(1.2) saturate(0.8)' },
  { name: 'cool', label: 'เย็น', filter: 'hue-rotate(180deg) saturate(1.1)' },
  { name: 'dramatic', label: 'ดราม่า', filter: 'contrast(1.5) saturate(1.3) brightness(0.9)' },
];

interface ImageFiltersProps {
  imageUrl: string;
  selectedFilter: string;
  onFilterChange: (filter: ImageFilter) => void;
  className?: string;
}

export const ImageFilters: React.FC<ImageFiltersProps> = ({
  imageUrl,
  selectedFilter,
  onFilterChange,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium">ฟิลเตอร์</h4>
      
      <div className="flex overflow-x-auto gap-3 pb-2">
        {FILTERS.map((filter) => (
          <div key={filter.name} className="flex-shrink-0">
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center space-y-2 p-2 h-auto",
                selectedFilter === filter.name && "ring-2 ring-primary"
              )}
              onClick={() => onFilterChange(filter)}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden border">
                <img
                  src={imageUrl}
                  alt={filter.label}
                  className="w-full h-full object-cover"
                  style={{ filter: filter.filter }}
                />
              </div>
              <Badge 
                variant={selectedFilter === filter.name ? "default" : "secondary"}
                className="text-xs"
              >
                {filter.label}
              </Badge>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};