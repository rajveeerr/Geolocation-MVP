// web/src/hooks/useAdminCustomers.ts
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

export interface CustomersApiResponse {
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
  filters: {
    search: string | null;
    cityId: number | null;
    state: string | null;
    memberType: string;
    sortBy: string;
    sortOrder: string;
  };
}

interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  isPaidMember?: boolean;
}

// Real API function using backend endpoint
const fetchAdminCustomers = async (filters: CustomerFilters): Promise<CustomersApiResponse> => {
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', String(filters.page));
  if (filters.limit) queryParams.append('limit', String(filters.limit));
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.isPaidMember !== undefined) queryParams.append('isPaidMember', String(filters.isPaidMember));
  
  const response = await apiGet(`/admin/customers?${queryParams.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch customers');
  }

  return response.data;
};

export const useAdminCustomers = (filters: CustomerFilters = {}) => {
  return useQuery<CustomersApiResponse, Error>({
    queryKey: ['admin-customers', filters],
    queryFn: () => fetchAdminCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};