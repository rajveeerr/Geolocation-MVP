import { useState } from 'react';
import { useDealCategories } from '@/hooks/useDealCategories';
import { cn } from '@/lib/utils';

interface CategoryFilterBarProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

// Category images (using Unsplash placeholders) - matching Figma design
const categoryImageMap: Record<string, string> = {
  'FOOD_AND_BEVERAGE': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'RESTAURANTS': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'BARS': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
  'COFFEE': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop',
  'BRUNCH': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop',
  'DESSERTS': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',
  'HAPPY_HOUR': 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=200&h=200&fit=crop',
  'ENTERTAINMENT': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop',
  'RETAIL': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
  'SERVICES': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
  'HEALTH_FITNESS': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
  'BEAUTY_WELLNESS': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&h=200&fit=crop',
};

// Category label mapping
const categoryLabelMap: Record<string, string> = {
  'FOOD_AND_BEVERAGE': 'Restaurants',
  'RESTAURANTS': 'Restaurants',
  'BARS': 'Bars',
  'COFFEE': 'Coffee',
  'BRUNCH': 'Brunch',
  'DESSERTS': 'Desserts',
  'HAPPY_HOUR': 'Happy Hour',
  'ENTERTAINMENT': 'Entertainment',
  'RETAIL': 'Retail',
  'SERVICES': 'Services',
};

export const CategoryFilterBar = ({ 
  selectedCategory = 'all', 
  onCategoryChange 
}: CategoryFilterBarProps) => {
  const { data: categoriesData } = useDealCategories();
  const [localSelected, setLocalSelected] = useState(selectedCategory);

  const handleCategoryClick = (categoryValue: string) => {
    setLocalSelected(categoryValue);
    onCategoryChange?.(categoryValue);
  };

  // Get display categories - use first 6 categories from API, or fallback to defaults
  const displayCategories = categoriesData?.categories?.slice(0, 6) || [];

  // Default categories if API doesn't return enough
  const defaultCategories = [
    { value: 'RESTAURANTS', label: 'Restaurants' },
    { value: 'BARS', label: 'Bars' },
    { value: 'COFFEE', label: 'Coffee' },
    { value: 'BRUNCH', label: 'Brunch' },
    { value: 'DESSERTS', label: 'Desserts' },
    { value: 'HAPPY_HOUR', label: 'Happy Hour' },
  ];

  const categoriesToShow = displayCategories.length > 0 
    ? displayCategories.map(cat => ({
        value: cat.value,
        label: categoryLabelMap[cat.value] || cat.label,
        image: categoryImageMap[cat.value] || categoryImageMap['FOOD_AND_BEVERAGE'], // Fallback to restaurant image
      }))
    : defaultCategories.map(cat => ({
        value: cat.value,
        label: cat.label,
        image: categoryImageMap[cat.value] || categoryImageMap['RESTAURANTS'], // Fallback to restaurant image
      }));

  const currentSelected = localSelected || selectedCategory;

  return (
    <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
      {/* All Deals - Active by default */}
      <button
        onClick={() => handleCategoryClick('all')}
        className={cn(
          'flex items-center gap-2 shrink-0 pb-2 transition-colors',
          currentSelected === 'all'
            ? 'border-b-2 border-gray-900'
            : 'border-b-2 border-transparent hover:border-gray-300'
        )}
      >
        <span className="text-sm text-gray-900">All Deals</span>
      </button>

      {/* Category buttons with images */}
      {categoriesToShow.map((category) => {
        const isActive = currentSelected === category.value;
        return (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div
              className={cn(
                'w-16 h-16 rounded-full overflow-hidden border-2 transition-colors',
                isActive
                  ? 'border-gray-900'
                  : 'border-gray-200 group-hover:border-gray-900'
              )}
            >
              <img
                src={category.image}
                alt={category.label}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to a default restaurant image if image fails
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop';
                }}
              />
            </div>
            <span
              className={cn(
                'text-xs transition-colors',
                isActive
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 group-hover:text-gray-900'
              )}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

