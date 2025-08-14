// web/src/components/landing/DiscoverSection.tsx

import { DealColumn } from './DealColumn';
import { happyHourDeals, topRatedDeals, newDeals } from '@/data/deals';
import { Award, Sparkles, GlassWater } from 'lucide-react';

export const DiscoverSection = () => {
  return (
    <section className="bg-neutral-100/70 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-800">Leaderboard</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-6">
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
