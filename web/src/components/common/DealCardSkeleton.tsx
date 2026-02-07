// src/components/common/DealCardSkeleton.tsx
import type { ReactNode } from 'react';
import { EnhancedSectionHeader } from '@/components/common/EnhancedSectionHeader';

export const DealCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-neutral-200" />

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-neutral-200" />

        {/* Rating and category */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-neutral-200" />
          <div className="h-4 w-12 rounded bg-neutral-200" />
        </div>

        {/* Location */}
        <div className="h-4 w-1/2 rounded bg-neutral-200" />

        {/* Deal value */}
        <div className="h-6 w-2/3 rounded bg-neutral-200" />

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-20 rounded bg-neutral-200" />
          <div className="h-8 w-16 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};

interface CarouselSkeletonProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
}

export const CarouselSkeleton = ({ title, icon, subtitle }: CarouselSkeletonProps) => {
  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <EnhancedSectionHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          showAllLink={false}
        />

        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[340px] flex-shrink-0 sm:w-[360px]">
              <DealCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
