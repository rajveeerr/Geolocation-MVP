// src/pages/HomePage.tsx
import { useState } from 'react';
import { DealFinder } from '@/components/landing/DealFinder';
import { SectionDivider } from '@/components/common/SectionDivider';
import { ContentCarousel } from '@/components/common/ContentCarousel';
import { CarouselSkeleton } from '@/components/common/DealCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals'; // Use our existing Deal type
import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { premiumDeals, happyHourDeals, experiencesData } from '@/data/deals'; // Keep existing mock data
import { AnimatePresence } from 'framer-motion';

// Helper to add mock fields for UI compatibility until backend adds them
const adaptApiDealToUi = (apiDeal: any): Deal => ({
  id: apiDeal.id,
  name: apiDeal.title,
  image: apiDeal.imageUrl || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80', // Default image
  rating: 4.5, // Mock data
  category: apiDeal.merchant?.businessName || 'Restaurant', // Use merchant name as category
  price: '$$', // Mock data
  location: apiDeal.merchant?.address || 'Location TBD',
  dealType: apiDeal.discountPercentage ? 'Discount' : 'Happy Hour', // Infer type
  dealValue: apiDeal.discountPercentage ? `${apiDeal.discountPercentage}% OFF` : `$${apiDeal.discountAmount} OFF`,
  expiresAt: apiDeal.endTime,
  originalValue: 50, // Mock data
  discountValue: 25, // Mock data
});

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('deals');

  // --- THE FINAL API INTEGRATION ---
  const { data: rawDeals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: () => apiGet<any[]>('/deals'),
  });

  // Adapt the fetched deals to match our frontend Deal type
  const liveDeals = rawDeals?.data?.map(adaptApiDealToUi) || [];

  return (
    <div className="bg-white pt-16 sm:pt-20">
      <section className="border-b border-neutral-200 bg-white pb-6 pt-6 sm:pb-8 sm:pt-8 lg:pb-10 lg:pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DealFinder activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section>

      {/* Keep existing premium deals */}
      <ContentCarousel title="Today's Top Deals" deals={premiumDeals} />
      
      <SectionDivider />

      {/* Add live deals from API */}
      {isLoading ? (
        <>
          <CarouselSkeleton title="Latest Merchant Deals" />
          <SectionDivider />
        </>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error fetching live deals.</div>
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
  );
};
