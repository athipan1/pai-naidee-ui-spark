import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Tag,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import type { SearchSuggestion, SearchResult } from "@/shared/utils/searchAPI";

interface SmartSearchBarProps {
  currentLanguage: "th" | "en";
  onSearch: (query: string, results: SearchResult[]) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

const SmartSearchBar = ({
  currentLanguage,
  onSearch,
  onSuggestionSelect,
  placeholder,
  className,
}: SmartSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const content = {
    th: {
      searchPlaceholder: "ค้นหาสถานที่ท่องเที่ยว...",
      recentSearches: "การค้นหาล่าสุด",
      trendingSearches: "ยอดนิยม",
      suggestions: "คำแนะนำ",
      noSuggestions: "ไม่พบคำแนะนำ",
      searchResults: "ผลการค้นหา",
      clearAll: "ล้างทั้งหมด",
      confidence: "ความเชื่อมั่น",
    },
    en: {
      searchPlaceholder: "Search destinations...",
      recentSearches: "Recent Searches",
      trendingSearches: "Trending",
      suggestions: "Suggestions",
      noSuggestions: "No suggestions found",
      searchResults: "Search Results",
      clearAll: "Clear All",
      confidence: "Confidence",
    },
  };

  const t = content[currentLanguage];

  // Mock trending searches
  const mockTrendingSearches = [
    currentLanguage === "th" ? "เกาะพีพี" : "Phi Phi Islands",
    currentLanguage === "th" ? "วัดพระแก้ว" : "Wat Phra Kaew",
    currentLanguage === "th" ? "ดอยอินทนนท์" : "Doi Inthanon",
    currentLanguage === "th" ? "ตลาดน้ำ" : "Floating Market",
  ];

  // Initialize data
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem("recentSearches");
    if (savedRecentSearches) {
      setRecentSearches(JSON.parse(savedRecentSearches));
    }
    setTrendingSearches(mockTrendingSearches);
  }, [currentLanguage]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (searchQuery.trim().length > 0) {
          fetchSuggestions(searchQuery);
        } else {
          setSuggestions([]);
        }
      }, 300);
    },
    []
  );

  // Fetch suggestions using API client
  const fetchSuggestions = async (_searchQuery: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      // const suggestions = await apiClient.getSearchSuggestions(searchQuery, currentLanguage);
      const suggestions = [];
      setSuggestions(suggestions);
    } catch {
      // Handle error silently for now
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform full search using API client
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      // const response = await apiClient.performSearch({
      //   query: searchQuery,
      //   language: currentLanguage
      // });
      const response = { results: [], totalCount: 0 };

      // Save to recent searches
      const updatedRecentSearches = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);

      setRecentSearches(updatedRecentSearches);
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedRecentSearches)
      );

      onSearch(searchQuery, response.results);
    } catch {
      // Handle error silently for now
      onSearch(searchQuery, []);
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    performSearch(suggestion.text);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    performSearch(searchTerm);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "place":
        return <MapPin className="w-4 h-4" />;
      case "province":
        return <MapPin className="w-4 h-4" />;
      case "category":
        return <Tag className="w-4 h-4" />;
      case "tag":
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder || t.searchPlaceholder}
            className="pl-12 pr-12 h-12 text-base rounded-xl border-2 focus:border-primary touch-manipulation"
            aria-label={placeholder || t.searchPlaceholder}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            role="combobox"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>


      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-2">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              {/* Loading State */}
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">กำลังค้นหา...</p>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {t.recentSearches}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs"
                    >
                      {t.clearAll}
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-2 hover:bg-accent rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {!query && trendingSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {t.trendingSearches}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((trend, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleRecentSearchClick(trend)}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Suggestions */}
              {query && suggestions.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {t.suggestions}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {suggestion.image ? (
                            <img
                              src={suggestion.image}
                              alt={suggestion.text}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium truncate">
                                {suggestion.text}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            {suggestion.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {suggestion.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Suggestions */}
              {query && !isLoading && suggestions.length === 0 && (
                <div className="p-4 text-center">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t.noSuggestions}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartSearchBar;
