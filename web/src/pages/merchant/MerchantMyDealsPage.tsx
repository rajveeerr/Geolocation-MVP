// src/pages/merchant/MerchantMyDealsPage.tsx
import { Button } from '@/components/common/Button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { MerchantDealCard } from '@/components/merchant/MerchantDealCard';
import type { Deal } from '@/data/deals';

export const MerchantMyDealsPage = () => {
    const { data: dealsResponse, isLoading } = useQuery({
        queryKey: ['my-deals'],
        queryFn: () => apiGet<Deal[]>('/merchants/my-deals'),
    });

    const deals = dealsResponse?.data || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Deals</h1>
                <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                    <Button size="md" className="rounded-lg">
                        <Plus className="w-4 h-4 mr-2"/>
                        Create Deal
                    </Button>
                </Link>
            </div>

            {isLoading && <p>Loading your deals...</p>}

            {!isLoading && deals.length === 0 ? (
                <div className="text-center border-2 border-dashed border-neutral-200 rounded-lg py-16">
                    <h2 className="text-xl font-bold text-neutral-800">You haven't created any deals yet</h2>
                    <p className="mt-2 text-neutral-500 max-w-md mx-auto">Click the "Create Deal" button above to get started and attract new customers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {deals.map((deal) => (
                        <MerchantDealCard key={deal.id} deal={deal} />
                    ))}
                </div>
            )}
        </div>
    );
};
