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
      {/* Full-width responsive layout with smart containers */}
      <div className="w-full">
        <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Responsive Sidebar with container */}
          <div className="border-r border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm lg:col-span-5 xl:col-span-4 2xl:col-span-3">
            <div className="h-max overflow-hidden lg:h-screen">
              <DealsSidebar
                deals={allDeals}
                hoveredDealId={hoveredDealId}
                setHoveredDealId={setHoveredDealId}
              />
            </div>
          </div>

          {/* Right Column: Full-width Map */}
          <div className="relative hidden h-[calc(100vh-5rem)] bg-neutral-100/30 lg:col-span-7 lg:block xl:col-span-8 2xl:col-span-9">
            <DealResultsMap deals={allDeals} hoveredDealId={hoveredDealId} />
          </div>
        </div>
      </div>
    </div>
  );
};
