// web/src/pages/AllDealsPage.tsx
import { useState } from 'react';
import { DealResultsList } from '@/components/deals/DealResultsList';
import { DealResultsMap } from '@/components/deals/DealResultsMap';
import { allDeals } from '@/data/deals';

export const AllDealsPage = () => {
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  return (
    <div className="pt-24 mb-12"> 
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2">
        <div className="lg:col-span-1 xl:col-span-1 h-screen overflow-y-auto px-4 no-scrollbar">
          <DealResultsList 
            deals={allDeals}
            hoveredDealId={hoveredDealId}
            setHoveredDealId={setHoveredDealId}
          />
        </div>

        <div className="hidden lg:block lg:col-span-2 xl:col-span-1 h-screen">
          <DealResultsMap 
            deals={allDeals}
            hoveredDealId={hoveredDealId}
          />
        </div>
      </div>
    </div>
  );
};