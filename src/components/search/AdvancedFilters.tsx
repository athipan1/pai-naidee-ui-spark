import { useState } from "react";
import { Filter, MapPin, Star, DollarSign, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

export interface FilterState {
  priceRange: 'all' | 'free' | 'paid';
  maxDistance: number; // in km
  categories: string[];
  minRating: number;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance';
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  isOpen,
  onToggle,
}: AdvancedFiltersProps) => {
  const { language } = useLanguage();
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const content = {
    th: {
      title: "ตัวกรองขั้นสูง",
      priceRange: "ช่วงราคา",
      free: "ฟรี",
      paid: "มีค่าเข้า",
      all: "ทั้งหมด",
      distance: "ระยะทาง",
      maxDistance: "ระยะทางสูงสุด (กม.)",
      categories: "ประเภทสถานที่",
      rating: "คะแนนรีวิวขั้นต่ำ",
      sortBy: "เรียงตาม",
      relevance: "ความเกี่ยวข้อง",
      priceLow: "ราคาต่ำ-สูง",
      priceHigh: "ราคาสูง-ต่ำ",
      highestRated: "คะแนนสูงสุด",
      nearest: "ระยะทางใกล้สุด",
      apply: "ใช้ตัวกรอง",
      reset: "รีเซ็ต",
      clear: "ล้างทั้งหมด",
      anyDistance: "ระยะทางไม่จำกัด",
      starAndUp: "ดาวขึ้นไป"
    },
    en: {
      title: "Advanced Filters",
      priceRange: "Price Range",
      free: "Free",
      paid: "Paid",
      all: "All",
      distance: "Distance",
      maxDistance: "Maximum Distance (km)",
      categories: "Place Categories",
      rating: "Minimum Rating",
      sortBy: "Sort By",
      relevance: "Relevance",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      highestRated: "Highest Rated",
      nearest: "Nearest First",
      apply: "Apply Filters",
      reset: "Reset",
      clear: "Clear All",
      anyDistance: "Any Distance",
      starAndUp: " stars & up"
    }
  };

  const t = content[language];

  const categories = [
    { id: "beach", th: "ชายหาด", en: "Beach" },
    { id: "temple", th: "วัด", en: "Temple" },
    { id: "mountain", th: "ภูเขา", en: "Mountain" },
    { id: "waterfall", th: "น้ำตก", en: "Waterfall" },
    { id: "island", th: "เกาะ", en: "Island" },
    { id: "culture", th: "วัฒนธรรม", en: "Culture" },
    { id: "food", th: "อาหาร", en: "Food" },
    { id: "nature", th: "ธรรมชาติ", en: "Nature" },
    { id: "adventure", th: "ผจญภัย", en: "Adventure" },
    { id: "shopping", th: "ช้อปปิ้ง", en: "Shopping" }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = tempFilters.categories.includes(categoryId)
      ? tempFilters.categories.filter(id => id !== categoryId)
      : [...tempFilters.categories, categoryId];
    
    setTempFilters({ ...tempFilters, categories: newCategories });
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onApplyFilters();
    onToggle();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      priceRange: 'all',
      maxDistance: 50,
      categories: [],
      minRating: 0,
      sortBy: 'relevance'
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFilterCount = 
    (tempFilters.priceRange !== 'all' ? 1 : 0) +
    (tempFilters.maxDistance < 50 ? 1 : 0) +
    tempFilters.categories.length +
    (tempFilters.minRating > 0 ? 1 : 0);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          aria-expanded={isOpen}
          aria-controls="advanced-filters"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>{t.title}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent 
        id="advanced-filters"
        className="mt-4"
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4" />
                <span>{t.priceRange}</span>
              </Label>
              <Select
                value={tempFilters.priceRange}
                onValueChange={(value: 'all' | 'free' | 'paid') => 
                  setTempFilters({ ...tempFilters, priceRange: value })
                }
              >
                <SelectTrigger aria-label={t.priceRange}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="free">{t.free}</SelectItem>
                  <SelectItem value="paid">{t.paid}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Distance */}
            <div>
              <Label className="text-sm font-medium flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{t.distance}</span>
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{t.maxDistance}</span>
                  <span>
                    {tempFilters.maxDistance >= 50 
                      ? t.anyDistance 
                      : `${tempFilters.maxDistance} km`
                    }
                  </span>
                </div>
                <Slider
                  value={[tempFilters.maxDistance]}
                  onValueChange={([value]) => 
                    setTempFilters({ ...tempFilters, maxDistance: value })
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                  aria-label={t.maxDistance}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t.categories}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={tempFilters.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      aria-describedby={`category-${category.id}-label`}
                    />
                    <Label 
                      id={`category-${category.id}-label`}
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {language === 'th' ? category.th : category.en}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="text-sm font-medium flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4" />
                <span>{t.rating}</span>
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{tempFilters.minRating}</span>
                  <span>
                    {tempFilters.minRating > 0 
                      ? `${tempFilters.minRating}${t.starAndUp}` 
                      : t.all
                    }
                  </span>
                </div>
                <Slider
                  value={[tempFilters.minRating]}
                  onValueChange={([value]) => 
                    setTempFilters({ ...tempFilters, minRating: value })
                  }
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                  aria-label={t.rating}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t.sortBy}
              </Label>
              <Select
                value={tempFilters.sortBy}
                onValueChange={(value: FilterState['sortBy']) => 
                  setTempFilters({ ...tempFilters, sortBy: value })
                }
              >
                <SelectTrigger aria-label={t.sortBy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">{t.relevance}</SelectItem>
                  <SelectItem value="price-low">{t.priceLow}</SelectItem>
                  <SelectItem value="price-high">{t.priceHigh}</SelectItem>
                  <SelectItem value="rating">{t.highestRated}</SelectItem>
                  <SelectItem value="distance">{t.nearest}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleApply} 
                className="flex-1"
                aria-describedby="apply-filters-desc"
              >
                <Filter className="w-4 h-4 mr-2" />
                {t.apply}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                aria-label={t.reset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t.reset}
              </Button>
            </div>
            
            <div id="apply-filters-desc" className="sr-only">
              {language === 'th'
                ? 'ใช้ตัวกรองที่เลือกกับผลการค้นหา'
                : 'Apply selected filters to search results'
              }
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedFilters;