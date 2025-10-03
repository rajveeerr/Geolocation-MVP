// src/components/common/DealCardSkeleton.tsx
import { Star, Zap, Heart, MapPin, Clock, Sparkles } from 'lucide-react';
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

export const CarouselSkeleton = ({ title }: { title: string }) => {
  // Get appropriate icon and styling based on title (same logic as ContentCarousel)
  const getSectionConfig = (title: string) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('featured') || titleLower.includes('top')) {
      return {
        icon: <Star className="h-6 w-6 text-amber-500 sm:h-7 sm:w-7" />,
        subtitle: "Handpicked by our team",
        variant: 'simple' as const
      };
    }
    
    if (titleLower.includes('happy hour') || titleLower.includes('happy hours')) {
      return {
        icon: <Clock className="h-6 w-6 text-orange-500 sm:h-7 sm:w-7" />,
        subtitle: "Time to unwind",
        variant: 'simple' as const
      };
    }
    
    if (titleLower.includes('latest') || titleLower.includes('new')) {
      return {
        icon: <Zap className="h-6 w-6 text-yellow-500 sm:h-7 sm:w-7" />,
        subtitle: "Fresh from our partners",
        variant: 'simple' as const
      };
    }
    
    if (titleLower.includes('popular') || titleLower.includes('trending')) {
      return {
        icon: <Heart className="h-6 w-6 text-red-500 sm:h-7 sm:w-7" />,
        subtitle: "Loved by locals",
        variant: 'simple' as const
      };
    }
    
    if (titleLower.includes('experience') || titleLower.includes('events')) {
      return {
        icon: <Sparkles className="h-6 w-6 text-purple-500 sm:h-7 sm:w-7" />,
        subtitle: "Unforgettable moments",
        variant: 'detailed' as const,
        description: "Special events and unique experiences you won't find anywhere else."
      };
    }
    
    // Default configuration - minimal for generic sections
    return {
      icon: <MapPin className="h-6 w-6 text-brand-primary-500 sm:h-7 sm:w-7" />,
      variant: 'minimal' as const
    };
  };

  const sectionConfig = getSectionConfig(title);

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <EnhancedSectionHeader
          icon={sectionConfig.icon}
          title={title}
          subtitle={sectionConfig.subtitle}
          description={sectionConfig.description}
          variant={sectionConfig.variant}
          showAllLink={false}
          showNavigation={false}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DealCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
