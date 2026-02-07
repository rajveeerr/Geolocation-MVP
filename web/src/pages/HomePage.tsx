import { ContentCarousel } from '@/components/common/ContentCarousel';
import { CarouselSkeleton } from '@/components/common/DealCardSkeleton';
import { NewHeroSection } from '@/components/landing/NewHeroSection';
import { LeaderboardSection } from '@/components/landing/LeaderboardSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { premiumDeals, happyHourDeals, experiencesData } from '@/data/deals';
import { useFeaturedDeals } from '@/hooks/useFeaturedDeals';
import { useTodaysDeals } from '@/hooks/useTodaysDeals';
import { usePopularDeals } from '@/hooks/usePopularDeals';
import { useHappyHourDeals } from '@/hooks/useDealsByCategory';
import { useExperienceDeals } from '@/hooks/useDealsByCategory';
import {
  Flame,
  Sparkles,
  Heart,
} from 'lucide-react';

/* ─── Section icons (match Figma colours) ─── */
const SectionIcons = {
  fastFood: <Flame className="h-6 w-6 text-[#B91C1C] sm:h-7 sm:w-7" />,
  weekend: <Sparkles className="h-6 w-6 text-[#B91C1C] sm:h-7 sm:w-7" />,
  selfCare: <Heart className="h-6 w-6 text-[#B91C1C] sm:h-7 sm:w-7" />,
};

export const HomePage = () => {
  // Fetch real data from backend APIs
  const { data: featuredDeals, isLoading: isLoadingFeatured } = useFeaturedDeals();
  const { data: todaysDeals, isLoading: isLoadingTodays } = useTodaysDeals();
  const { data: popularDeals, isLoading: isLoadingPopular } = usePopularDeals();
  const { data: happyHourDealsData, isLoading: isLoadingHappyHour } = useHappyHourDeals();
  const { data: experienceDealsData, isLoading: isLoadingExperiences } = useExperienceDeals();

  // Fallback to mock data if real data is not available
  const displayTodaysDeals = todaysDeals?.length ? todaysDeals : premiumDeals;
  const displayFeaturedDeals = featuredDeals?.length ? featuredDeals : premiumDeals;
  const displayHappyHourDeals = happyHourDealsData?.length ? happyHourDealsData : happyHourDeals;
  const displayExperienceDeals = experienceDealsData?.length ? experienceDealsData : experiencesData;
  const displayPopularDeals = popularDeals?.length ? popularDeals : premiumDeals;

  return (
    <>
      <title>Yohop | Live Local Deals, Happy Hours & Events</title>
      <meta
        name="description"
        content="Discover real-time deals, exclusive happy hours, and unique local experiences. Yohop is your live map to the best moments in your city."
      />

      <div className="bg-white bg-texture">
        {/* Hero Section */}
        <NewHeroSection />

        {/* ── Fast Food Friday ── */}
        {isLoadingTodays || isLoadingFeatured ? (
          <CarouselSkeleton
            title="Fast Food Friday"
            icon={SectionIcons.fastFood}
            subtitle="Kickstart your weekend with these tasty quick bites."
          />
        ) : (
          <ContentCarousel
            title="Fast Food Friday"
            icon={SectionIcons.fastFood}
            subtitle="Kickstart your weekend with these tasty quick bites."
            deals={displayTodaysDeals}
            allLink="/deals?category=FOOD_AND_BEVERAGE"
          />
        )}

        {/* ── Weekend Energy ── */}
        {isLoadingExperiences ? (
          <CarouselSkeleton
            title="Weekend Energy"
            icon={SectionIcons.weekend}
            subtitle="Plans for the Weekend? We've Got You."
          />
        ) : (
          <ContentCarousel
            title="Weekend Energy"
            icon={SectionIcons.weekend}
            subtitle="Plans for the Weekend? We've Got You."
            deals={displayExperienceDeals}
            allLink="/deals?category=ENTERTAINMENT"
          />
        )}

        {/* ── Self-Care Mode ── */}
        {isLoadingHappyHour || isLoadingPopular ? (
          <CarouselSkeleton
            title="Self-Care Mode"
            icon={SectionIcons.selfCare}
            subtitle="Everything you need to unwind, glow, and step out confident. You can bring your friends too!"
          />
        ) : (
          <ContentCarousel
            title="Self-Care Mode"
            icon={SectionIcons.selfCare}
            subtitle="Everything you need to unwind, glow, and step out confident. You can bring your friends too!"
            deals={displayHappyHourDeals}
            allLink="/deals?category=HEALTH_AND_BEAUTY"
          />
        )}

        {/* ── Popular Near You (extra section if we have data) ── */}
        {displayPopularDeals.length > 0 && !isLoadingPopular && (
          <ContentCarousel
            title="Popular Near You"
            icon={<Flame className="h-6 w-6 text-[#B91C1C] sm:h-7 sm:w-7" />}
            subtitle="Trending deals in your area right now."
            deals={displayPopularDeals}
            allLink="/deals"
          />
        )}

        {/* ── Featured Picks ── */}
        {displayFeaturedDeals.length > 0 && !isLoadingFeatured && (
          <ContentCarousel
            title="Featured Picks"
            icon={<Sparkles className="h-6 w-6 text-[#B91C1C] sm:h-7 sm:w-7" />}
            subtitle="Handpicked by our team just for you."
            deals={displayFeaturedDeals}
            allLink="/deals"
          />
        )}

        {/* Leaderboard Section */}
        <LeaderboardSection />

        {/* How It Works Section */}
        <HowItWorksSection />
      </div>
    </>
  );
};
