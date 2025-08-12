// web/src/components/landing/BookTonightSection.tsx

import { useRef } from 'react';
import { BookingCard } from './BookingCard';
import { bookTonightDeals } from '@/data/deals';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const BookTonightSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-neutral-800">Book Tonight</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" className="font-semibold">
              See All
            </Button>
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrolling Cards */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 -mb-4 scrollbar-hide"
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