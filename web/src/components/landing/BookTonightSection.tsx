// web/src/components/landing/BookTonightSection.tsx

import { useRef } from 'react';
import { BookingCard } from './BookingCard';
import { bookTonightDeals } from '@/data/deals';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const BookTonightSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl font-bold text-neutral-800">
              Book Tonight
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to={PATHS.ALL_DEALS}>
              <Button
                variant="secondary"
                size="md"
                className="rounded-full font-semibold"
              >
                See All
              </Button>
            </Link>
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 transition-colors hover:bg-neutral-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 transition-colors hover:bg-neutral-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrolling Cards */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide -mb-4 flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {bookTonightDeals.map((deal) => (
            <BookingCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
};
