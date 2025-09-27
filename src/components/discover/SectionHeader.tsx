import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  showViewAll?: boolean;
  onViewAll?: () => void;
  currentLanguage: 'th' | 'en';
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  showViewAll = false,
  onViewAll,
  currentLanguage,
  className = ''
}) => {
  const viewAllLabel = currentLanguage === 'th' ? 'ดูทั้งหมด' : 'View All';

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-blue-600" />}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-gray-600 text-sm">{subtitle}</p>
        )}
      </div>
      
      {showViewAll && onViewAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;