import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Enhanced Admin Analytics Types

// Performance Analytics
export interface PerformanceOverview {
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalActiveMerchants: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  merchantRetentionRate: number;
  topPerformingCity: {
    id: number;
    name: string;
    revenue: number;
    transactions: number;
  };
  topPerformingMerchant: {
    id: number;
    name: string;
    revenue: number;
    transactions: number;
  };
  topPerformingCategory: {
    id: number;
    name: string;
    revenue: number;
    transactions: number;
  };
}

export interface PerformanceOverviewResponse {
  period: string;
  overview: PerformanceOverview;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
    merchantGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
    merchants: 'up' | 'down' | 'stable';
  };
}

export interface CityPerformance {
  id: number;
  name: string;
  state: string;
  country: string;
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalActiveMerchants: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  merchantRetentionRate: number;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
    merchantGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
    merchants: 'up' | 'down' | 'stable';
  };
}

export interface PerformanceCitiesResponse {
  period: string;
  cities: CityPerformance[];
  summary: {
    totalCities: number;
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
    totalMerchants: number;
  };
}

export interface WeeklyChartData {
  week: string;
  revenue: number;
  kickbackPaid: number;
  transactions: number;
  customers: number;
  merchants: number;
  checkIns: number;
  dealSaves: number;
  kickbackEvents: number;
}

export interface WeeklyChartResponse {
  period: string;
  data: WeeklyChartData[];
  summary: {
    totalWeeks: number;
    averageWeeklyRevenue: number;
    averageWeeklyTransactions: number;
    averageWeeklyCustomers: number;
    averageWeeklyMerchants: number;
  };
}

export interface SalesByStore {
  merchant: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
  };
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
  };
}

export interface SalesByStoreResponse {
  period: string;
  stores: SalesByStore[];
  summary: {
    totalStores: number;
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
  };
}

export interface TopMerchant {
  merchant: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
  };
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
  };
}

export interface TopMerchantsResponse {
  period: string;
  merchants: TopMerchant[];
  summary: {
    totalMerchants: number;
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
  };
}

export interface TopCity {
  city: {
    id: number;
    name: string;
    state: string;
    country: string;
  };
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalActiveMerchants: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  merchantRetentionRate: number;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
    merchantGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
    merchants: 'up' | 'down' | 'stable';
  };
}

export interface TopCitiesResponse {
  period: string;
  cities: TopCity[];
  summary: {
    totalCities: number;
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
    totalMerchants: number;
  };
}

export interface TopCategory {
  category: {
    id: number;
    name: string;
    icon: string;
  };
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  totalActiveDeals: number;
  totalActiveMerchants: number;
  totalCustomers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  averageTransactionValue: number;
  kickbackRate: number;
  customerRetentionRate: number;
  merchantRetentionRate: number;
  growthMetrics: {
    revenueGrowth: number;
    transactionGrowth: number;
    customerGrowth: number;
    merchantGrowth: number;
  };
  trends: {
    revenue: 'up' | 'down' | 'stable';
    transactions: 'up' | 'down' | 'stable';
    customers: 'up' | 'down' | 'stable';
    merchants: 'up' | 'down' | 'stable';
  };
}

export interface TopCategoriesResponse {
  period: string;
  categories: TopCategory[];
  summary: {
    totalCategories: number;
    totalRevenue: number;
    totalTransactions: number;
    totalCustomers: number;
    totalMerchants: number;
  };
}

// Customer Analytics
export interface CustomerOverview {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customerRetentionRate: number;
  averageCustomerValue: number;
  totalCustomerSpend: number;
  totalCustomerEarnings: number;
  topPerformingCustomer: {
    id: number;
    name: string;
    totalSpent: number;
    totalEarned: number;
    kickbackEvents: number;
  };
}

