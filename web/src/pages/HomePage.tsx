import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { MerchantCtaSection } from '@/components/landing/MerchantCtaSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      {/* <CategoryShowcase/> */}
      <FeaturesSection />
      {/* <BentoGridSection/> */}
      {/* <UseCaseSection/> */}
      <MerchantCtaSection />
    </>
  );
};
