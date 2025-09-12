import {
  Waves,
  Mountain,
  Building,
  Trees,
  Camera,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  attractionCounts?: { [key: string]: number };
}

const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
  attractionCounts = {},
}: CategoryFilterProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const categories = [
    {
      id: "all",
      labelTh: "ทั้งหมด",
      labelEn: "All",
      icon: Camera,
      color: "text-accent-purple",
    },
    {
      id: "beach",
      labelTh: "ชายหาด",
      labelEn: "Beach",
      icon: Waves,
      color: "text-accent-sky",
    },
    {
      id: "nature",
      labelTh: "ธรรมชาติ",
      labelEn: "Nature",
      icon: Trees,
      color: "text-accent-green",
    },
    {
      id: "culture",
      labelTh: "วัฒนธรรม",
      labelEn: "Culture",
      icon: Building,
      color: "text-accent-yellow",
    },
    {
      id: "mountain",
      labelTh: "ภูเขา",
      labelEn: "Mountain",
      icon: Mountain,
      color: "text-muted-foreground",
    },
    {
      id: "food",
      labelTh: "อาหาร",
      labelEn: "Food",
      icon: Utensils,
      color: "text-secondary",
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "all") {
      onCategoryChange(categoryId);
    } else {
      // Navigate to search results with category filter
      const searchParams = new URLSearchParams();
      searchParams.set('category', categoryId);
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {language === "th"
            ? "หมวดหมู่ที่น่าสนใจ"
            : "Explore Categories"}
        </h2>

        <div className="flex overflow-x-auto pb-4 space-x-3 md:space-x-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            const count = attractionCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  category-btn flex-shrink-0 flex flex-col items-center p-3 md:p-4 rounded-2xl min-w-[90px] md:min-w-[100px] min-h-[80px] md:min-h-[90px]
                  transition-all duration-500 hover:scale-105 active:scale-95 touch-manipulation relative overflow-hidden
                  ${
                    isActive
                      ? "category-btn-active bg-primary text-primary-foreground shadow-xl scale-105"
                      : "bg-card hover:bg-accent border border-border shadow-sm hover:shadow-md"
                  }
                `}
              >
                <div
                  className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 relative z-10
                  ${isActive ? "bg-white/20 animate-float" : "bg-accent/50 group-hover:bg-primary/20"}
                `}
                >
                  <Icon
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${
                      isActive ? "text-white animate-glow" : `${category.color} group-hover:scale-110`
                    }`}
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-center leading-tight relative z-10">
                  {language === "th"
                    ? category.labelTh
                    : category.labelEn}
                </span>
                {count > 0 && (
                  <span className={`text-xs mt-1 px-1.5 py-0.5 rounded-full transition-all duration-300 relative z-10 ${
                    isActive ? "bg-white/20 text-white animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}>
                    {count}
                  </span>
                )}
                
                {/* Enhanced ripple effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
