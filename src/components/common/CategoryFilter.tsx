import {
  Waves,
  Mountain,
  Building,
  Trees,
  Camera,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryFilterProps {
  currentLanguage: "th" | "en";
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  attractionCounts?: { [key: string]: number };
}

const CategoryFilter = ({
  currentLanguage,
  selectedCategory,
  onCategoryChange,
  attractionCounts = {},
}: CategoryFilterProps) => {
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
    <section className="py-10 bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {currentLanguage === "th"
              ? "หมวดหมู่ที่น่าสนใจ"
              : "Explore Categories"}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {currentLanguage === "th"
              ? "เลือกประเภทสถานที่ท่องเที่ยวที่คุณชื่นชอบ"
              : "Choose your favorite type of destination"}
          </p>
        </div>

        <div className="flex overflow-x-auto pb-6 space-x-4 md:space-x-6 scrollbar-hide snap-x">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            const count = attractionCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  category-btn flex-shrink-0 flex flex-col items-center p-4 md:p-5 rounded-3xl min-w-[100px] md:min-w-[120px] min-h-[100px] md:min-h-[120px]
                  transition-all duration-500 hover:scale-105 active:scale-95 touch-manipulation relative overflow-hidden group snap-center
                  ${
                    isActive
                      ? "category-btn-active bg-gradient-to-br from-primary to-primary-dark text-white shadow-2xl shadow-primary/30 scale-105 border-2 border-white/20"
                      : "bg-card/80 backdrop-blur-sm hover:bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30"
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-label={`${currentLanguage === "th" ? category.labelTh : category.labelEn} category ${count ? `with ${count} attractions` : ''}`}
              >
                <div
                  className={`
                  w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 relative z-10 group-hover:scale-110
                  ${isActive ? "bg-white/20 animate-float shadow-lg" : "bg-gradient-to-br from-accent/30 to-accent/10 group-hover:from-primary/20 group-hover:to-primary/10"}
                `}
                >
                  <Icon
                    className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
                      isActive ? "text-white animate-glow drop-shadow-lg" : `${category.color} group-hover:scale-110 group-hover:text-primary`
                    }`}
                  />
                </div>
                <span className={`text-xs md:text-sm font-semibold text-center leading-tight relative z-10 transition-all duration-300 ${
                  isActive ? "text-white" : "text-foreground group-hover:text-primary"
                }`}>
                  {currentLanguage === "th"
                    ? category.labelTh
                    : category.labelEn}
                </span>
                {count > 0 && (
                  <span className={`text-xs mt-2 px-2 py-1 rounded-full transition-all duration-300 relative z-10 font-medium ${
                    isActive ? "bg-white/20 text-white animate-pulse shadow-md" : "bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105"
                  }`}>
                    {count}
                  </span>
                )}
                
                {/* Enhanced visual effects */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5 rounded-3xl" />
                </div>
                
                {/* Active state glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-3xl animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-sm" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
