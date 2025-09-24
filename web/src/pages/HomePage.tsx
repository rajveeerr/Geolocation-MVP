import { useState } from 'react';
// ...existing imports...
import { SectionDivider } from '@/components/common/SectionDivider';
import { ContentCarousel } from '@/components/common/ContentCarousel';
import { CarouselSkeleton } from '@/components/common/DealCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
// import type { Deal } from '@/data/deals';
import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { premiumDeals, happyHourDeals, experiencesData } from '@/data/deals'; // Keep existing mock data
import { AnimatePresence } from 'framer-motion';
import { useFeaturedDeals } from '@/hooks/useFeaturedDeals'; // <-- Import the new hook
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

export const HomePage = () => {
  const [activeTab] = useState('deals');
  const { data: featuredDeals, isLoading: isLoadingFeatured } =
    useFeaturedDeals();

  const {
    data: rawDeals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: () => apiGet<ApiDeal[]>('/deals'),
  });
  const normalizeDealsArray = (data: unknown): ApiDeal[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as ApiDeal[];

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.deals)) return obj.deals as ApiDeal[];
      if (Array.isArray(obj.data)) return obj.data as ApiDeal[];
      return [data as ApiDeal];
    }

    return [];
  };

  const liveDeals = normalizeDealsArray(rawDeals?.data).map((d) =>
    adaptApiDealToFrontend(d as ApiDeal),
  );

  return (
    <>
      <title>Yohop | Live Local Deals, Happy Hours & Events</title>
      <meta
        name="description"
        content="Discover real-time deals, exclusive happy hours, and unique local experiences. Yohop is your live map to the best moments in your city."
      />
      <div className="bg-white pt-16 sm:pt-20">
      {/* <section className="border-b border-neutral-200 bg-white pb-6 pt-6 sm:pb-8 sm:pt-8 lg:pb-10 lg:pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DealFinder activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section> */}

      <ContentCarousel title="Today's Top Deals" deals={premiumDeals} />

      {/* --- NEW: Featured Deals Section --- */}
      {isLoadingFeatured ? (
        <CarouselSkeleton title="Featured Deals" />
      ) : (
        featuredDeals &&
        featuredDeals.length > 0 && (
          <ContentCarousel title="Featured Deals" deals={featuredDeals} />
        )
      )}

      <SectionDivider />

      {isLoading ? (
        <>
          <CarouselSkeleton title="Latest Merchant Deals" />
          <SectionDivider />
        </>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          Error fetching live deals.
        </div>
      ) : liveDeals.length > 0 ? (
        <>
          <ContentCarousel title="Latest Merchant Deals" deals={liveDeals} />
          <SectionDivider />
        </>
      ) : null}

      <AnimatePresence mode="wait">
        {activeTab === 'deals' && (
          <ContentCarousel
            key="deals-carousel"
            title="Popular Deals Near You"
            deals={premiumDeals}
          />
        )}

        {activeTab === 'experiences' && (
          <ContentCarousel
            key="experiences-carousel"
            title="Unforgettable Experiences"
            deals={experiencesData}
          />
        )}
      </AnimatePresence>

      <SectionDivider />

      <ContentCarousel title="Popular Happy Hours" deals={happyHourDeals} />

      <SectionDivider />

      <DiscoverSection />
    </div>
    </>
  );
};
