import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCustomerAnalytics {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  demographics: {
    ageGroups: {
      '18-24': number;
      '25-34': number;
      '35-44': number;
      '45-54': number;
      '55+': number;
    };
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
    topCities: {
      city: string;
      count: number;
      percentage: number;
    }[];
  };
  activityLevels: {
    highActivity: number;
    mediumActivity: number;
    lowActivity: number;
    inactive: number;
  };
  retentionMetrics: {
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
    retentionRate: number;
  };
  spendingPatterns: {
    averageSpendPerCustomer: number;
    topSpendingCustomers: number;
    spendingDistribution: {
      '0-50': number;
      '51-100': number;
      '101-200': number;
      '201-500': number;
      '500+': number;
    };
  };
}

interface UseAdminCustomersAnalyticsParams {
  period?: '1d' | '7d' | '30d' | '90d';
}

export const useAdminCustomersAnalytics = (params: UseAdminCustomersAnalyticsParams = {}) => {
  const { period = '30d' } = params;

  return useQuery<AdminCustomerAnalytics, Error>({
    queryKey: ['admin-customers-analytics', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<AdminCustomerAnalytics>(
        `/admin/customers/analytics?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin customers analytics');
      }

      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
