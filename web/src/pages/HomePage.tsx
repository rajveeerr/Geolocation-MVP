// import { BookTonightSection } from '@/components/landing/BookTonightSection';
// import { DiscoverSection } from '@/components/landing/DiscoverSection';
// import { SearchHeader } from '@/components/landing/SearchHeader';
// import { SectionDivider } from '@/components/common/SectionDivider';

// export const HomePage = () => {
//   return (
//     <div className="pt-20"> {/* This offset is crucial to push content below the fixed header */}
//       <SearchHeader />
//       <DiscoverSection />
//       <SectionDivider />
//       <BookTonightSection />
//       {/* The rest of your homepage sections will follow here */}
//     </div>
//   );
// };

import { useState } from 'react';
import { DealFinder } from '@/components/landing/DealFinder';
import { SectionDivider } from '@/components/common/SectionDivider';

import { premiumDeals, happyHourDeals, experiencesData } from '@/data/deals'; // <-- THE FIX
import { AnimatePresence } from 'framer-motion';

import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { ContentCarousel } from '@/components/common/ContentCarousel';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('deals');

  return (
    <div className="bg-white pt-16 sm:pt-20">
      <section className="border-b border-neutral-200 bg-white pb-6 pt-6 sm:pb-8 sm:pt-8 lg:pb-10 lg:pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DealFinder activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section>

      {/* --- THE FIX: Use premiumDeals for the main carousel --- */}
      <ContentCarousel title="Today's Top Deals" deals={premiumDeals} />

      <SectionDivider />

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
