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
      className="bg-white py-8"
      variants={carouselVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
          <div className="flex items-center gap-2">
            <Link
              to={PATHS.ALL_DEALS}
              className="text-sm font-semibold hover:underline"
            >
              Show all
            </Link>
            <button
              onClick={() => scroll('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 transition-colors hover:bg-neutral-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 transition-colors hover:bg-neutral-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrolling Cards */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex gap-6 overflow-x-auto pb-4"
        >
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="w-full flex-shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5"
            >
              <CarouselCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
