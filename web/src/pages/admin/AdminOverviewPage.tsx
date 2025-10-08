// web/src/pages/admin/AdminOverviewPage.tsx
import { StatCard } from '@/components/common/StatCard';
import { DollarSign, Users, Tag, Building, Loader2, Calendar, Filter, MapPin } from 'lucide-react';
import { DashboardLeaderboard } from './DashboardLeaderboard';
import { useAdminOverviewStats } from '@/hooks/useAdminOverviewStats';
import { PATHS } from '@/routing/paths';
import { LineChart } from '@/components/admin/LineChart';
import { CityPerformanceCards } from '@/components/admin/CityPerformanceCards';
import { SalesByStore } from '@/components/admin/SalesByStore';
import { useState } from 'react';

export const AdminOverviewPage = () => {
  const { data: stats, isLoading } = useAdminOverviewStats();
  const [selectedCity, setSelectedCity] = useState('Atlanta');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 7 Days');
  const [selectedOfferType, setSelectedOfferType] = useState('All Offers');


  const formatNumber = (value?: number) => {
    if (value === undefined) return <Loader2 className="h-6 w-6 animate-spin" />;
    return value.toLocaleString();
  };

  // Testing phase data - no sales yet, showing zero or minimal test data
  const getCitySalesData = (city: string, timeRange: string, offerType: string) => {
    // In testing phase, show mostly zeros with occasional test values
    const isTestData = Math.random() > 0.7; // 30% chance of showing test data
    const testMultiplier = isTestData ? (Math.random() * 3 + 1) : 0; // 1-4 if test data, 0 otherwise
    
    return [
      { label: 'Mon', value: Math.round(testMultiplier) },
      { label: 'Tue', value: Math.round(testMultiplier * 0.8) },
      { label: 'Wed', value: Math.round(testMultiplier * 1.2) },
      { label: 'Thu', value: Math.round(testMultiplier * 0.6) },
      { label: 'Fri', value: Math.round(testMultiplier * 1.5) },
      { label: 'Sat', value: Math.round(testMultiplier * 0.9) },
      { label: 'Sun', value: Math.round(testMultiplier * 0.4) }
    ];
  };

  const weeklySalesData = getCitySalesData(selectedCity, selectedTimeRange, selectedOfferType);

  // Testing phase city performance - mostly zeros with occasional test values
  const getCityPerformanceData = (timeRange: string, offerType: string) => {
    return [
      { name: 'Atlanta', value: Math.random() > 0.8 ? Math.round(Math.random() * 5 + 1) : 0, change: 0, isPositive: true },
      { name: 'Houston', value: Math.random() > 0.85 ? Math.round(Math.random() * 4 + 1) : 0, change: 0, isPositive: true },
      { name: 'Phoenix', value: Math.random() > 0.9 ? Math.round(Math.random() * 3 + 1) : 0, change: 0, isPositive: true },
      { name: 'Salt Lake City', value: Math.random() > 0.95 ? Math.round(Math.random() * 2 + 1) : 0, change: 0, isPositive: true },
      { name: 'San Diego', value: Math.random() > 0.75 ? Math.round(Math.random() * 6 + 1) : 0, change: 0, isPositive: true },
      { name: 'Chicago', value: Math.random() > 0.88 ? Math.round(Math.random() * 4 + 1) : 0, change: 0, isPositive: true },
      { name: 'Toronto', value: Math.random() > 0.7 ? Math.round(Math.random() * 7 + 1) : 0, change: 0, isPositive: true }
    ];
  };

  // Testing phase store data - mostly zeros with occasional test values
  const getCityStoreData = (city: string, timeRange: string, offerType: string) => {
    const cityStoreTemplates = {
      'Atlanta': [
        { name: 'Lemon & Sage Mediterranean Kitchen', change: 0, isPositive: true },
        { name: 'Garden Grove Café & Bistro', change: 0, isPositive: true },
        { name: 'Bella Vista Pizzeria & Pasta', change: 0, isPositive: true },
        { name: 'Twilight Tavern & Lounge', change: 0, isPositive: true },
        { name: 'The Harvest Moon Bistro', change: 0, isPositive: false },
        { name: 'Olive & Thyme Ristorante', change: 0, isPositive: true },
        { name: 'The Loft Kitchen & Bar', change: 0, isPositive: true }
      ],
      'Houston': [
        { name: 'Texas BBQ House', change: 0, isPositive: true },
        { name: 'Houston Heights Bistro', change: 0, isPositive: true },
        { name: 'Downtown Sports Bar', change: 0, isPositive: true },
        { name: 'River Oaks Café', change: 0, isPositive: true },
        { name: 'Midtown Mexican Grill', change: 0, isPositive: true },
        { name: 'Galleria Food Court', change: 0, isPositive: true }
      ],
      'Phoenix': [
        { name: 'Desert Oasis Restaurant', change: 0, isPositive: true },
        { name: 'Phoenix Downtown Bar', change: 0, isPositive: true },
        { name: 'Scottsdale Fine Dining', change: 0, isPositive: true },
        { name: 'Tempe University Café', change: 0, isPositive: true },
        { name: 'Camelback Mountain Grill', change: 0, isPositive: true }
      ],
      'Salt Lake City': [
        { name: 'Mountain View Bistro', change: 0, isPositive: true },
        { name: 'Downtown SLC Café', change: 0, isPositive: true },
        { name: 'Park City Ski Lodge', change: 0, isPositive: true },
        { name: 'Temple Square Restaurant', change: 0, isPositive: true }
      ],
      'San Diego': [
        { name: 'Pacific Beach Bar & Grill', change: 0, isPositive: true },
        { name: 'Gaslamp Quarter Bistro', change: 0, isPositive: true },
        { name: 'La Jolla Seafood House', change: 0, isPositive: true },
        { name: 'Mission Bay Café', change: 0, isPositive: true },
        { name: 'Downtown San Diego Pub', change: 0, isPositive: true }
      ],
      'Chicago': [
        { name: 'Chicago Deep Dish Pizza', change: 0, isPositive: true },
        { name: 'Magnificent Mile Bistro', change: 0, isPositive: true },
        { name: 'Wrigleyville Sports Bar', change: 0, isPositive: true },
        { name: 'Loop Business District Café', change: 0, isPositive: true }
      ],
      'Toronto': [
        { name: 'CN Tower Restaurant', change: 0, isPositive: true },
        { name: 'Distillery District Bistro', change: 0, isPositive: true },
        { name: 'Yorkville Fine Dining', change: 0, isPositive: true },
        { name: 'Kensington Market Café', change: 0, isPositive: true },
        { name: 'Entertainment District Bar', change: 0, isPositive: true }
      ]
    };
    
    const template = cityStoreTemplates[city as keyof typeof cityStoreTemplates] || cityStoreTemplates.Atlanta;
    
    return template.map(store => ({
      ...store,
      sales: Math.random() > 0.9 ? Math.round(Math.random() * 3 + 1) : 0 // 10% chance of test data
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Performance</h1>
          <p className="text-neutral-600 mt-1">A comprehensive view of your platform's performance metrics.</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <MapPin className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="Atlanta">Atlanta</option>
              <option value="Houston">Houston</option>
              <option value="Phoenix">Phoenix</option>
              <option value="Salt Lake City">Salt Lake City</option>
              <option value="San Diego">San Diego</option>
              <option value="Chicago">Chicago</option>
              <option value="Toronto">Toronto</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedOfferType} 
              onChange={(e) => setSelectedOfferType(e.target.value)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="All Offers">All Offers</option>
              <option value="Active Offers">Active Offers</option>
              <option value="Expired Offers">Expired Offers</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Building className="h-4 w-4 text-neutral-500" />
            <select className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none">
              <option>All store and brand</option>
              <option>Restaurants</option>
              <option>Bars & Lounges</option>
              <option>Cafes</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Key Metric Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Gross sales" 
          value="$0"
          icon={<DollarSign />} 
          color="green"
          change={{ value: 0, period: 'vs yesterday' }}
        />
        <StatCard 
          title="Order Volume" 
          value="0"
          icon={<Users />} 
          color="primary"
          change={{ value: 0, period: 'vs yesterday' }}
        />
        <StatCard 
          title="Average Order Value" 
          value="$0"
          icon={<Tag />} 
          color="red"
          change={{ value: 0, period: 'vs yesterday' }}
        />
        <StatCard 
          title="Total Approved Merchants" 
          value={formatNumber(stats?.kpis.totalMerchants.value)} 
          icon={<Building />} 
          color="primary"
          change={{ value: stats?.kpis.totalMerchants.change ?? 0, period: '30d' }}
        />
      </div>

      {/* --- City Performance Section --- */}
      <CityPerformanceCards data={getCityPerformanceData(selectedTimeRange, selectedOfferType)} />

      {/* --- Sales Performance and Store Analytics --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LineChart 
          data={weeklySalesData} 
          title={selectedCity} 
          height={300}
          color="#2563EB"
        />
        <SalesByStore data={getCityStoreData(selectedCity, selectedTimeRange, selectedOfferType)} />
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
