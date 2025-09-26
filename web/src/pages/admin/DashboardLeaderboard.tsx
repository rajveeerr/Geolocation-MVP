// web/src/pages/admin/DashboardLeaderboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// MOCK API HOOKS
const useTopMerchants = () => useQuery({ queryKey: ['topMerchants'], queryFn: async () => [{ name: 'The Corner Bistro', value: '$4,500' }, { name: 'Zahav', value: '$3,200' }] });
const useTopCities = () => useQuery({ queryKey: ['topCities'], queryFn: async () => [{ name: 'New York', value: '$25,800' }, { name: 'Atlanta', value: '$19,100' }] });
const useTopCategories = () => useQuery({ queryKey: ['topCategories'], queryFn: async () => [{ name: 'Food & Beverage', value: '1.2k deals' }, { name: 'Entertainment', value: '890 deals' }] });

const dataHooks = {
    merchants: useTopMerchants,
    cities: useTopCities,
    categories: useTopCategories,
};

export const DashboardLeaderboard = ({ title, dataType }: { title: string, dataType: 'merchants' | 'cities' | 'categories' }) => {
    const { data, isLoading } = dataHooks[dataType]();

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-neutral-800">{title}</h3>
            <div className="mt-4 space-y-3">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-neutral-100 rounded-md animate-pulse" />)}
                {data?.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <p className="font-medium text-neutral-700">{item.name}</p>
                        <p className="font-semibold text-neutral-900">{item.value}</p>
                    </div>
                ))}
            </div>
            <Link to="#" className="text-sm font-semibold text-brand-primary-600 mt-4 block">View All</Link>
        </div>
    );
};