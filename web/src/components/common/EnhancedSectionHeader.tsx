
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/common/Button';
// import { PATHS } from '@/routing/paths';
import type { ReactNode } from 'react';

interface EnhancedSectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  showAllLink?: boolean;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  showNavigation?: boolean;
  variant?: 'simple' | 'detailed' | 'minimal';
}

export const EnhancedSectionHeader = ({
  icon,
  title,
  subtitle,
  showAllLink: _showAllLink = true,
  onScrollLeft: _onScrollLeft,
  onScrollRight: _onScrollRight,
  showNavigation: _showNavigation = true,
  variant = 'simple',
}: EnhancedSectionHeaderProps) => {
  // Determine layout based on variant
  const isMinimal = variant === 'minimal';

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header Content - Left aligned like Figma */}
      <div className="flex flex-col">
        {/* Title with icon - Horizontal layout */}
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
        </div>
        
        {/* Subtitle - Left aligned, styled like Figma */}
        {!isMinimal && subtitle && (
          <p className="text-gray-600 text-base sm:text-lg mt-1 ml-0">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side - Actions (commented out per user request) */}
      {/* 
      {(showAllLink || (showNavigation && onScrollLeft && onScrollRight)) && (
        <div className="flex items-center justify-end gap-2 sm:gap-3 mt-4">
          {showAllLink && (
            <Link to={PATHS.ALL_DEALS}>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
              >
                Show all
              </Button>
            </Link>
          )}
          
          {showNavigation && onScrollLeft && onScrollRight && (
            <>
              <button
                onClick={onScrollLeft}
                className="hidden h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md sm:flex sm:h-8 sm:w-8"
                aria-label="Scroll left"
              >
                <svg className="h-3.5 w-3.5 text-neutral-600 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={onScrollRight}
                className="hidden h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md sm:flex sm:h-8 sm:w-8"
                aria-label="Scroll right"
              >
                <svg className="h-3.5 w-3.5 text-neutral-600 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
      */}
    </div>
  );
};
