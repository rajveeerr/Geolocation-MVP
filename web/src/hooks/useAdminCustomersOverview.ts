import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCustomerMetrics {
  totalCustomers: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  paidMembers: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  totalSpend: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  averageSpend: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface AdminCustomersOverview {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: AdminCustomerMetrics;
  filters: {
    cityId: number | null;
    state: string | null;
  };
}

interface UseAdminCustomersOverviewParams {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
  state?: string;
}

export const useAdminCustomersOverview = (params: UseAdminCustomersOverviewParams = {}) => {
  const { period = '30d', cityId, state } = params;

  return useQuery<AdminCustomersOverview, Error>({
    queryKey: ['admin-customers-overview', period, cityId, state],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);
      
      if (cityId) searchParams.append('cityId', cityId.toString());
      if (state) searchParams.append('state', state);

      const response = await apiGet<AdminCustomersOverview>(
        `/admin/customers/overview?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin customers overview');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
