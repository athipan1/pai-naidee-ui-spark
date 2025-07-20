import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBeach from '@/shared/assets/hero-beach.jpg';

interface SearchSectionProps {
  currentLanguage: 'th' | 'en';
  onSearch: (query: string) => void;
}

const SearchSection = ({ currentLanguage, onSearch }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative min-h-[400px] md:min-h-[500px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBeach})` }}
      />
      <div className="absolute inset-0 gradient-hero opacity-80" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-28 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            {currentLanguage === 'th' 
              ? 'ค้นหาสถานที่ท่องเที่ยวในฝัน' 
              : 'Discover Your Dream Destination'
            }
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light animate-fade-in">
            {currentLanguage === 'th'
              ? 'เที่ยวไทยและทั่วโลกไปกับเรา พบสถานที่น่าทึ่งที่รอคุณอยู่'
              : 'Explore Thailand and beyond with us. Find amazing places waiting for you.'
            }
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentLanguage === 'th' 
                      ? 'คุณอยากไปไหน?' 
                      : 'Where do you want to go?'
                  }
                  className="search-input pl-12 h-12 text-base"
                />
              </div>
              <Button 
                type="submit" 
                className="btn-secondary h-12 px-8 whitespace-nowrap"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {currentLanguage === 'th' ? 'ค้นหา' : 'Search'}
              </Button>
            </div>
          </form>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in">
            {[
              { th: 'ชายหาด', en: 'Beach' },
              { th: 'วัด', en: 'Temple' },
              { th: 'ภูเขา', en: 'Mountain' },
              { th: 'น้ำตก', en: 'Waterfall' },
              { th: 'เกาะ', en: 'Island' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(currentLanguage === 'th' ? item.th : item.en)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                {currentLanguage === 'th' ? item.th : item.en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;