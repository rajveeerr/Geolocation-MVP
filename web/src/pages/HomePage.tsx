// import { HeroSection } from '@/components/landing/HeroSection';
// import { FeaturesSection } from '@/components/landing/FeaturesSection';
// import { MerchantCtaSection } from '@/components/landing/MerchantCtaSection';
// // import { BentoGridSection } from '@/components/landing/BentoGridSection';
// // import { UseCaseSection } from '@/components/landing/UseCaseSection';

// export const HomePage = () => {
//   return (
//     <>
//       <HeroSection />
//       <FeaturesSection />
//       {/* <BentoGridSection/> */}
//       {/* <UseCaseSection/> */}
//       <MerchantCtaSection />
//     </>
//   );
// };

// web/src/pages/HomePage.tsx

import { BookTonightSection } from '@/components/landing/BookTonightSection';
import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { Book } from 'lucide-react';
// We'll bring these back as we restyle them
// import { FeaturesSection } from '@/components/landing/FeaturesSection';
// import { MerchantCtaSection } from '@/components/landing/MerchantCtaSection';
// import { BentoGridSection } from '@/components/landing/BentoGridSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <DiscoverSection />
      <BookTonightSection />
      {/* For example: <LeaderboardSection /> */}
      {/* <FeaturesSection /> */}
      {/* <BentoGridSection /> */}
      {/* <MerchantCtaSection /> */}
    </>
  );
};