import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroBeach from "@/shared/assets/hero-beach.jpg";

interface SearchSectionProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string) => void;
}

const SearchSection = ({
  currentLanguage,
  onSearch,
}: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const content = {
    th: {
      title: "ค้นหาสถานที่ท่องเที่ยวในฝัน",
      subtitle: "เที่ยวไทยและทั่วโลกไปกับเรา พบสถานที่น่าทึ่งที่รอคุณอยู่",
      searchPlaceholder: "ค้นหาสถานที่, จังหวัด, หรือกิจกรรม...",
      searchButton: "ค้นหา",
    },
    en: {
      title: "Discover Your Dream Destination",
      subtitle:
        "Explore Thailand and beyond with us. Find amazing places waiting for you.",
      searchPlaceholder: "Search places, provinces, or activities...",
      searchButton: "Search",
    },
  };

  const t = content[currentLanguage];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="relative min-h-[300px] md:min-h-[400px] overflow-hidden rounded-lg" role="banner">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBeach})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-shadow-strong">
            {t.title}
          </h1>

          <p className="text-md sm:text-lg text-white/90 text-shadow">
            {t.subtitle}
          </p>

          <div className="pt-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
            >
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500"
              />
              <Button
                type="submit"
                aria-label={t.searchButton}
                className="rounded-full"
              >
                <Search className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
