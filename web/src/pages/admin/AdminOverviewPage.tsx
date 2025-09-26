// web/src/pages/admin/AdminOverviewPage.tsx
import { StatCard } from '@/components/common/StatCard';
import { DollarSign, Users, Tag, Building } from 'lucide-react';
import { DashboardLeaderboard } from './DashboardLeaderboard';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// MOCK API HOOKS until backend is ready
const useAdminGlobalStats = () => useQuery({ 
    queryKey: ['adminGlobalStats'], 
    queryFn: async () => {
        // MOCK DATA
        await new Promise(res => setTimeout(res, 500));
        return {
            totalRevenue: { value: 0, change: 0 },
            newCustomers: { value: 0, change: 0 },
            activeDeals: { value: 2, change: 1.0 },
            activeMerchants: { value: 45, change: 2.1 },
        };
    }
});

export const AdminOverviewPage = () => {
  const { data: stats, isLoading } = useAdminGlobalStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Platform Overview</h1>
        <p className="text-neutral-600 mt-1">A high-level look at your key business metrics.</p>
      </div>

      {/* --- Key Metric Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats?.totalRevenue.value.toLocaleString()}`} change={stats?.totalRevenue.change} icon={<DollarSign/>} isLoading={isLoading} />
        <StatCard title="New Customers (30d)" value={stats?.newCustomers.value} change={stats?.newCustomers.change} icon={<Users/>} isLoading={isLoading} />
        <StatCard title="Active Deals" value={stats?.activeDeals.value} change={stats?.activeDeals.change} icon={<Tag/>} isLoading={isLoading} />
        <StatCard title="Active Merchants" value={stats?.activeMerchants.value} change={stats?.activeMerchants.change} icon={<Building/>} isLoading={isLoading} />
      </div>

      {/* --- Leaderboards Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardLeaderboard title="Top Performing Merchants" dataType="merchants" />
        <DashboardLeaderboard title="Top Cities by Revenue" dataType="cities" />
        <DashboardLeaderboard title="Top Categories by Deals" dataType="categories" />
      </div>
    </div>
  );
};