import { DiscoveryColumn } from './DiscoveryColumn';
import { happyHourDeals, topRatedDeals, newDeals } from '@/data/deals';
import { Zap, Trophy, Sparkles, Clock } from 'lucide-react'; // <-- Import the Clock icon

export const DiscoverSection = () => {
  return (
    <section className="bg-neutral-50 py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Discover Your Next Favorite Spot
            </h2>
        </div>
        
        {/* --- MODIFIED: Updated grid to support 4 columns on xl screens --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center">
          
          {/* --- NEW: Happy Hour Deals Column --- */}
          <DiscoveryColumn
            title="Happy Hours"
            icon={<Clock className="h-6 w-6 text-brand-primary-600" />}
            deals={happyHourDeals}
          />
          
          <DiscoveryColumn
            title="Climbing"
            icon={<Zap className="h-6 w-6 text-brand-primary-600" />}
            deals={topRatedDeals} // Using topRatedDeals as a proxy for "Climbing"
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
