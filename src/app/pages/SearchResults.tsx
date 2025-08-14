import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid3X3, List, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbNavigation from '@/components/common/BreadcrumbNavigation';
import AttractionCard from '@/components/common/AttractionCard';
import AdvancedFilters, { FilterState } from '@/components/search/AdvancedFilters';
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";

interface SearchResultsProps {
  currentLanguage: "th" | "en";
}

type _SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance';
type ViewMode = 'grid' | 'list';

const SearchResults = ({ currentLanguage }: SearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    priceRange: 'all',
    maxDistance: 50,
    categories: [],
    minRating: 0,
    sortBy: 'relevance'
  });

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  // Mock search results (in real app, this would come from API)
  const mockResults = [
    {
      id: "1",
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      province: currentLanguage === "th" ? "กระบี่" : "Krabi",
      category: "Beach",
      rating: 4.8,
      reviewCount: 2547,
      image: heroBeachImage,
      description: currentLanguage === "th"
        ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
        : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
      tags: ["Beach", "Snorkeling", "Island", "Photography"],
      priceRange: "฿2,500-5,000",
      distance: "45 km"
    },
    {
      id: "2",
      name: "Wat Phra Kaew",
      nameLocal: "วัดพระแก้ว",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.9,
      reviewCount: 5243,
      image: templeImage,
      description: currentLanguage === "th"
        ? "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต"
        : "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
      tags: ["Temple", "Culture", "Buddhism", "History"],
      priceRange: "฿100-500",
      distance: "12 km"
    },
    {
      id: "3",
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      province: currentLanguage === "th" ? "เชียงใหม่" : "Chiang Mai",
      category: "Nature",
      rating: 4.7,
      reviewCount: 1876,
      image: mountainImage,
      description: currentLanguage === "th"
        ? "ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย"
        : "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
      tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
      priceRange: "฿300-1,200",
      distance: "680 km"
    },
    {
      id: "4",
      name: "Floating Market",
      nameLocal: "ตลาดน้ำ",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.5,
      reviewCount: 3156,
      image: floatingMarketImage,
      description: currentLanguage === "th"
        ? "สัมผัสวัฒนธรรมไทยแบบดั้งเดิม ขณะช้อปปิ้งผลไม้สดและอาหารพื้นเมืองจากเรือ"
        : "Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.",
      tags: ["Food", "Culture", "Traditional", "Market"],
      priceRange: "฿200-800",
      distance: "25 km"
    },
  ];

  // Filter and sort results based on filters
  const applyFilters = (items: typeof mockResults) => {
    const filtered = items.filter(item => {
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.nameLocal?.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = !category || item.category.toLowerCase() === category.toLowerCase();
      
      // Apply price filter
      const matchesPrice = filters.priceRange === 'all' || 
        (filters.priceRange === 'free' && item.priceRange.includes('฿0') || item.priceRange.includes('Free')) ||
        (filters.priceRange === 'paid' && !item.priceRange.includes('฿0') && !item.priceRange.includes('Free'));
      
      // Apply categories filter
      const matchesCategories = filters.categories.length === 0 || 
        filters.categories.some(cat => 
          item.category.toLowerCase() === cat.toLowerCase() ||
          item.tags.some(tag => tag.toLowerCase() === cat.toLowerCase())
        );
      
      // Apply rating filter
      const matchesRating = item.rating >= filters.minRating;
      
      // Apply distance filter (simplified - in real app would use geolocation)
      const distance = parseInt(item.distance.replace(/[^\d]/g, ''));
      const matchesDistance = filters.maxDistance >= 50 || distance <= filters.maxDistance;
      
      return matchesQuery && matchesCategory && matchesPrice && matchesCategories && matchesRating && matchesDistance;
    });

    // Sort results
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return parseInt(a.priceRange.split('-')[0].replace(/[^\d]/g, '')) - 
                 parseInt(b.priceRange.split('-')[0].replace(/[^\d]/g, ''));
        case 'price-high':
          return parseInt(b.priceRange.split('-')[1].replace(/[^\d]/g, '')) - 
                 parseInt(a.priceRange.split('-')[1].replace(/[^\d]/g, ''));
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseInt(a.distance.replace(/[^\d]/g, '')) - parseInt(b.distance.replace(/[^\d]/g, ''));
        default:
          return 0; // relevance - keep original order
      }
    });
  };

  const filteredResults = applyFilters(mockResults);

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied in the applyFilters function
    // This can be used for additional logic like analytics
  };

  const breadcrumbItems = [
    { label: currentLanguage === 'th' ? 'หน้าแรก' : 'Home', path: '/' },
    { 
      label: query 
        ? `${currentLanguage === 'th' ? 'ค้นหา' : 'Search'}: "${query}"`
        : currentLanguage === 'th' ? 'ผลการค้นหา' : 'Search Results'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbNavigation currentLanguage={currentLanguage} items={breadcrumbItems} />
      
      {/* Search Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            {/* Query and Results Count */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {currentLanguage === 'th' ? 'ผลการค้นหา' : 'Search Results'}
                </h1>
                {query && (
                  <p className="text-muted-foreground">
                    {currentLanguage === 'th' 
                      ? `ค้นหา: "${query}" พบ ${filteredResults.length} รายการ`
                      : `Search: "${query}" - ${filteredResults.length} results`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="space-y-4">
              <AdvancedFilters
                currentLanguage={currentLanguage}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />

              {/* View Mode Controls */}
              <div className="flex items-center justify-end">
                <div className="flex border border-border rounded-md" role="group" aria-label="View mode">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                    aria-label={currentLanguage === 'th' ? 'มุมมองตาราง' : 'Grid view'}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                    aria-label={currentLanguage === 'th' ? 'มุมมองรายการ' : 'List view'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-6">
        {filteredResults.length === 0 ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {currentLanguage === 'th' 
                ? 'ไม่พบผลการค้นหา'
                : 'No results found'
              }
            </p>
            <p className="text-muted-foreground">
              {currentLanguage === 'th'
                ? 'ลองเปลี่ยนคำค้นหาหรือกรองข้อมูล'
                : 'Try adjusting your search or filters'
              }
            </p>
          </section>
        ) : (
          <section 
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }
            `}
            aria-label={
              currentLanguage === 'th' 
                ? `ผลการค้นหา ${filteredResults.length} รายการ`
                : `Search results ${filteredResults.length} items`
            }
          >
            {filteredResults.map((attraction) => (
              <div key={attraction.id} className={viewMode === 'list' ? 'border border-border rounded-lg p-4' : ''}>
                <AttractionCard
                  {...attraction}
                  currentLanguage={currentLanguage}
                  isFavorite={favorites.includes(attraction.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onCardClick={handleCardClick}
                />
                {viewMode === 'list' && (
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {attraction.distance}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {attraction.rating}
                      </div>
                    </div>
                    <div className="font-medium">
                      {attraction.priceRange}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchResults;