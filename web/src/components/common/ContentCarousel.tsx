// web/src/components/common/ContentCarousel.tsx

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumV2DealCard } from '@/components/deals/PremiumV2DealCard'; // <-- Import the NEW card
import { Button } from '@/components/common/Button';
import { type Deal } from '@/data/deals';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

interface ContentCarouselProps {
  title: string;
  deals: Deal[];
}

export const ContentCarousel = ({ title, deals }: ContentCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
  // Scroll by a little less than the card width for a better feel
  const scrollAmount = (direction === 'left' ? -1 : 1) * 350; 
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

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
            <button
              onClick={() => scroll('left')}
              className="hidden h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md sm:flex sm:h-8 sm:w-8"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-neutral-600 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md sm:flex sm:h-8 sm:w-8"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5 text-neutral-600 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* --- MODIFIED: Use PremiumV2DealCard and adjust widths for the bigger card --- */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex gap-6 overflow-x-auto pb-4 -mx-4 px-4" // Add padding to view shadows
        >
          {deals.map((deal) => (
            <div key={deal.id} className="w-[340px] flex-shrink-0 sm:w-[360px]">
              <PremiumV2DealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
