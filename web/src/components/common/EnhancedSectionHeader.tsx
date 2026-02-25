import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface EnhancedSectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  showAllLink?: boolean;
  allLink?: string;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  showNavigation?: boolean;
  variant?: 'simple' | 'detailed' | 'minimal';
}

export const EnhancedSectionHeader = ({
  icon,
  title,
  subtitle,
  showAllLink = true,
  allLink = '/deals',
}: EnhancedSectionHeaderProps) => {
  return (
    <div className="mb-5 sm:mb-6">
      {/* Top row: icon + title  |  See all offers → */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight text-[#1A1A1A]">
            {title}
          </h2>
        </div>

        {showAllLink && (
          <Link
            to={allLink}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-700 transition-colors whitespace-nowrap"
          >
            See all offers
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[13px] sm:text-sm text-gray-500 mt-1 ml-0">
          {subtitle}
        </p>
      )}

      {/* Mobile see-all link */}
      {showAllLink && (
        <Link
          to={allLink}
          className="flex sm:hidden items-center gap-1 text-sm font-semibold text-brand-primary-600 mt-2"
        >
          See all offers
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};
