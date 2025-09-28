// web/src/pages/admin/AdminOverviewPage.tsx
import { StatCard } from '@/components/common/StatCard';
import { DollarSign, Users, Tag, Building, Loader2 } from 'lucide-react';
import { DashboardLeaderboard } from './DashboardLeaderboard';
import { useAdminOverviewStats } from '@/hooks/useAdminOverviewStats';
import { PATHS } from '@/routing/paths';

export const AdminOverviewPage = () => {
  const { data: stats, isLoading } = useAdminOverviewStats();

  const formatCurrency = (value?: number) => {
    if (value === undefined) return <Loader2 className="h-6 w-6 animate-spin" />;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value?: number) => {
    if (value === undefined) return <Loader2 className="h-6 w-6 animate-spin" />;
    return value.toLocaleString();
  };

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
          value={formatCurrency(stats?.kpis.totalRevenue.value)} 
          icon={<DollarSign />} 
          color="green"
          change={{ value: stats?.kpis.totalRevenue.change ?? 0, period: '30d' }}
        />
        <StatCard 
          title="New Customers (30d)" 
          value={formatNumber(stats?.kpis.newCustomers.value)} 
          icon={<Users />} 
          color="primary"
          change={{ value: stats?.kpis.newCustomers.change ?? 0, period: '30d' }}
        />
        <StatCard 
          title="Active Deals" 
          value={formatNumber(stats?.kpis.activeDeals.value)} 
          icon={<Tag />} 
          color="amber"
          change={{ value: stats?.kpis.activeDeals.change ?? 0, period: '30d' }}
        />
        <StatCard 
          title="Total Approved Merchants" 
          value={formatNumber(stats?.kpis.totalMerchants.value)} 
          icon={<Building />} 
          color="primary"
          change={{ value: stats?.kpis.totalMerchants.change ?? 0, period: '30d' }}
        />
      </div>

      {/* --- Secondary Stats --- */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Avg. Order Value" value={formatCurrency(stats?.secondaryStats.averageOrderValue)} icon={<DollarSign />} />
          <StatCard title="Total Check-ins" value={formatNumber(stats?.secondaryStats.totalCheckIns)} icon={<Users />} />
          <StatCard title="Pending Merchants" value={formatNumber(stats?.secondaryStats.pendingMerchants)} icon={<Users />} color="amber" />
          <StatCard title="Total Users" value={formatNumber(stats?.secondaryStats.totalUsers)} icon={<Users />} />
       </div>

      {/* --- Leaderboards Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardLeaderboard 
            title="Top Performing Merchants" 
            data={stats?.topMerchants} 
            isLoading={isLoading}
            ctaLink={PATHS.ADMIN_MERCHANTS} 
        />
        <DashboardLeaderboard 
            title="Top Cities by Revenue" 
            data={stats?.topCities}
            isLoading={isLoading}
            ctaLink={PATHS.ADMIN_CITIES} 
        />
        <DashboardLeaderboard 
            title="Top Categories by Deals" 
            data={stats?.topCategories}
            isLoading={isLoading}
            ctaLink="#" 
        />
      </div>
    </div>
  );
};
