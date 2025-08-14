// web/src/pages/AllDealsPage.tsx
import { useState } from 'react';
import { DealResultsList } from '@/components/deals/DealResultsList';
import { DealResultsMap } from '@/components/deals/DealResultsMap';
import { allDeals } from '@/data/deals';

export const AllDealsPage = () => {
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  return (
    <div className="mb-12 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2">
        <div className="no-scrollbar h-screen overflow-y-auto px-4 lg:col-span-1 xl:col-span-1">
          <DealResultsList
            deals={allDeals}
            hoveredDealId={hoveredDealId}
            setHoveredDealId={setHoveredDealId}
          />
        </div>

        <div className="hidden h-screen lg:col-span-2 lg:block xl:col-span-1">
          <DealResultsMap deals={allDeals} hoveredDealId={hoveredDealId} />
        </div>
      </div>
    </div>
  );
};
