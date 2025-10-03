
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
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
  description,
  showAllLink = true,
  onScrollLeft,
  onScrollRight,
  showNavigation = true,
  variant = 'simple',
}: EnhancedSectionHeaderProps) => {
  // Determine layout based on variant
  const isMinimal = variant === 'minimal';
  const isDetailed = variant === 'detailed' && (subtitle || description);

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header Content */}
      <div className="flex items-center justify-between">
        {/* Left side - Title with icon */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            {/* Subtitle - only show if not minimal and subtitle exists */}
            {!isMinimal && subtitle && (
              <p className="text-neutral-600 text-sm sm:text-base mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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
          
          {/* Navigation buttons */}
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
      </div>

      {/* Description - only show for detailed variant */}
      {isDetailed && description && (
        <p className="text-neutral-500 text-sm mt-3 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
};
