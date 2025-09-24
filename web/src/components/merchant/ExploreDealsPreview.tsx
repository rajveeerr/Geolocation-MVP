import { useFeaturedDeals } from '@/hooks/useFeaturedDeals';
import { CarouselSkeleton } from '@/components/common/DealCardSkeleton'; // Use the carousel skeleton
import { ContentCarousel } from '@/components/common/ContentCarousel'; // <-- Import the carousel
import { placeholderDeals } from '@/data/deals-placeholder';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { ArrowRight } from 'lucide-react';

export const ExploreDealsPreview = () => {
  // The hook correctly fetches featured deals. No changes needed here.
  const { data: featuredDeals, isLoading, error } = useFeaturedDeals();

  return (
    <div className="mt-8 border-t border-amber-200/50 pt-8">
      {/* --- This is now a self-contained component that uses the carousel --- */}
      
      {isLoading && (
        // Use the specific skeleton for carousels for a consistent loading feel
        <CarouselSkeleton title="While you wait, explore deals in your city" />
      )}

      {error && (
        <div className="text-center mb-4">
          <p className="text-status-expired">Could not load featured deals at the moment.</p>
          <Link to={PATHS.ALL_DEALS} className="mt-4 inline-block">
            <Button size="lg" variant="secondary">
                Browse All Deals
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* --- RENDER THE CAROUSEL --- */}
      {/* Fallback to placeholder deals when backend doesn't return any featured deals */}
      {!(isLoading) && (
        <ContentCarousel
          title="While you wait, explore deals in your city"
          deals={featuredDeals && featuredDeals.length > 0 ? featuredDeals : placeholderDeals}
        />
      )}
    </div>
  );
};
