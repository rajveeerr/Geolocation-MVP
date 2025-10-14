import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Loader2, Check } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  searchable?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  placeholder = "Select a category",
  className,
  disabled = false,
  required = false,
  error,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData, isLoading, error: fetchError } = useCategories();

  const categories = categoriesData?.categories || [];
  const selectedCategory = categories.find(cat => cat.value === value);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (categoryValue: string) => {
    onChange(categoryValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm transition-colors",
          "focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          isOpen && "border-brand-primary-500 ring-2 ring-brand-primary-500/20"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedCategory ? (
            <>
              <span className="text-base">{selectedCategory.icon}</span>
              <span className="truncate">{selectedCategory.label}</span>
            </>
          ) : (
            <span className="text-neutral-500 truncate">
              {isLoading ? "Loading categories..." : placeholder}
            </span>
          )}
        </div>
        
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-neutral-400 flex-shrink-0 transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20 focus:border-brand-primary-500"
                />
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleSelect(category.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                    "hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none",
                    value === category.value && "bg-brand-primary-50 text-brand-primary-700"
                  )}
                >
                  <span className="text-base flex-shrink-0">{category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{category.label}</div>
                    {category.description && (
                      <div className="text-xs text-neutral-500 truncate">
                        {category.description}
                      </div>
                    )}
                  </div>
                  {value === category.value && (
                    <Check className="h-4 w-4 text-brand-primary-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                {searchTerm ? "No categories found" : "No categories available"}
              </div>
            )}
          </div>
        </div>
      )}

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
      {selectedCategory && selectedCategory.description && !isOpen && (
        <p className="mt-1 text-xs text-neutral-500">
          {selectedCategory.description}
        </p>
      )}
    </div>
  );
};
