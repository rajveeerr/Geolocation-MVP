import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useDealCategories } from '@/hooks/useDealCategories';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';

// Category images — circular thumbnails matching Figma
const categoryImageMap: Record<string, string> = {
  'FOOD_AND_BEVERAGE': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'RETAIL': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
  'ENTERTAINMENT': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
  'HEALTH_AND_FITNESS': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
  'BEAUTY_AND_SPA': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&h=200&fit=crop',
  'AUTOMOTIVE': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop',
  'TRAVEL': 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=200&h=200&fit=crop',
  'EDUCATION': 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop',
  'TECHNOLOGY': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop',
  'HOME_AND_GARDEN': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
  'OTHER': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop',
};

// Friendly display labels
const categoryDisplayLabel: Record<string, string> = {
  'FOOD_AND_BEVERAGE': 'Restaurants',
  'RETAIL': 'Retail',
  'ENTERTAINMENT': 'Bars',
  'HEALTH_AND_FITNESS': 'Fitness',
  'BEAUTY_AND_SPA': 'Beauty',
  'AUTOMOTIVE': 'Auto',
  'TRAVEL': 'Happy Hour',
  'EDUCATION': 'Education',
  'TECHNOLOGY': 'Tech',
  'HOME_AND_GARDEN': 'Home',
  'OTHER': 'Other',
};

