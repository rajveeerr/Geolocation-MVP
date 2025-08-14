// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/common/Button';
// import { Search, MapPin, Calendar, Clock } from 'lucide-react';

// export const DealFinder = () => {
//   return (
//     <div className="mx-auto mt-8 w-full max-w-4xl">
//       <div className="flex items-center gap-2 rounded-full border bg-white p-2 shadow-lg">
//         <div className="relative flex-1">
//           <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
//           <Input
//             type="text"
//             placeholder="What are you looking for? (e.g. Pizza, Tacos...)"
//             className="h-14 border-none bg-transparent pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="secondary"
//             size="lg"
//             className="h-14 w-14 flex-shrink-0 rounded-full p-0"
//           >
//             <Calendar className="h-5 w-5" />
//           </Button>
//           <Button
//             variant="secondary"
//             size="lg"
//             className="h-14 w-14 flex-shrink-0 rounded-full p-0"
//           >
//             <Clock className="h-5 w-5" />
//           </Button>
//         </div>
//         <Button size="lg" className="h-14 w-14 flex-shrink-0 rounded-full p-0">
//           <Search className="h-6 w-6" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// web/src/components/landing/DealFinder.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'deals', label: 'Deals', icon: <MapPin className="mr-2 h-5 w-5" /> },
  {
    id: 'experiences',
    label: 'Experiences',
    icon: <Briefcase className="mr-2 h-5 w-5" />,
  },
];

interface DealFinderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const DealFinder = ({ activeTab, onTabChange }: DealFinderProps) => {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="mb-2 flex justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center border-b-2 px-4 py-3 font-semibold text-neutral-600 transition-all',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-neutral-300',
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-lg sm:rounded-full">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col divide divide-neutral-200 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-4 sm:p-2 sm:pl-4">
              <label htmlFor="where" className="block text-xs font-bold text-neutral-700">
                Where?
              </label>
              <Input
                id="where"
                type="text"
                placeholder="Search destinations"
                className="mt-1 h-auto border-none bg-transparent p-0 text-sm placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="p-4 sm:p-2 sm:pl-4">
              <label htmlFor="when" className="block text-xs font-bold text-neutral-700">
                When?
              </label>
              <Input
                id="when"
                type="text"
                placeholder="Add dates"
                className="mt-1 h-auto border-none bg-transparent p-0 text-sm placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="p-4 sm:p-2 sm:pl-4">
              <label htmlFor="who" className="block text-xs font-bold text-neutral-700">
                Who?
              </label>
              <Input
                id="who"
                type="text"
                placeholder="Add guests"
                className="mt-1 h-auto border-none bg-transparent p-0 text-sm placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div className="p-4 sm:p-2">
            <Button 
              size="lg" 
              className="h-12 w-full rounded-xl sm:h-12 sm:w-12 sm:flex-shrink-0 sm:rounded-full sm:p-0"
            >
              <Search className="h-5 w-5" />
              <span className="ml-2 sm:hidden">Search</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
