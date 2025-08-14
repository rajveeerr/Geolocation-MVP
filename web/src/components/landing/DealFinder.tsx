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
    <div className="mx-auto w-full max-w-4xl">
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

      <div className="flex w-full items-center gap-2 rounded-full border bg-white p-2 shadow-lg">
        <div className="grid flex-1 grid-cols-1 divide-x divide-neutral-200 md:grid-cols-3">
          <div className="p-2 pl-4">
            <label htmlFor="where" className="block text-xs font-bold">
              Where?
            </label>
            <Input
              id="where"
              type="text"
              placeholder="Search destinations"
              className="h-auto border-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="p-2 pl-4">
            <label htmlFor="when" className="block text-xs font-bold">
              When?
            </label>
            <Input
              id="when"
              type="text"
              placeholder="Add dates"
              className="h-auto border-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="p-2 pl-4">
            <label htmlFor="who" className="block text-xs font-bold">
              Who?
            </label>
            <Input
              id="who"
              type="text"
              placeholder="Add guests"
              className="h-auto border-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <Button size="lg" className="h-12 w-12 flex-shrink-0 rounded-full p-0">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
