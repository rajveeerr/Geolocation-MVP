// web/src/components/common/ContentCarousel.tsx

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselCard } from '@/components/landing/CarouselCard';
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
      const scrollAmount =
        direction === 'left'
          ? -scrollContainerRef.current.clientWidth
          : scrollContainerRef.current.clientWidth;
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
      className="bg-white py-4 sm:py-6 lg:py-8"
      variants={carouselVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">{title}</h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to={PATHS.ALL_DEALS}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Show all
            </Link>
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrolling Cards */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-2 sm:pb-4"
        >
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 flex-shrink-0"
            >
              <CarouselCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
