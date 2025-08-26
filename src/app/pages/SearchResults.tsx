import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid3X3, List, MapPin, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreadcrumbNavigation from '@/components/common/BreadcrumbNavigation';
import AttractionCard from '@/components/common/AttractionCard';
import AdvancedFilters, { FilterState } from '@/components/search/AdvancedFilters';
import { performSearch } from '@/services/search.service';
import { SearchResult } from '@/shared/types/search';
import { Skeleton } from '@/components/ui/skeleton';


interface SearchResultsProps {
  currentLanguage: "th" | "en";
}

type ViewMode = 'grid' | 'list';

const SearchResults = ({ currentLanguage }: SearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: 'all',
    maxDistance: 50,
    categories: [],
    minRating: 0,
    sortBy: 'relevance'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchQuery = {
          query: query,
          language: currentLanguage,
          filters: {
            categories: category ? [category] : filters.categories,
            priceRange: filters.priceRange,
            maxDistance: filters.maxDistance,
            minRating: filters.minRating,
          },
          sortBy: filters.sortBy,
        };
        const response = await performSearch(searchQuery);
        setResults(response.results);
        setTotalCount(response.totalCount);
      } catch (err) {
        console.error("Search error:", err);
        setError("ไม่สามารถค้นหาได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, currentLanguage, filters]);


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
    // Re-trigger fetch by dependency array in useEffect
  };

  const renderSkeletons = () => (
    <div
      className={`
        ${viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }
      `}
    >
      {Array.from({ length: 8 }).map((_, index) => (
         <div key={index} className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
         </div>
      ))}
    </div>
  );

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
      
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {currentLanguage === 'th' ? 'ผลการค้นหา' : 'Search Results'}
                </h1>
                {!loading && !error && (
                  <p className="text-muted-foreground">
                    {currentLanguage === 'th' 
                      ? `ค้นหา: "${query}" พบ ${totalCount} รายการ`
                      : `Found ${totalCount} results for "${query}"`
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
               <AdvancedFilters
                currentLanguage={currentLanguage}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
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

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          renderSkeletons()
        ) : error ? (
          <section className="text-center py-12 text-destructive">
            <AlertTriangle className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg font-semibold">
              {currentLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'An Error Occurred'}
            </p>
            <p className="text-muted-foreground">{error}</p>
          </section>
        ) : results.length === 0 ? (
          <section className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {currentLanguage === 'th' 
                ? 'ไม่พบผลการค้นหา'
                : 'No results found'
              }
            </p>
            <p className="text-muted-foreground">
              {currentLanguage === 'th'
                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ'
                : 'Try adjusting your search or filters.'
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
                ? `ผลการค้นหา ${results.length} รายการ`
                : `Search results ${results.length} items`
            }
          >
            {results.map((attraction) => (
              <div key={attraction.id} className={viewMode === 'list' ? 'border border-border rounded-lg p-4' : ''}>
                <AttractionCard
                  id={attraction.id}
                  name={attraction.name}
                  category={attraction.category}
                  image={attraction.image}
                  province={attraction.province}
                  rating={attraction.rating}
                  reviewCount={attraction.reviewCount}
                  description={attraction.description}
                  currentLanguage={currentLanguage}
                  isFavorite={favorites.includes(attraction.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(attraction.id)}
                  onCardClick={() => handleCardClick(attraction.id)}
                />
                 {viewMode === 'list' && (
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                       <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {attraction.rating.toFixed(1)}
                      </div>
                       <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {attraction.province}
                      </div>
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