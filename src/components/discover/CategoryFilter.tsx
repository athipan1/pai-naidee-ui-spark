import React, { useEffect, useState } from 'react';
import { getCategories } from '@/services/supabase.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

// Mapping from app_category to Emoji
const categoryEmojiMap: { [key: string]: string } = {
  'temple': '🕍',
  'beach': '🏖️',
  'mountain': '⛰️',
  'waterfall': '🏞️',
  'island': '🏝️',
  'nature': '🌳',
  'culture': '🏛️',
  'food': '🍜',
  'shopping': '🛍️',
  'museum': '🏺',
  'park': '🏞️',
  'accommodation': '🏨',
  'all': '🌐'
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const fetchedCategories = await getCategories();
        // Add "All" category at the beginning
        const totalCount = fetchedCategories.reduce((sum, cat) => sum + cat.count, 0);
        setCategories([{ name: 'all', count: totalCount }, ...fetchedCategories]);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex space-x-2 pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load categories.</div>;
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
      {categories.map((category) => (
        <Button
          key={category.name}
          variant={selectedCategory === category.name || (selectedCategory === null && category.name === 'all') ? 'default' : 'outline'}
          className="rounded-full whitespace-nowrap"
          onClick={() => onCategoryChange(category.name === 'all' ? null : category.name)}
        >
          {categoryEmojiMap[category.name] || '📍'}
          <span className="ml-2 mr-1">{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
          <span className="text-xs opacity-70">({category.count})</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;