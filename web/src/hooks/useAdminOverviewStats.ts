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

// MOCK API FUNCTION
const fetchAdminOverviewStats = async (): Promise<AdminOverviewStats> => {
  await new Promise(res => setTimeout(res, 800)); // Simulate network delay
  return {
    kpis: {
      totalRevenue: { value: 125430.50, change: 4.2 },
      newCustomers: { value: 832, change: 12.5 },
      activeDeals: { value: 1240, change: -1.8 },
      totalMerchants: { value: 212, change: 2.1 },
    },
    secondaryStats: {
      averageOrderValue: 69.68,
      totalCheckIns: 15832,
      pendingMerchants: 14,
      totalUsers: 9872,
    },
    topMerchants: [
        { name: 'The Corner Bistro', value: '$4,500' }, 
        { name: 'Zahav', value: '$3,200' },
        { name: 'Alpen Rose', value: '$2,800' }
    ],
    topCities: [
        { name: 'New York', value: '$25,800' }, 
        { name: 'Atlanta', value: '$19,100' },
        { name: 'Philadelphia', value: '$15,500' }
    ],
    topCategories: [
        { name: 'Food & Beverage', value: '1.2k deals' }, 
        { name: 'Entertainment', value: '890 deals' },
        { name: 'Retail', value: '650 deals' }
    ],
  };
};

export const useAdminOverviewStats = () => {
  return useQuery<AdminOverviewStats, Error>({ 
    queryKey: ['adminOverviewStats'], 
    queryFn: fetchAdminOverviewStats,
  });
};
