// web/src/components/common/ContentCarousel.tsx

import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NewDealCard } from '@/components/landing/NewDealCard';
import { cn } from '@/lib/utils';
import { EnhancedSectionHeader } from '@/components/common/EnhancedSectionHeader';
import type { Deal } from '@/data/deals';
import { motion } from 'framer-motion';

interface ContentCarouselProps {
  title: string;
  deals: Deal[];
  /** Section icon – rendered to the left of the title */
  icon?: ReactNode;
  /** Short one-liner below the title */
  subtitle?: string;
  /** Route for "See all offers →". Defaults to /deals */
  allLink?: string;
  /** Show the "See all offers" link? */
  showAllLink?: boolean;
}

export const ContentCarousel = ({
  title,
  deals,
  icon,
  subtitle,
  allLink = '/deals',
  showAllLink = true,
}: ContentCarouselProps) => {
  // --- Refs and state for calculating drag constraints ---
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

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
      className="py-6 sm:py-8"
      variants={carouselVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <EnhancedSectionHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          allLink={allLink}
          showAllLink={showAllLink}
        />

        {/* Draggable carousel */}
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
              <div key={deal.id} className="w-[280px] flex-shrink-0 sm:w-[300px]">
                <NewDealCard deal={deal} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
