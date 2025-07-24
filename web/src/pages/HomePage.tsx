import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { MerchantCtaSection } from '@/components/landing/MerchantCtaSection';
import { BentoGridSection } from '@/components/landing/BentoGridSection';
import { UseCaseSection } from '@/components/landing/UseCaseSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <BentoGridSection/>
      <UseCaseSection/>
      <MerchantCtaSection />
    </>
  );
};