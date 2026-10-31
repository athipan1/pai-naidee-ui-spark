import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AttractionCard from '@/components/common/AttractionCard';
import { useAttractions } from '@/shared/hooks/useAttractionQueries';
import { getRailwayPlaceFacets } from '@/services/railway-api.service';
import { getThailandPlaceImage } from '@/shared/data/thailandPlaceImages';
import { localizedCategory } from '@/shared/i18n/placeLocalization';
import { uniqueAttractionsById } from '@/shared/utils/uniqueAttractions';

interface SearchViewProps {
  currentLanguage: "th" | "en";
  query: string;
  category?: string;
  province?: string;
  onFiltersChange?: (filters: { category: string; province: string }) => void;
}

type ViewMode = 'grid' | 'list';

const SearchView = ({ currentLanguage, query, category = '', province = '', onFiltersChange }: SearchViewProps) => {
  const pageSize = 20;
  const navigate = useNavigate();
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [page, setPage] = React.useState(1);
  React.useEffect(() => setPage(1), [query, category, province]);
  const { data, error, isLoading, refetch } = useAttractions({
    page, limit: pageSize, search: query || undefined,
    category: category || undefined, province: province || undefined,
  });
  const facets = useQuery({ queryKey: ['places', 'facets'], queryFn: getRailwayPlaceFacets, staleTime: 5 * 60_000 });
  const provinces = facets.data?.provinces ?? [];
  const categories = facets.data?.categories ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const railwayResults = uniqueAttractionsById(data?.attractions ?? []).map(item => ({
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
                      ? `ค้นหา: "${query}" พบ ${data?.total ?? 0} รายการ`
                      : `Search: "${query}" - ${data?.total ?? 0} results`
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
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <label className="text-sm font-medium flex flex-col gap-1">
                  {currentLanguage === 'th' ? 'จังหวัด' : 'Province'}
                  <select aria-label={currentLanguage === 'th' ? 'กรองจังหวัด' : 'Filter province'} value={province} onChange={event => onFiltersChange?.({ province: event.target.value, category })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground">
                    <option value="">{currentLanguage === 'th' ? 'ทุกจังหวัด' : 'All provinces'}</option>
                    {provinces.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium flex flex-col gap-1">
                  {currentLanguage === 'th' ? 'ประเภทสถานที่' : 'Place type'}
                  <select aria-label={currentLanguage === 'th' ? 'กรองประเภทสถานที่' : 'Filter place type'} value={category} onChange={event => onFiltersChange?.({ province, category: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground">
                    <option value="">{currentLanguage === 'th' ? 'ทุกประเภท' : 'All types'}</option>
                    {categories.map(name => <option key={name} value={name}>{localizedCategory(name, currentLanguage)}</option>)}
                  </select>
                </label>
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
      {totalPages > 1 && !error && (
        <nav aria-label={currentLanguage === 'th' ? 'หน้าผลการค้นหา' : 'Search result pages'} className="flex justify-center items-center gap-3 p-6">
          <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage(value => Math.max(1, value - 1))}>
            {currentLanguage === 'th' ? 'ก่อนหน้า' : 'Previous'}
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {currentLanguage === 'th' ? `หน้า ${page} จาก ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <Button variant="outline" disabled={page >= totalPages || isLoading} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>
            {currentLanguage === 'th' ? 'ถัดไป' : 'Next'}
          </Button>
        </nav>
      )}
    </div>
  );
};

export default SearchView;
