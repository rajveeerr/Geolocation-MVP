// web/src/pages/admin/CustomerManagementPage.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import { Loader2, Search, Users, DollarSign, Crown, MapPin } from 'lucide-react';
import { useAdminCustomers } from '@/hooks/useAdminCustomers';
import { StatCard } from '@/components/common/StatCard';

export const CustomerManagementPage = () => {
    const [filters, setFilters] = useState({
        page: 1,
        search: '',
        city: '',
        state: '',
        isPaidMember: undefined as boolean | undefined
    });

    const { data: customersResponse, isLoading } = useAdminCustomers(filters);
    
    const handleSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const customers = customersResponse?.customers || [];
    const pagination = customersResponse?.pagination;

    // Calculate stats from current data
    const stats = {
        totalCustomers: pagination?.totalCount || 0,
        paidMembers: customers.filter(c => c.isPaidMember).length,
        totalSpend: customers.reduce((sum, c) => sum + c.totalSpend, 0),
        averageSpend: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length : 0
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">Customer Management</h1>
                <p className="text-neutral-600 mt-1">Manage and analyze customer data across the platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Customers" 
                    value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.totalCustomers}
                    icon={<Users className="h-6 w-6" />}
                    color="primary"
                />
                <StatCard 
                    title="Paid Members" 
                    value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.paidMembers}
                    icon={<Crown className="h-6 w-6" />}
                    color="amber"
                />
                <StatCard 
                    title="Total Spend" 
                    value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : `$${stats.totalSpend.toFixed(2)}`}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="green"
                />
                <StatCard 
                    title="Avg. Spend" 
                    value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : `$${stats.averageSpend.toFixed(2)}`}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="primary"
                />
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                            placeholder="Search customers by name, email, or city..." 
                            className="pl-10"
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <Input 
                        placeholder="Filter by city"
                        className="sm:w-48"
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                    />
                    <Input 
                        placeholder="Filter by state"
                        className="sm:w-48"
                        value={filters.state}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                    />
                    <select 
                        className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
                        value={filters.isPaidMember === undefined ? '' : filters.isPaidMember.toString()}
                        onChange={(e) => handleFilterChange('isPaidMember', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                        <option value="">All Members</option>
                        <option value="true">Paid Members</option>
                        <option value="false">Free Members</option>
                    </select>
                </div>

                {/* Customer Table */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50">
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Name</th>
                                        <th className="text-left p-3 font-medium">Email</th>
                                        <th className="text-left p-3 font-medium">Location</th>
                                        <th className="text-left p-3 font-medium">Total Spend</th>
                                        <th className="text-left p-3 font-medium">Points</th>
                                        <th className="text-left p-3 font-medium">Member Type</th>
                                        <th className="text-left p-3 font-medium">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(customer => (
                                        <tr key={customer.id} className="border-b hover:bg-neutral-50">
                                            <td className="p-3 font-medium">{customer.name}</td>
                                            <td className="p-3 text-neutral-600">{customer.email}</td>
                                            <td className="p-3 text-neutral-600 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {customer.city}, {customer.state}
                                            </td>
                                            <td className="p-3 font-medium">${customer.totalSpend.toFixed(2)}</td>
                                            <td className="p-3 text-neutral-600">{customer.points.toLocaleString()}</td>
                                            <td className="p-3">
                                                {customer.isPaidMember ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        <Crown className="h-3 w-3" />
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                                                        Free
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-neutral-500 text-xs">
                                                {new Date(customer.lastActiveAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <p className="text-sm text-neutral-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} customers
                                </p>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        disabled={!pagination.hasPrev}
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        disabled={!pagination.hasNext}
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};