// web/src/pages/admin/DashboardLeaderboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
// Loader2 intentionally not used directly here; the pulsing placeholders replace spinner usage.

// MOCK API HOOKS for demonstration purposes
const useTopMerchants = () => useQuery({ 
  queryKey: ['adminTopMerchants'], 
  queryFn: async () => {
    await new Promise(res => setTimeout(res, 800));
    return [
      { name: 'The Corner Bistro', value: '$4,500' }, 
      { name: 'Zahav', value: '$3,200' },
      { name: 'Alpen Rose', value: '$2,800' }
    ];
  }
});

const useTopCities = () => useQuery({ 
  queryKey: ['adminTopCities'], 
  queryFn: async () => {
    await new Promise(res => setTimeout(res, 1200));
    return [
      { name: 'New York', value: '$25,800' }, 
      { name: 'Atlanta', value: '$19,100' },
      { name: 'Philadelphia', value: '$15,500' }
    ];
  }
});

const useTopCategories = () => useQuery({ 
  queryKey: ['adminTopCategories'], 
  queryFn: async () => {
    await new Promise(res => setTimeout(res, 600));
    return [
      { name: 'Food & Beverage', value: '1.2k deals' }, 
      { name: 'Entertainment', value: '890 deals' },
      { name: 'Retail', value: '650 deals' }
    ];
  }
});

const dataHooks = {
  merchants: useTopMerchants,
  cities: useTopCities,
  categories: useTopCategories,
};

export const DashboardLeaderboard = ({ title, dataType, ctaLink }: { title: string; dataType: 'merchants' | 'cities' | 'categories'; ctaLink: string }) => {
  const { data, isLoading } = dataHooks[dataType]();

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="font-semibold text-neutral-800">{title}</h3>
      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-neutral-100 rounded-md animate-pulse" />)}
        {data?.map((item: any) => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <p className="font-medium text-neutral-700">{item.name}</p>
            <p className="font-semibold text-neutral-900">{item.value}</p>
          </div>
        ))}
      </div>
      <Link to={ctaLink} className="text-sm font-semibold text-brand-primary-600 mt-6 block hover:underline">
        View All
      </Link>
    </div>
  );
};

export default DashboardLeaderboard;