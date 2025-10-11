import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  initialQuery?: string;
  debounceDelay?: number;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  initialQuery = '',
  debounceDelay = 500,
  placeholder = 'Search for attractions (e.g., Wat Pho, Doi Suthep)...'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      onSearchChange(query);
    }, debounceDelay);

    // Cleanup function to clear timeout on unmount or re-render
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, onSearchChange, debounceDelay]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-12 text-base"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;