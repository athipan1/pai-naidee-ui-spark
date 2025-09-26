import SmartSearchBar from "./SmartSearchBar";
import { SearchResult } from "@/shared/utils/searchAPI";
import { PostSearchResult } from "@/shared/types/posts";
import heroBeach from "@/shared/assets/hero-beach.jpg";

interface SearchSectionProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string, results?: SearchResult[] | PostSearchResult[]) => void;
}

const SearchSection = ({ currentLanguage, onSearch }: SearchSectionProps) => {
  const handleSearch = (query: string, results?: SearchResult[] | PostSearchResult[]) => {
    onSearch(query, results);
  };

  return (
    <section className="relative min-h-[350px] md:min-h-[550px] overflow-hidden" role="banner">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ backgroundImage: `url(${heroBeach})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 gradient-hero opacity-80" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Title with improved responsive scaling */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-fade-in text-shadow-strong leading-tight">
            {currentLanguage === "th"
              ? "ค้นหาสถานที่ท่องเที่ยวในฝัน"
              : "Discover Your Dream Destination"}
          </h1>

          {/* Subtitle with better responsive text */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-10 font-light animate-fade-in text-shadow max-w-3xl mx-auto leading-relaxed">
            {currentLanguage === "th"
              ? "เที่ยวไทยและทั่วโลกไปกับเรา พบสถานที่น่าทึ่งที่รอคุณอยู่"
              : "Explore Thailand and beyond with us. Find amazing places waiting for you."}
          </p>

          {/* Search Form with enhanced responsive design */}
          <div className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-0">
            <SmartSearchBar
              currentLanguage={currentLanguage}
              onSearch={handleSearch}
              searchType="all"
              placeholder={
                currentLanguage === "th"
                  ? "คุณอยากไปไหน?"
                  : "Where do you want to go?"
              }
            />
          </div>

          {/* Enhanced Quick Search Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 md:mt-8 animate-fade-in px-4 sm:px-0">
            {[
              { th: "ชายหาด", en: "Beach", icon: "🏖️" },
              { th: "วัด", en: "Temple", icon: "🛕" },
              { th: "ภูเขา", en: "Mountain", icon: "⛰️" },
              { th: "น้ำตก", en: "Waterfall", icon: "💧" },
              { th: "เกาะ", en: "Island", icon: "🏝️" },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() =>
                  handleSearch(currentLanguage === "th" ? item.th : item.en)
                }
                className="px-4 py-2 md:px-5 md:py-2.5 glass-effect hover:bg-white/30 backdrop-blur-md rounded-full text-white text-sm md:text-base font-medium transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation relative overflow-hidden group border border-white/20 hover:border-white/40"
                aria-label={`Search for ${currentLanguage === "th" ? item.th : item.en}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-base" role="img" aria-hidden="true">{item.icon}</span>
                  {currentLanguage === "th" ? item.th : item.en}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 ease-out" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
