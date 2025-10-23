import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroBeach from "@/shared/assets/hero-beach.jpg";

interface SearchSectionProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string) => void;
}

const SearchSection = ({ currentLanguage, onSearch }: SearchSectionProps) => {
  const [query, setQuery] = useState('');

  const content = {
    th: {
      title: "ค้นหาสถานที่ท่องเที่ยวในฝัน",
      subtitle: "เที่ยวไทยและทั่วโลกไปกับเรา พบสถานที่น่าทึ่งที่รอคุณอยู่",
      placeholder: "คุณอยากไปเที่ยวที่ไหน?",
      searchButton: "ค้นหา",
    },
    en: {
      title: "Discover Your Dream Destination",
      subtitle: "Explore Thailand and beyond with us. Find amazing places waiting for you.",
      placeholder: "Where do you want to go?",
      searchButton: "Search",
    }
  };
  const t = content[currentLanguage];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
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
            {t.title}
          </h1>

          {/* Subtitle with better responsive text */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-10 font-light animate-fade-in text-shadow max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <Input
                type="text"
                placeholder={t.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent border-none text-white placeholder:text-white/70 focus:ring-0 text-lg py-6"
              />
              <Button type="submit" size="lg" className="rounded-full">
                <Search className="w-5 h-5 mr-2" />
                {t.searchButton}
              </Button>
            </div>
          </form>

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
