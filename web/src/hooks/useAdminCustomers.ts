// web/src/hooks/useAdminCustomers.ts
import { useQuery } from '@tanstack/react-query';

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  totalSpend: number;
  isPaidMember: boolean;
  points: number;
  createdAt: string;
  lastActiveAt: string;
}

interface CustomersApiResponse {
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

interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  isPaidMember?: boolean;
}

// MOCK API FUNCTION - This will be replaced when backend endpoint is implemented
const fetchAdminCustomers = async (filters: CustomerFilters): Promise<CustomersApiResponse> => {
  // TODO: Replace with real API call when backend endpoint is implemented
  // const queryParams = new URLSearchParams();
  // if (filters.page) queryParams.append('page', String(filters.page));
  // if (filters.limit) queryParams.append('limit', String(filters.limit));
  // if (filters.search) queryParams.append('search', filters.search);
  // if (filters.city) queryParams.append('city', filters.city);
  // if (filters.state) queryParams.append('state', filters.state);
  // if (filters.isPaidMember !== undefined) queryParams.append('isPaidMember', String(filters.isPaidMember));
  // 
  // const response = await apiGet(`/admin/customers?${queryParams.toString()}`);
  // return response.data;

  // Mock data for now
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  
  const mockCustomers: AdminCustomer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@gmail.com',
      city: 'New York',
      state: 'NY',
      totalSpend: 150.75,
      isPaidMember: true,
      points: 1250,
      createdAt: '2024-01-15T10:30:00Z',
      lastActiveAt: '2024-01-20T14:22:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      city: 'Atlanta',
      state: 'GA',
      totalSpend: 80.20,
      isPaidMember: false,
      points: 650,
      createdAt: '2024-01-10T09:15:00Z',
      lastActiveAt: '2024-01-19T16:45:00Z'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@yahoo.com',
      city: 'Philadelphia',
      state: 'PA',
      totalSpend: 220.50,
      isPaidMember: true,
      points: 2100,
      createdAt: '2024-01-05T14:20:00Z',
      lastActiveAt: '2024-01-21T11:30:00Z'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah@outlook.com',
      city: 'Los Angeles',
      state: 'CA',
      totalSpend: 95.00,
      isPaidMember: false,
      points: 800,
      createdAt: '2024-01-12T16:45:00Z',
      lastActiveAt: '2024-01-18T13:15:00Z'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@gmail.com',
      city: 'Chicago',
      state: 'IL',
      totalSpend: 180.25,
      isPaidMember: true,
      points: 1500,
      createdAt: '2024-01-08T11:30:00Z',
      lastActiveAt: '2024-01-21T09:20:00Z'
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily@gmail.com',
      city: 'Houston',
      state: 'TX',
      totalSpend: 120.50,
      isPaidMember: false,
      points: 950,
      createdAt: '2024-01-14T08:20:00Z',
      lastActiveAt: '2024-01-20T15:30:00Z'
    },
    {
      id: 7,
      name: 'Michael Chen',
      email: 'michael@yahoo.com',
      city: 'Phoenix',
      state: 'AZ',
      totalSpend: 200.75,
      isPaidMember: true,
      points: 1800,
      createdAt: '2024-01-11T12:45:00Z',
      lastActiveAt: '2024-01-21T10:15:00Z'
    },
    {
      id: 8,
      name: 'Lisa Rodriguez',
      email: 'lisa@outlook.com',
      city: 'San Antonio',
      state: 'TX',
      totalSpend: 85.25,
      isPaidMember: false,
      points: 700,
      createdAt: '2024-01-13T14:30:00Z',
      lastActiveAt: '2024-01-19T17:45:00Z'
    },
    {
      id: 9,
      name: 'James Wilson',
      email: 'james@gmail.com',
      city: 'San Diego',
      state: 'CA',
      totalSpend: 160.00,
      isPaidMember: true,
      points: 1400,
      createdAt: '2024-01-09T16:20:00Z',
      lastActiveAt: '2024-01-21T08:30:00Z'
    },
    {
      id: 10,
      name: 'Amanda Taylor',
      email: 'amanda@yahoo.com',
      city: 'Dallas',
      state: 'TX',
      totalSpend: 110.75,
      isPaidMember: false,
      points: 900,
      createdAt: '2024-01-16T11:15:00Z',
      lastActiveAt: '2024-01-20T13:20:00Z'
    }
  ];

  // Apply filters to mock data
  let filteredCustomers = mockCustomers;
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.city.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.city) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  
  if (filters.state) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.state.toLowerCase().includes(filters.state!.toLowerCase())
    );
  }
  
  if (filters.isPaidMember !== undefined) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.isPaidMember === filters.isPaidMember
    );
  }

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return {
    customers: paginatedCustomers,
    pagination: {
      page,
      limit,
      totalCount: filteredCustomers.length,
      totalPages: Math.ceil(filteredCustomers.length / limit),
      hasNext: endIndex < filteredCustomers.length,
      hasPrev: page > 1
    }
  };
};

export const useAdminCustomers = (filters: CustomerFilters = {}) => {
  return useQuery<CustomersApiResponse, Error>({
    queryKey: ['admin-customers', filters],
    queryFn: () => fetchAdminCustomers(filters),
  });
};
