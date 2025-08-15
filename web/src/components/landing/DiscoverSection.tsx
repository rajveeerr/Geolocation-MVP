// web/src/components/landing/DiscoverSection.tsx

import { DealColumn } from './DealColumn';
import { happyHourDeals, topRatedDeals, newDeals } from '@/data/deals';
import { Award, Sparkles, GlassWater } from 'lucide-react';

export const DiscoverSection = () => {
  return (
    <section className="bg-neutral-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Leaderboard</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12">
          <DealColumn
            title="Happy Hours"
            icon={<GlassWater className="h-6 w-6 text-red-500" />}
            deals={happyHourDeals}
          />
          <DealColumn
            title="Top Rated"
            icon={<Award className="h-6 w-6 text-amber-500" />}
            deals={topRatedDeals}
          />
          <DealColumn
            title="New on CitySpark"
            icon={<Sparkles className="h-6 w-6 text-sky-500" />}
            deals={newDeals}
          />
        </div>
      </div>
    </section>
  );
};
