// web/src/components/landing/DiscoverSection.tsx
import { DealColumn } from './DealColumn';
import { happyHourDeals, topRatedDeals, newDeals } from '@/data/deals';
import { TrendingUp, Trophy, Sparkles } from 'lucide-react';

export const DiscoverSection = () => {
  return (
    <section className="bg-neutral-50 py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Leaderboard
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12">
          <DealColumn
            title="Happy Hours"
            icon={<TrendingUp className="h-6 w-6 text-brand-primary-600" />}
            deals={happyHourDeals}
          />
          <DealColumn
            title="Top Rated"
            icon={<Trophy className="h-6 w-6 text-brand-primary-600" />}
            deals={topRatedDeals}
          />
          <DealColumn
            title="New on CitySpark"
            icon={<Sparkles className="h-6 w-6 text-brand-primary-600" />}
            deals={newDeals}
          />
        </div>
      </div>
    </section>
  );
};
