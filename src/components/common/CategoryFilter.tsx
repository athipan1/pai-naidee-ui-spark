import { Waves, Mountain, Building, Trees, Camera, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryFilterProps {
  currentLanguage: 'th' | 'en';
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ currentLanguage, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 'all',
      labelTh: 'ทั้งหมด',
      labelEn: 'All',
      icon: Camera,
      color: 'text-accent-purple'
    },
    {
      id: 'beach',
      labelTh: 'ชายหาด',
      labelEn: 'Beach',
      icon: Waves,
      color: 'text-accent-sky'
    },
    {
      id: 'nature',
      labelTh: 'ธรรมชาติ',
      labelEn: 'Nature',
      icon: Trees,
      color: 'text-accent-green'
    },
    {
      id: 'culture',
      labelTh: 'วัฒนธรรม',
      labelEn: 'Culture',
      icon: Building,
      color: 'text-accent-yellow'
    },
    {
      id: 'mountain',
      labelTh: 'ภูเขา',
      labelEn: 'Mountain',
      icon: Mountain,
      color: 'text-muted-foreground'
    },
    {
      id: 'food',
      labelTh: 'อาหาร',
      labelEn: 'Food',
      icon: Utensils,
      color: 'text-secondary'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategoryChange(categoryId);
    } else {
      // Navigate to category page for specific categories
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        const categoryName = currentLanguage === 'th' ? category.labelTh : category.labelEn;
        navigate(`/category/${encodeURIComponent(categoryName)}`);
      }
    }
  };

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
                onClick={() => handleCategoryClick(category.id)}
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
                  {currentLanguage === 'th' ? category.labelTh : category.labelEn}
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