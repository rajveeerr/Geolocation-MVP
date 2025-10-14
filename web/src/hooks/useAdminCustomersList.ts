import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  location: string;
  totalSpend: number;
  points: number;
  memberType: 'paid' | 'free';
  lastActive: string;
  createdAt: string;
}

export interface AdminCustomersList {
  success: boolean;
  customers: AdminCustomer[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseAdminCustomersListParams {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: number;
  state?: string;
  memberType?: 'all' | 'paid' | 'free';
  sortBy?: 'lastActive' | 'totalSpend' | 'points' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const useAdminCustomersList = (params: UseAdminCustomersListParams = {}) => {
  const {
    page = 1,
    limit = 50,
    search,
    cityId,
    state,
    memberType = 'all',
    sortBy = 'lastActive',
    sortOrder = 'desc'
  } = params;

  return useQuery<AdminCustomersList, Error>({
    queryKey: ['admin-customers-list', page, limit, search, cityId, state, memberType, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      searchParams.append('memberType', memberType);
      searchParams.append('sortBy', sortBy);
      searchParams.append('sortOrder', sortOrder);
      
      if (search) searchParams.append('search', search);
      if (cityId) searchParams.append('cityId', cityId.toString());
      if (state) searchParams.append('state', state);

      const response = await apiGet<AdminCustomersList>(
        `/admin/customers?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin customers list');
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};
