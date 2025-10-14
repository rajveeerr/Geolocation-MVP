import { useState } from 'react';
// ...existing imports...
import { SectionDivider } from '@/components/common/SectionDivider';
import { ContentCarousel } from '@/components/common/ContentCarousel';
import { CarouselSkeleton } from '@/components/common/DealCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
// import type { Deal } from '@/data/deals';
import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { premiumDeals, happyHourDeals, experiencesData } from '@/data/deals'; // Fallback mock data
import { AnimatePresence } from 'framer-motion';
import { useFeaturedDeals } from '@/hooks/useFeaturedDeals';
import { useTodaysDeals } from '@/hooks/useTodaysDeals';
import { usePopularDeals } from '@/hooks/usePopularDeals';
import { useHappyHourDeals } from '@/hooks/useDealsByCategory';
import { useExperienceDeals } from '@/hooks/useDealsByCategory';
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

export const HomePage = () => {
  const [activeTab] = useState('deals');
  
  // Fetch real data from backend APIs
  const { data: featuredDeals, isLoading: isLoadingFeatured } = useFeaturedDeals();
  const { data: todaysDeals, isLoading: isLoadingTodays } = useTodaysDeals();
  const { data: popularDeals, isLoading: isLoadingPopular } = usePopularDeals();
  const { data: happyHourDealsData, isLoading: isLoadingHappyHour } = useHappyHourDeals();
  const { data: experienceDealsData, isLoading: isLoadingExperiences } = useExperienceDeals();

  // Fallback to mock data if real data is not available
  const displayTodaysDeals = todaysDeals && todaysDeals.length > 0 ? todaysDeals : premiumDeals;
  const displayHappyHourDeals = happyHourDealsData && happyHourDealsData.length > 0 ? happyHourDealsData : happyHourDeals;
  const displayExperienceDeals = experienceDealsData && experienceDealsData.length > 0 ? experienceDealsData : experiencesData;
  const displayPopularDeals = popularDeals && popularDeals.length > 0 ? popularDeals : premiumDeals;

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

      {/* Today's Top Deals */}
      {isLoadingTodays ? (
        <CarouselSkeleton title="Today's Top Deals" />
      ) : (
        <ContentCarousel title="Today's Top Deals" deals={displayTodaysDeals} />
      )}

      {/* Featured Deals Section */}
      {isLoadingFeatured ? (
        <CarouselSkeleton title="Featured Deals" />
      ) : (
        featuredDeals &&
        featuredDeals.length > 0 && (
          <ContentCarousel title="Featured Deals" deals={featuredDeals} />
        )
      )}

      <SectionDivider />

      {/* Popular Deals Near You */}
      {isLoadingPopular ? (
        <CarouselSkeleton title="Popular Deals Near You" />
      ) : (
        <ContentCarousel title="Popular Deals Near You" deals={displayPopularDeals} />
      )}

      <SectionDivider />

      {/* Dynamic Content Based on Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'deals' && (
          <ContentCarousel
            key="deals-carousel"
            title="Latest Deals"
            deals={displayPopularDeals}
          />
        )}

        {activeTab === 'experiences' && (
          isLoadingExperiences ? (
            <CarouselSkeleton title="Unforgettable Experiences" />
          ) : (
            <ContentCarousel
              key="experiences-carousel"
              title="Unforgettable Experiences"
              deals={displayExperienceDeals}
            />
          )
        )}
      </AnimatePresence>

      <SectionDivider />

      {/* Popular Happy Hours */}
      {isLoadingHappyHour ? (
        <CarouselSkeleton title="Popular Happy Hours" />
      ) : (
        <ContentCarousel title="Popular Happy Hours" deals={displayHappyHourDeals} />
      )}

      <SectionDivider />

      <DiscoverSection />
    </div>
    </>
  );
};
