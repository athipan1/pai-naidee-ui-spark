import { Waves, Mountain, Building, Trees, Camera, Utensils } from 'lucide-react';

interface CategoryFilterProps {
  currentLanguage: 'th' | 'en';
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ currentLanguage, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = [
    {
      id: 'all',
      label: { th: 'ทั้งหมด', en: 'All' },
      icon: Camera,
      color: 'text-accent-purple'
    },
    {
      id: 'beach',
      label: { th: 'ชายหาด', en: 'Beach' },
      icon: Waves,
      color: 'text-accent-sky'
    },
    {
      id: 'nature',
      label: { th: 'ธรรมชาติ', en: 'Nature' },
      icon: Trees,
      color: 'text-accent-green'
    },
    {
      id: 'culture',
      label: { th: 'วัฒนธรรม', en: 'Culture' },
      icon: Building,
      color: 'text-accent-yellow'
    },
    {
      id: 'mountain',
      label: { th: 'ภูเขา', en: 'Mountain' },
      icon: Mountain,
      color: 'text-muted-foreground'
    },
    {
      id: 'food',
      label: { th: 'อาหาร', en: 'Food' },
      icon: Utensils,
      color: 'text-secondary'
    }
  ];

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {currentLanguage === 'th' ? 'หมวดหมู่ที่น่าสนใจ' : 'Explore Categories'}
        </h2>
        
        <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center p-4 rounded-2xl min-w-[100px] 
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-card hover:bg-accent border border-border shadow-sm hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-300
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-accent/50'
                  }
                `}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : category.color}`} />
                </div>
                <span className="text-sm font-medium text-center">
                  {category.label[currentLanguage]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;