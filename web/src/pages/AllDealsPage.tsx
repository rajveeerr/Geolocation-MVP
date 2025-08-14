// // web/src/pages/AllDealsPage.tsx
// import { useState } from 'react';
// import { DealResultsList } from '@/components/deals/DealResultsList';
// import { DealResultsMap } from '@/components/deals/DealResultsMap';
// import { allDeals } from '@/data/deals';

// export const AllDealsPage = () => {
//   const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

//   return (
//     <div className="mb-12 pt-24">
//       <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2">
//         <div className="no-scrollbar h-screen overflow-y-auto px-4 lg:col-span-1 xl:col-span-1">
//           <DealResultsList
//             deals={allDeals}
//             hoveredDealId={hoveredDealId}
//             setHoveredDealId={setHoveredDealId}
//           />
//         </div>

//         <div className="hidden h-screen lg:col-span-2 lg:block xl:col-span-1">
//           <DealResultsMap deals={allDeals} hoveredDealId={hoveredDealId} />
//         </div>
//       </div>
//     </div>
//   );
// };


// web/src/pages/AllDealsPage.tsx

import { useState } from 'react';
import { DealsSidebar } from '@/components/deals/DealsSidebar';
import { DealResultsMap } from '@/components/deals/DealResultsMap';
import { allDeals } from '@/data/deals';

export const AllDealsPage = () => {
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 pt-20">
      {/* Consistent grid layout with premium styling */}
      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 min-h-[calc(100vh-5rem)]">
        
        {/* Left Column: Premium Sidebar */}
        <div className="lg:col-span-2 xl:col-span-1 h-[calc(100vh-5rem)] border-r border-neutral-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <DealsSidebar 
            deals={allDeals}
            hoveredDealId={hoveredDealId}
            setHoveredDealId={setHoveredDealId}
          />
        </div>

        {/* Right Column: Map with consistent styling */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 h-[calc(100vh-5rem)] relative bg-neutral-100/30">
          <DealResultsMap 
            deals={allDeals}
            hoveredDealId={hoveredDealId}
          />
        </div>
      </div>
    </div>
  );
};