export interface CustomerOverviewResponse {
  period: string;
  overview: CustomerOverview;
  growthMetrics: {
    customerGrowth: number;
    retentionGrowth: number;
    valueGrowth: number;
  };
  trends: {
    customers: 'up' | 'down' | 'stable';
    retention: 'up' | 'down' | 'stable';
    value: 'up' | 'down' | 'stable';
  };
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city?: {
    id: number;
    name: string;
  };
  createdAt: string;
  lastActiveAt?: string;
  totalSpent: number;
  totalEarned: number;
  kickbackEvents: number;
  checkIns: number;
  savedDeals: number;
  averageTransactionValue: number;
  customerRetentionRate: number;
  status: 'active' | 'inactive';
  growthMetrics: {
    spendGrowth: number;
    earningsGrowth: number;
    activityGrowth: number;
  };
  trends: {
    spend: 'up' | 'down' | 'stable';
    earnings: 'up' | 'down' | 'stable';
    activity: 'up' | 'down' | 'stable';
  };
}

export interface CustomersResponse {
  period: string;
  customers: Customer[];
  summary: {
    totalCustomers: number;
    totalSpent: number;
    totalEarned: number;
    totalKickbackEvents: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerDetail {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city?: {
    id: number;
    name: string;
  };
  createdAt: string;
  lastActiveAt?: string;
  totalSpent: number;
  totalEarned: number;
  kickbackEvents: number;
  checkIns: number;
  savedDeals: number;
  averageTransactionValue: number;
  customerRetentionRate: number;
  status: 'active' | 'inactive';
  growthMetrics: {
    spendGrowth: number;
    earningsGrowth: number;
    activityGrowth: number;
  };
  trends: {
    spend: 'up' | 'down' | 'stable';
    earnings: 'up' | 'down' | 'stable';
    activity: 'up' | 'down' | 'stable';
  };
  recentActivity: {
    date: string;
    type: 'check_in' | 'deal_save' | 'kickback_event';
    description: string;
    merchant?: {
      id: number;
      name: string;
    };
    deal?: {
      id: number;
      title: string;
    };
  }[];
  favoriteCategories: {
    category: {
      id: number;
      name: string;
      icon: string;
    };
    count: number;
  }[];
  favoriteMerchants: {
    merchant: {
      id: number;
      name: string;
    };
    count: number;
  }[];
}

export interface CustomerDetailResponse {
  period: string;
  customer: CustomerDetail;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customerRetentionRate: number;
  averageCustomerValue: number;
  totalCustomerSpend: number;
  totalCustomerEarnings: number;
  topPerformingCustomer: {
    id: number;
    name: string;
    totalSpent: number;
    totalEarned: number;
    kickbackEvents: number;
  };
  growthMetrics: {
    customerGrowth: number;
    retentionGrowth: number;
    valueGrowth: number;
  };
  trends: {
    customers: 'up' | 'down' | 'stable';
    retention: 'up' | 'down' | 'stable';
    value: 'up' | 'down' | 'stable';
  };
  customerSegments: {
    segment: string;
    count: number;
    percentage: number;
  }[];
  customerLifetimeValue: {
    average: number;
    median: number;
    top10Percent: number;
  };
  customerAcquisitionCost: {
    average: number;
    median: number;
    top10Percent: number;
  };
  customerChurnRate: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
}

export interface CustomerAnalyticsResponse {
  period: string;
  analytics: CustomerAnalytics;
}

// Tap-ins Analytics
export interface TapInsOverview {
  totalTapIns: number;
  uniqueUsers: number;
  totalMerchants: number;
  totalCities: number;
  averageTapInsPerUser: number;
  averageTapInsPerMerchant: number;
  averageTapInsPerCity: number;
  topPerformingMerchant: {
    id: number;
    name: string;
    tapIns: number;
  };
  topPerformingCity: {
    id: number;
    name: string;
    tapIns: number;
  };
  topPerformingUser: {
    id: number;
    name: string;
    tapIns: number;
  };
}

export interface TapInsOverviewResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: {
    totalTapIns: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    uniqueUsers: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    averageDistance: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    topMerchant: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
  };
  filters: {
    cityId: number | null;
    merchantId: number | null;
  };
}

export interface TapInsGeographic {
  city: {
    id: number;
    name: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  tapIns: number;
  uniqueUsers: number;
  merchants: number;
  averageTapInsPerUser: number;
  averageTapInsPerMerchant: number;
  growthMetrics: {
    tapInsGrowth: number;
    userGrowth: number;
    merchantGrowth: number;
  };
  trends: {
    tapIns: 'up' | 'down' | 'stable';
    users: 'up' | 'down' | 'stable';
    merchants: 'up' | 'down' | 'stable';
  };
}

export interface TapInsGeographicResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  geographic: {
    cityDistribution: TapInsGeographic[];
    stateDistribution: TapInsGeographic[];
    distanceAnalysis: {
      average: number;
      median: number;
      min: number;
      max: number;
      total: number;
    };
  };
}

// Bounties Analytics
export interface BountiesOverview {
  totalBounties: number;
  totalBountyValue: number;
  totalBountyClaims: number;
  totalBountyWinners: number;
  averageBountyValue: number;
  averageBountyClaims: number;
  averageBountyWinners: number;
  topPerformingBounty: {
    id: number;
    title: string;
    value: number;
    claims: number;
    winners: number;
  };
  topPerformingCity: {
    id: number;
    name: string;
    bounties: number;
    value: number;
  };
  topPerformingUser: {
    id: number;
    name: string;
    bounties: number;
    value: number;
  };
}

export interface BountiesOverviewResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: {
    totalParticipants: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    totalPointsAwarded: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    averagePointsPerUser: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    topPerformerPoints: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
  };
  filters: {
    cityId: number | null;
  };
}

