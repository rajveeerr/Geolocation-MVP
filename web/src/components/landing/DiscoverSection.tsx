// web/src/components/landing/DiscoverSection.tsx
import { DiscoveryColumn } from './DiscoveryColumn'; // <-- Import the new component
import { happyHourDeals, topRatedDeals, newDeals } from '@/data/deals';
import { Zap, Trophy, Sparkles } from 'lucide-react'; // Zap for 'Climbing', Trophy for 'Top Rated'

export const DiscoverSection = () => {
  return (
    <section className="bg-neutral-50 py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Leaderboard
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          <DiscoveryColumn
            title="Climbing"
            icon={<Zap className="h-6 w-6 text-brand-primary-600" />}
            deals={happyHourDeals} // Using happy hour deals as a proxy for "climbing"
          />
          <DiscoveryColumn
            title="Top Rated"
            icon={<Trophy className="h-6 w-6 text-brand-primary-600" />}
            deals={topRatedDeals}
          />
          <DiscoveryColumn
            title="New On CitySpark"
            icon={<Sparkles className="h-6 w-6 text-brand-primary-600" />}
            deals={newDeals}
          />
        </div>
      </div>
    </section>
  );
};
