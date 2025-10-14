// web/src/hooks/useAdminOverviewStats.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Backend response interface
interface AdminPerformanceOverviewResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: {
    grossSales: { value: number; change: number; trend: 'up' | 'down' };
    orderVolume: { value: number; change: number; trend: 'up' | 'down' };
    averageOrderValue: { value: number; change: number; trend: 'up' | 'down' };
    totalApprovedMerchants: { value: number; change: number; trend: 'up' | 'down' };
  };
  filters: {
    cityId: number | null;
    merchantId: number | null;
  };
}

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

interface UseAdminOverviewStatsParams {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
  merchantId?: number;
}

const fetchAdminOverviewStats = async (params: UseAdminOverviewStatsParams = {}): Promise<AdminOverviewStats> => {
  const { period = '7d', cityId, merchantId } = params;
  
  const searchParams = new URLSearchParams();
  searchParams.append('period', period);
  if (cityId) {
    searchParams.append('cityId', cityId.toString());
  }
  if (merchantId) {
    searchParams.append('merchantId', merchantId.toString());
  }

  const response = await apiGet<AdminPerformanceOverviewResponse>(
    `/admin/performance/overview?${searchParams.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch admin overview stats');
  }

  const data = response.data;

  // Transform backend data to frontend format
  return {
    kpis: {
      totalRevenue: { 
        value: data.metrics.grossSales.value, 
        change: data.metrics.grossSales.change 
      },
      newCustomers: { 
        value: data.metrics.orderVolume.value, // Using order volume as proxy for new customers
        change: data.metrics.orderVolume.change 
      },
      activeDeals: { 
        value: 0, // This would need a separate endpoint
        change: 0 
      },
      totalMerchants: { 
        value: data.metrics.totalApprovedMerchants.value, 
        change: data.metrics.totalApprovedMerchants.change 
      },
    },
    secondaryStats: {
      averageOrderValue: data.metrics.averageOrderValue.value,
      totalCheckIns: data.metrics.orderVolume.value,
      pendingMerchants: 0, // This would need a separate endpoint
      totalUsers: 0, // This would need a separate endpoint
    },
    topMerchants: [], // This would need a separate endpoint
    topCities: [], // This would need a separate endpoint
    topCategories: [], // This would need a separate endpoint
  };
};

export const useAdminOverviewStats = (params: UseAdminOverviewStatsParams = {}) => {
  return useQuery<AdminOverviewStats, Error>({ 
    queryKey: ['adminOverviewStats', params.period, params.cityId, params.merchantId], 
    queryFn: () => fetchAdminOverviewStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