export interface BountiesLeaderboard {
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  totalBounties: number;
  totalBountyValue: number;
  totalBountyClaims: number;
  totalBountyWinners: number;
  averageBountyValue: number;
  averageBountyClaims: number;
  averageBountyWinners: number;
  growthMetrics: {
    bountiesGrowth: number;
    valueGrowth: number;
    claimsGrowth: number;
    winnersGrowth: number;
  };
  trends: {
    bounties: 'up' | 'down' | 'stable';
    value: 'up' | 'down' | 'stable';
    claims: 'up' | 'down' | 'stable';
    winners: 'up' | 'down' | 'stable';
  };
}

export interface BountiesLeaderboardResponse {
  success: boolean;
  period: string;
  leaderboard: {
    rank: number;
    userId: number;
    name: string;
    email: string;
    totalPoints: number;
    periodPoints: number;
    memberSince: string;
  }[];
  filters: {
    cityId: number | null;
  };
}

// Hooks for Enhanced Admin Analytics

export const useAdminPerformanceOverview = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<PerformanceOverviewResponse>({
    queryKey: ['adminPerformanceOverview', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<PerformanceOverviewResponse>(`/admin/performance/overview?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch performance overview');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminPerformanceCities = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'revenue', sortOrder = 'desc' } = options || {};

  return useQuery<PerformanceCitiesResponse>({
    queryKey: ['adminPerformanceCities', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<PerformanceCitiesResponse>(`/admin/performance/cities?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch performance cities');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminWeeklyChart = (options?: {
  period?: string;
  limit?: number;
}) => {
  const { period = 'last_12_weeks', limit = 12 } = options || {};

  return useQuery<WeeklyChartResponse>({
    queryKey: ['adminWeeklyChart', period, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
      });

      const res = await apiGet<WeeklyChartResponse>(`/admin/performance/weekly-chart?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch weekly chart');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminSalesByStore = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'revenue', sortOrder = 'desc' } = options || {};

  return useQuery<SalesByStoreResponse>({
    queryKey: ['adminSalesByStore', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<SalesByStoreResponse>(`/admin/performance/sales-by-store?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch sales by store');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminTopMerchants = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'revenue', sortOrder = 'desc' } = options || {};

  return useQuery<TopMerchantsResponse>({
    queryKey: ['adminTopMerchants', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<TopMerchantsResponse>(`/admin/performance/top-merchants?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch top merchants');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminTopCities = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'revenue', sortOrder = 'desc' } = options || {};

  return useQuery<TopCitiesResponse>({
    queryKey: ['adminTopCities', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<TopCitiesResponse>(`/admin/performance/top-cities?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch top cities');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminTopCategories = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'revenue', sortOrder = 'desc' } = options || {};

  return useQuery<TopCategoriesResponse>({
    queryKey: ['adminTopCategories', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<TopCategoriesResponse>(`/admin/performance/top-categories?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch top categories');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminCustomerOverview = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<CustomerOverviewResponse>({
    queryKey: ['adminCustomerOverview', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<CustomerOverviewResponse>(`/admin/customers/overview?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch customer overview');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminCustomers = (options?: {
  period?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: 'active' | 'inactive';
  cityId?: number;
}) => {
  const {
    period = 'last_30_days',
    page = 1,
    limit = 50,
    sortBy = 'totalSpent',
    sortOrder = 'desc',
    search,
    status,
    cityId,
  } = options || {};

  return useQuery<CustomersResponse>({
    queryKey: ['adminCustomers', period, page, limit, sortBy, sortOrder, search, status, cityId],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (cityId) params.append('cityId', cityId.toString());

      const res = await apiGet<CustomersResponse>(`/admin/customers?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch customers');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminCustomerDetail = (customerId: number, options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<CustomerDetailResponse>({
    queryKey: ['adminCustomerDetail', customerId, period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<CustomerDetailResponse>(`/admin/customers/${customerId}?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch customer detail');
      }
      return res.data;
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminCustomerAnalytics = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<CustomerAnalyticsResponse>({
    queryKey: ['adminCustomerAnalytics', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<CustomerAnalyticsResponse>(`/admin/customers/analytics?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch customer analytics');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminTapInsOverview = (options?: {
  period?: string;
  cityId?: number;
  merchantId?: number;
}) => {
  const { period = 'last_30_days', cityId, merchantId } = options || {};

  return useQuery<TapInsOverviewResponse>({
    queryKey: ['adminTapInsOverview', period, cityId, merchantId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (cityId) params.append('cityId', cityId.toString());
      if (merchantId) params.append('merchantId', merchantId.toString());

      const res = await apiGet<TapInsOverviewResponse>(`/admin/tap-ins/overview?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch tap-ins overview');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminTapInsGeographic = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'tapIns', sortOrder = 'desc' } = options || {};

  return useQuery<TapInsGeographicResponse>({
    queryKey: ['adminTapInsGeographic', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<TapInsGeographicResponse>(`/admin/tap-ins/geographic?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch tap-ins geographic');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminBountiesOverview = (options?: {
  period?: string;
  cityId?: number;
  merchantId?: number;
}) => {
  const { period = 'last_30_days', cityId, merchantId } = options || {};

  return useQuery<BountiesOverviewResponse>({
    queryKey: ['adminBountiesOverview', period, cityId, merchantId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (cityId) params.append('cityId', cityId.toString());
      if (merchantId) params.append('merchantId', merchantId.toString());

      const res = await apiGet<BountiesOverviewResponse>(`/admin/bounties/overview?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch bounties overview');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAdminBountiesLeaderboard = (options?: {
  period?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const { period = 'last_30_days', limit = 50, sortBy = 'totalBountyValue', sortOrder = 'desc' } = options || {};

  return useQuery<BountiesLeaderboardResponse>({
    queryKey: ['adminBountiesLeaderboard', period, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await apiGet<BountiesLeaderboardResponse>(`/admin/bounties/leaderboard?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch bounties leaderboard');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};