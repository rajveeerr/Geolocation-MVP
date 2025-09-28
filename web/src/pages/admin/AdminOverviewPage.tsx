// web/src/pages/admin/AdminOverviewPage.tsx
import { StatCard } from '../../components/common/StatCard.tsx';
import { DollarSign, Users, Tag, Building, Loader2 } from 'lucide-react';
import DashboardLeaderboard from './DashboardLeaderboard.tsx';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/routing/paths';

// Mock hook to simulate fetching global platform statistics
const useAdminGlobalStats = () =>
  useQuery({
    queryKey: ['adminGlobalStats'],
    queryFn: async () => {
      await new Promise((res) => setTimeout(res, 500));
      return {
        totalRevenue: { value: 125430.5, change: 4.2 },
        newCustomers: { value: 832, change: 12.5 },
        activeDeals: { value: 1240, change: -1.8 },
        activeMerchants: { value: 212, change: 2.1 },
      };
    },
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
        <StatCard
          title="Total Revenue"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats?.totalRevenue.value.toLocaleString()}`}
          icon={<DollarSign />}
          color="green"
        />
        <StatCard
          title="New Customers (30d)"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.newCustomers.value}
          icon={<Users />}
          color="primary"
        />
        <StatCard
          title="Active Deals"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeDeals.value}
          icon={<Tag />}
          color="amber"
        />
        <StatCard
          title="Active Merchants"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeMerchants.value}
          icon={<Building />}
          color="primary"
        />
      </div>

      {/* --- Leaderboards Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardLeaderboard title="Top Performing Merchants" dataType="merchants" ctaLink={PATHS.ADMIN_MERCHANTS} />
        <DashboardLeaderboard title="Top Cities by Revenue" dataType="cities" ctaLink={PATHS.ADMIN_CITIES} />
        <DashboardLeaderboard title="Top Categories by Deals" dataType="categories" ctaLink="#" />
      </div>
    </div>
  );
};

export default AdminOverviewPage;
