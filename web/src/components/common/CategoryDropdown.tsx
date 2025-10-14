import React from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CategoryDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select a category",
  className,
  disabled = false,
  required = false,
  error
}) => {
  const { data: categoriesData, isLoading, error: fetchError } = useCategories();

  const categories = categoriesData?.categories || [];

  const selectedCategory = categories.find(cat => cat.value === value);

  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        required={required}
        className={cn(
          "w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm transition-colors",
          "focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
      >
        <option value="" disabled>
          {isLoading ? "Loading categories..." : placeholder}
        </option>
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.icon} {category.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Fetch error message */}
      {fetchError && (
        <p className="mt-1 text-sm text-red-600">
          Failed to load categories. Please try again.
        </p>
      )}

      {/* Selected category description */}
      {selectedCategory && selectedCategory.description && (
        <p className="mt-1 text-xs text-neutral-500">
          {selectedCategory.description}
        </p>
      )}
    </div>
  );
};
