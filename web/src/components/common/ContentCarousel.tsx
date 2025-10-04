// web/src/components/common/ContentCarousel.tsx

import { useRef, useState, useEffect } from 'react'; // Import useState and useEffect
import { Star, Zap, Heart, MapPin, Clock, Sparkles } from 'lucide-react';
import { PremiumV2DealCard } from '@/components/deals/PremiumV2DealCard'; // <-- Import the NEW card
import { cn } from '@/lib/utils';
import { EnhancedSectionHeader } from '@/components/common/EnhancedSectionHeader';
import type { Deal } from '@/data/deals';
import { motion } from 'framer-motion';

interface ContentCarouselProps {
  title: string;
  deals: Deal[];
}

export const ContentCarousel = ({ title, deals }: ContentCarouselProps) => {
  // --- NEW: Refs and state for calculating drag constraints ---
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  const scroll = (value: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: value, behavior: 'smooth' });
  };

  // Get appropriate icon and styling based on title
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

  // Measure track and viewport to compute drag constraint
  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;

    if (track && viewport) {
      const trackWidth = track.scrollWidth;
      const viewportWidth = viewport.offsetWidth;
      const newConstraint = trackWidth > viewportWidth ? trackWidth - viewportWidth : 0;
      setDragConstraint(newConstraint);
    }
  }, [deals]);

  const carouselVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="bg-white py-6 sm:py-8 lg:py-12"
      variants={carouselVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <EnhancedSectionHeader
          icon={sectionConfig.icon}
          title={title}
          subtitle={sectionConfig.subtitle}
          description={sectionConfig.description}
          variant={sectionConfig.variant}
          onScrollLeft={() => scroll(-360)}
          onScrollRight={() => scroll(360)}
        />
        
        {/* Thick primary colored line below section heading */}
        <div className="mb-6 h-1 w-full bg-[#F97316] rounded-sm"></div>

        {/* --- MODIFIED: This is now the draggable carousel --- */}
        <div ref={viewportRef} className="overflow-hidden">
          <motion.div
            ref={trackRef}
            className={cn(
              "-mx-4 flex gap-6 px-4 pb-4 cursor-grab",
              dragConstraint > 0 && "active:cursor-grabbing"
            )}
            drag="x"
            dragConstraints={{ left: -dragConstraint, right: 0 }}
            dragElastic={0.2}
          >
            {deals.map((deal) => (
              <div key={deal.id} className="w-[340px] flex-shrink-0 sm:w-[360px]">
                <PremiumV2DealCard deal={deal} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
