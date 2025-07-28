import SmartSearchBar from "./SmartSearchBar";
import { SearchResult } from "@/shared/utils/searchAPI";
import heroBeach from "@/shared/assets/hero-beach.jpg";

interface SearchSectionProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string, results?: SearchResult[]) => void;
}

const SearchSection = ({ currentLanguage, onSearch }: SearchSectionProps) => {
  const handleSearch = (query: string, results?: SearchResult[]) => {
    onSearch(query, results);
  };

  return (
    <section className="relative min-h-[300px] md:min-h-[500px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBeach})` }}
      />
      <div className="absolute inset-0 gradient-hero opacity-80" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-12 md:py-28 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          {/* Title */}
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 md:mb-4 animate-fade-in text-shadow-strong">
            {currentLanguage === "th"
              ? "ค้นหาสถานที่ท่องเที่ยวในฝัน"
              : "Discover Your Dream Destination"}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 font-light animate-fade-in text-shadow">
            {currentLanguage === "th"
              ? "เที่ยวไทยและทั่วโลกไปกับเรา พบสถานที่น่าทึ่งที่รอคุณอยู่"
              : "Explore Thailand and beyond with us. Find amazing places waiting for you."}
          </p>

          {/* Search Form */}
          <div className="animate-fade-in max-w-2xl mx-auto">
            <SmartSearchBar
              currentLanguage={currentLanguage}
              onSearch={handleSearch}
              placeholder={
                currentLanguage === "th"
                  ? "คุณอยากไปไหน?"
                  : "Where do you want to go?"
              }
            />
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 md:mt-6 animate-fade-in">
            {[
              { th: "ชายหาด", en: "Beach" },
              { th: "วัด", en: "Temple" },
              { th: "ภูเขา", en: "Mountain" },
              { th: "น้ำตก", en: "Waterfall" },
              { th: "เกาะ", en: "Island" },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() =>
                  handleSearch(currentLanguage === "th" ? item.th : item.en)
                }
                className="px-3 py-1.5 md:px-4 md:py-2 glass-effect hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {currentLanguage === "th" ? item.th : item.en}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
