import React, { useState } from 'react';
import { useAdminCustomersList } from '@/hooks/useAdminCustomersList';
import { Search, Filter, ChevronLeft, ChevronRight, User, Mail, MapPin, DollarSign, Star } from 'lucide-react';
import { SkeletonTable } from '@/components/common/Skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';

interface AdminCustomerListProps {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: number;
  state?: string;
  memberType?: 'all' | 'paid' | 'free';
  sortBy?: 'lastActive' | 'totalSpend' | 'points' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const AdminCustomerList: React.FC<AdminCustomerListProps> = ({
  page: initialPage = 1,
  limit: initialLimit = 50,
  search: initialSearch = '',
  cityId: initialCityId,
  state: initialState,
  memberType: initialMemberType = 'all',
  sortBy: initialSortBy = 'lastActive',
  sortOrder: initialSortOrder = 'desc'
}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [cityId, setCityId] = useState(initialCityId);
  const [state, setState] = useState(initialState);
  const [memberType, setMemberType] = useState(initialMemberType);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const { data, isLoading, error } = useAdminCustomersList({
    page,
    limit,
    search,
    cityId,
    state,
    memberType,
    sortBy,
    sortOrder
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSort = (field: 'lastActive' | 'totalSpend' | 'points' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  if (isLoading) {
    return <SkeletonTable rows={limit} />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-64">
          <span className="text-red-500 text-sm">Failed to load customer data</span>
        </div>
      </div>
    );
  }

  const { customers, pagination } = data;

  const getMemberTypeBadge = (type: 'paid' | 'free') => {
    return type === 'paid' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
        Free
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Customer Management</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {pagination.totalCount.toLocaleString()} total customers
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={memberType}
            onChange={(e) => setMemberType(e.target.value as 'all' | 'paid' | 'free')}
            className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
          >
            <option value="all">All Members</option>
            <option value="paid">Paid Members</option>
            <option value="free">Free Members</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-medium text-neutral-700">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-neutral-700">Location</th>
              <th 
                className="text-left py-3 px-4 font-medium text-neutral-700 cursor-pointer hover:text-brand-primary-600"
                onClick={() => handleSort('totalSpend')}
              >
                <div className="flex items-center gap-1">
                  Total Spend
                  {sortBy === 'totalSpend' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-neutral-700 cursor-pointer hover:text-brand-primary-600"
                onClick={() => handleSort('points')}
              >
                <div className="flex items-center gap-1">
                  Points
                  {sortBy === 'points' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-neutral-700">Type</th>
              <th 
                className="text-left py-3 px-4 font-medium text-neutral-700 cursor-pointer hover:text-brand-primary-600"
                onClick={() => handleSort('lastActive')}
              >
                <div className="flex items-center gap-1">
                  Last Active
                  {sortBy === 'lastActive' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-brand-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{customer.name}</div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin className="h-3 w-3" />
                    {customer.location}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 font-medium text-neutral-900">
                    <DollarSign className="h-4 w-4" />
                    {customer.totalSpend.toFixed(2)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 font-medium text-neutral-900">
                    <Star className="h-4 w-4" />
                    {customer.points.toLocaleString()}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getMemberTypeBadge(customer.memberType)}
                </td>
                <td className="py-4 px-4 text-sm text-neutral-600">
                  {new Date(customer.lastActive).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-neutral-500">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-neutral-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {customers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No customers found</p>
        </div>
      )}
    </div>
  );
};
