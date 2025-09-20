// web/src/components/common/ContentCarousel.tsx

import { useRef, useState, useEffect } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom';
import { PremiumV2DealCard } from '@/components/deals/PremiumV2DealCard'; // <-- Import the NEW card
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { PATHS } from '@/routing/paths';
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
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {title}
          </h2>
          {/* Removed arrow buttons — carousel is draggable now */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to={PATHS.ALL_DEALS}>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
              >
                Show all
              </Button>
            </Link>
          </div>
        </div>

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