// Static fallback dropdown options built from DealCategory enum
const fallbackDropdownOptions = [
  { value: 'all', label: 'All Deals', icon: '🔥' },
  { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage', icon: '🍽️' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🍸' },
  { value: 'RETAIL', label: 'Retail', icon: '🛍️' },
  { value: 'HEALTH_AND_FITNESS', label: 'Fitness & Wellness', icon: '💪' },
  { value: 'BEAUTY_AND_SPA', label: 'Beauty & Spa', icon: '💅' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
  { value: 'EDUCATION', label: 'Education', icon: '📚' },
  { value: 'TECHNOLOGY', label: 'Technology', icon: '💻' },
];

interface NewHeroSectionProps {
  onCategoryChange?: (category: string) => void;
  onFilterClick?: () => void;
}

export const NewHeroSection = ({ onCategoryChange, onFilterClick }: NewHeroSectionProps) => {
  const navigate = useNavigate();
  const { data: categoriesData } = useDealCategories();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownFilter, setDropdownFilter] = useState('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build category circles from API (first 6)
  const apiCategories = categoriesData?.categories || [];
  const displayCategories = apiCategories.length > 0
    ? apiCategories.slice(0, 6).map(cat => ({
        value: cat.value,
        label: categoryDisplayLabel[cat.value] || cat.label,
        image: categoryImageMap[cat.value] || categoryImageMap['FOOD_AND_BEVERAGE'],
        icon: cat.icon,
      }))
    : [
        { value: 'FOOD_AND_BEVERAGE', label: 'Restaurants', image: categoryImageMap['FOOD_AND_BEVERAGE'], icon: '🍽️' },
        { value: 'ENTERTAINMENT', label: 'Bars', image: categoryImageMap['ENTERTAINMENT'], icon: '🍸' },
        { value: 'OTHER', label: 'Coffee', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop', icon: '☕' },
        { value: 'HEALTH_AND_FITNESS', label: 'Brunch', image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop', icon: '🥐' },
        { value: 'BEAUTY_AND_SPA', label: 'Desserts', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', icon: '🍰' },
        { value: 'TRAVEL', label: 'Happy Hour', image: categoryImageMap['TRAVEL'], icon: '🍹' },
      ];

  // Build dropdown from ALL API categories
  const dropdownOptions = apiCategories.length > 0
    ? [
        { value: 'all', label: 'All Deals', icon: '🔥' },
        ...apiCategories.map(cat => ({
          value: cat.value,
          label: cat.label,
          icon: cat.icon,
        })),
      ]
    : fallbackDropdownOptions;

  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    onCategoryChange?.(categoryValue);
    if (categoryValue === 'all') {
      navigate(PATHS.ALL_DEALS);
    } else {
      navigate(`${PATHS.ALL_DEALS}?category=${categoryValue}`);
    }
  };

  const handleDropdownSelect = (value: string) => {
    setDropdownFilter(value);
    setIsDropdownOpen(false);
    setSelectedCategory(value);
    onCategoryChange?.(value);
    if (value === 'all') {
      navigate(PATHS.ALL_DEALS);
    } else {
      navigate(`${PATHS.ALL_DEALS}?category=${value}`);
    }
  };

  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    } else {
      navigate(PATHS.ALL_DEALS);
    }
  };

  return (
    <section className="bg-white pt-36 md:pt-20 pb-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ── NEW DEALS DROPPED TODAY badge ── */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] uppercase text-[#4A4A4A]">
            <span className="h-2 w-2 rounded-full bg-brand-primary-600 animate-pulse shrink-0" />
            NEW DEALS DROPPED TODAY
          </span>
        </div>

        {/* ── Main Headline — full width, single line ── */}
        <div className="mb-5 w-full min-w-0">
          <h1
            className="leading-[1.05] tracking-tight flex flex-nowrap items-baseline gap-x-2 whitespace-nowrap"
            style={{ fontSize: 'clamp(1.25rem, 3.5vw, 3.25rem)' }}
          >
            <span className="font-black text-[#1A1A1A] uppercase whitespace-nowrap">
              FIND A DEAL.
            </span>
            <span
              className="italic text-brand-primary-600 whitespace-nowrap"
              style={{ fontFamily: "'Lora', 'Georgia', serif", fontWeight: 400 }}
            >
              bring friends.
            </span>
            <span className="font-black text-[#1A1A1A] uppercase whitespace-nowrap">
              GET PAID CA<span className="line-through">$</span>H.
            </span>
          </h1>
        </div>

        {/* ── Sub-text ── */}
        <p className="text-gray-400 text-[15px] md:text-base max-w-md mb-10 leading-relaxed">
          The most exclusive happy hour deals in Atlanta,
          <br className="hidden sm:block" />
          curated for you and your squad. Gamify your dining
          <br className="hidden sm:block" />
          experience.
        </p>

        {/* ── Category Filter Row — All Deals pill (left), centered story circles, Filter (right) ── */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {/* ALL DEALS dropdown pill — Figma: white bg, dark border, red cutlery icon */}
          <div className="relative shrink-0 flex items-center" style={{ height: '110px' }} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'flex items-center gap-2.5 rounded-full border-2 border-neutral-300 bg-white px-5 py-2.5 transition-all duration-200 text-sm font-semibold select-none',
                dropdownFilter === 'all'
                  ? 'border-neutral-300 text-[#1A1A1A] hover:border-neutral-400'
                  : 'border-neutral-900 bg-neutral-900 text-white',
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn('shrink-0', dropdownFilter === 'all' ? 'text-brand-primary-600' : 'text-white')}
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
              <span className="uppercase tracking-wider text-[13px]">{dropdownFilter === 'all' ? 'ALL' : (dropdownOptions.find(o => o.value === dropdownFilter)?.label || 'ALL')}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isDropdownOpen && 'rotate-180',
                )}
              />
            </button>

            {/* Dropdown panel */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {dropdownOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleDropdownSelect(option.value)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50',
                      dropdownFilter === option.value
                        ? 'bg-gray-50 font-semibold text-gray-900'
                        : 'text-gray-600',
                    )}
                  >
                    <span className="text-lg w-6 text-center">{option.icon}</span>
                    <span className="flex-1">{option.label}</span>
                    {dropdownFilter === option.value && (
                      <span className="text-brand-primary-600 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category circle buttons — center-aligned story thingy */}
          <div className="flex-1 flex items-center justify-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide min-w-0">
          {displayCategories.map(category => {
            const isActive = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div
                  className={cn(
                    'w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden border-[2.5px] transition-all duration-200',
                    isActive
                      ? 'border-gray-900 shadow-md scale-105'
                      : 'border-gray-200 group-hover:border-gray-400 group-hover:shadow-sm',
                  )}
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop';
                    }}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-500 group-hover:text-gray-900',
                  )}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
          </div>

          {/* Filter / settings icon — Figma: white bg, red filter icon */}
          <button
            onClick={handleFilterClick}
            className="flex flex-col items-center gap-2 shrink-0 group"
            title="More filters"
          >
            <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full border-[2.5px] border-neutral-200 bg-white flex items-center justify-center transition-all duration-200 group-hover:border-neutral-400 group-hover:shadow-sm">
              <SlidersHorizontal className="h-6 w-6 text-brand-primary-600 group-hover:text-brand-primary-600 transition-colors" />
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors whitespace-nowrap invisible">
              Filters
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
