// web/src/hooks/useAdminOverviewStats.ts
import { useQuery } from '@tanstack/react-query';

// This is the shape of the data our new dashboard will consume
export interface AdminOverviewStats {
  kpis: {
    totalRevenue: { value: number; change: number };
    newCustomers: { value: number; change: number };
    activeDeals: { value: number; change: number };
    totalMerchants: { value: number; change: number };
  };
  secondaryStats: {
    averageOrderValue: number;
    totalCheckIns: number;
    pendingMerchants: number;
    totalUsers: number;
  };
  topMerchants: { name: string; value: string }[];
  topCities: { name: string; value: string }[];
  topCategories: { name: string; value: string }[];
}

// MOCK API FUNCTION - This will be replaced when backend endpoint is implemented
const fetchAdminOverviewStats = async (): Promise<AdminOverviewStats> => {
  // TODO: Replace with real API call when backend endpoint is implemented
  // const response = await apiGet('/admin/overview/stats');
  // return response.data.stats;
  
  await new Promise(res => setTimeout(res, 800)); // Simulate network delay
  return {
    kpis: {
      totalRevenue: { value: 0, change: 0 },
      newCustomers: { value: 0, change: 0 },
      activeDeals: { value: 0, change: 0 },
      totalMerchants: { value: 2, change: 1 },
    },
    secondaryStats: {
      averageOrderValue: 0,
      totalCheckIns: 1,
      pendingMerchants: 3,
      totalUsers: 8,
    },
    topMerchants: [
        { name: 'The Corner Bistro', value: '$0' }, 
        { name: 'Zahav', value: '$0' },
        { name: 'Alpen Rose', value: '$0' }
    ],
    topCities: [
        { name: 'New York', value: '$0' }, 
        { name: 'Los Angeles', value: '$0' },
        { name: 'Atlanta', value: '$0' },
        { name: 'Chicago', value: '$0' },
        { name: 'Philadelphia', value: '$0' }
    ],
    topCategories: [
        { name: 'Food & Beverage', value: '0 deals' }, 
        { name: 'Entertainment', value: '0 deals' },
        { name: 'Retail', value: '0 deals' }
    ],
  };
};

export const useAdminOverviewStats = () => {
  return useQuery<AdminOverviewStats, Error>({ 
    queryKey: ['adminOverviewStats'], 
    queryFn: fetchAdminOverviewStats,
  });
};
