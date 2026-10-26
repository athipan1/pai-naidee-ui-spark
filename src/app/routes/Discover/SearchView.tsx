import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AttractionCard from '@/components/common/AttractionCard';
import { useAllAttractions } from '@/shared/hooks/useAttractionQueries';
import { getThailandPlaceImage } from '@/shared/data/thailandPlaceImages';
import { localizedCategory } from '@/shared/i18n/placeLocalization';

interface SearchViewProps {
  currentLanguage: "th" | "en";
  query: string;
  category?: string;
}

type ViewMode = 'grid' | 'list';

const SearchView = ({ currentLanguage, query, category }: SearchViewProps) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const { data, error, isLoading, refetch } = useAllAttractions({ search: query || undefined, category: category || undefined });

  const railwayResults = (data?.attractions ?? []).map(item => ({
    id: item.id, name: item.name, nameLocal: item.nameLocal || item.name,
    province: item.province, provinceEn: item.provinceEn,
    category: item.category, rating: item.rating,
    reviewCount: item.reviewCount, image: getThailandPlaceImage(item.name, item.image),
    mediaCredits: item.mediaCredits,
    description: item.description, descriptionEn: item.descriptionEn, tags: item.tags || []
  }));
  const filteredResults = railwayResults;

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  return (
    <div className="h-full bg-background">
      {/* Search Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Query and Results Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {currentLanguage === 'th' ? 'ผลการค้นหา' : 'Search Results'}
                </h2>
                {query && (
                  <p className="text-muted-foreground">
                    {currentLanguage === 'th' 
                      ? `ค้นหา: "${query}" พบ ${filteredResults.length} รายการ`
                      : `Search: "${query}" - ${filteredResults.length} results`
                    }
                  </p>
                )}
                {category && (
                  <p className="text-muted-foreground">
                    {currentLanguage === 'th' 
                      ? `หมวดหมู่: ${localizedCategory(category, currentLanguage)}`
                      : `Category: ${category}`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="space-y-4">
              {/* View Mode Controls */}
              <div className="flex items-center justify-end">
                <div className="flex border border-border rounded-md" role="group" aria-label={currentLanguage === 'th' ? 'รูปแบบการแสดงผล' : 'View mode'}>
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
      <main className="px-4">
        {isLoading ? (
          <p role="status">{currentLanguage === 'th' ? 'กำลังค้นหาสถานที่จริง...' : 'Searching live places...'}</p>
        ) : error ? (
          <div role="alert">
            <p>{currentLanguage === 'th' ? 'ไม่สามารถค้นหาข้อมูลจาก Railway ได้' : 'Unable to search Railway places.'}</p>
            <Button onClick={() => refetch()}>{currentLanguage === 'th' ? 'ลองอีกครั้ง' : 'Retry'}</Button>
          </div>
        ) : filteredResults.length === 0 ? (
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
                : 'Try adjusting your search'
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
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchView;
