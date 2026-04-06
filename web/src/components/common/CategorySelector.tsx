import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Loader2, Check } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
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
  label,
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
      {label ? (
        <label className="mb-2 block text-sm font-medium text-[#4c5b6d]">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={cn(
          "w-full flex items-center justify-between rounded-[1.35rem] border border-[#e7d9ca] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f3_100%)] px-4 py-3.5 text-sm text-[#203247] shadow-[0_12px_28px_rgba(82,58,40,0.06)] transition-all duration-200",
          "focus:border-[#ff8a66] focus:outline-none focus:ring-2 focus:ring-[#ff8a66]/20",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          isOpen && "border-[#ff8a66] ring-2 ring-[#ff8a66]/20"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedCategory ? (
            <>
              <span className="text-base">{selectedCategory.icon}</span>
              <span className="truncate font-medium">{selectedCategory.label}</span>
            </>
          ) : (
            <span className="truncate text-[#8a94a5]">
              {isLoading ? "Loading categories..." : placeholder}
            </span>
          )}
        </div>
        
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDown 
            className={cn("h-4 w-4 flex-shrink-0 text-[#8a94a5] transition-transform", isOpen && "rotate-180")} 
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-hidden rounded-[1.35rem] border border-[#eaded2] bg-[rgba(255,250,246,0.98)] shadow-[0_24px_60px_rgba(82,58,40,0.16)] backdrop-blur-xl">
          {/* Search Input */}
          {searchable && (
            <div className="border-b border-[#f0e5da] p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a3b4]" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-[#eaded2] bg-white/90 py-2.5 pl-9 pr-3 text-sm text-[#203247] outline-none transition-all placeholder:text-[#97a3b4] focus:border-[#ff8a66] focus:ring-2 focus:ring-[#ff8a66]/15"
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
                    "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                    "hover:bg-[#fff2ea] focus:bg-[#fff2ea] focus:outline-none",
                    value === category.value && "bg-[#fff0e8] text-[#c35e3f]"
                  )}
                >
                  <span className="text-base flex-shrink-0">{category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{category.label}</div>
                    {category.description && (
                      <div className="truncate text-xs text-[#7a8798]">
                        {category.description}
                      </div>
                    )}
                  </div>
                  {value === category.value && (
                    <Check className="h-4 w-4 flex-shrink-0 text-[#ff7a59]" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-sm text-[#7a8798]">
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
        <p className="mt-2 text-xs leading-5 text-[#7a8798]">
          {selectedCategory.description}
        </p>
      )}
    </div>
  );
};
