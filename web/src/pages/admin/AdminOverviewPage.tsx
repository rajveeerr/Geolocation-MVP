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

  // Comprehensive city data with different performance patterns
  const citySalesData = {
    'Atlanta': [
      { label: 'Mon', value: 280 },
      { label: 'Tue', value: 320 },
      { label: 'Wed', value: 300 },
      { label: 'Thu', value: 350 },
      { label: 'Fri', value: 380 },
      { label: 'Sat', value: 320 },
      { label: 'Sun', value: 250 }
    ],
    'Houston': [
      { label: 'Mon', value: 220 },
      { label: 'Tue', value: 280 },
      { label: 'Wed', value: 320 },
      { label: 'Thu', value: 290 },
      { label: 'Fri', value: 350 },
      { label: 'Sat', value: 400 },
      { label: 'Sun', value: 180 }
    ],
    'Phoenix': [
      { label: 'Mon', value: 180 },
      { label: 'Tue', value: 200 },
      { label: 'Wed', value: 250 },
      { label: 'Thu', value: 280 },
      { label: 'Fri', value: 320 },
      { label: 'Sat', value: 350 },
      { label: 'Sun', value: 220 }
    ],
    'Salt Lake City': [
      { label: 'Mon', value: 150 },
      { label: 'Tue', value: 180 },
      { label: 'Wed', value: 200 },
      { label: 'Thu', value: 220 },
      { label: 'Fri', value: 250 },
      { label: 'Sat', value: 280 },
      { label: 'Sun', value: 160 }
    ],
    'San Diego': [
      { label: 'Mon', value: 320 },
      { label: 'Tue', value: 350 },
      { label: 'Wed', value: 380 },
      { label: 'Thu', value: 400 },
      { label: 'Fri', value: 420 },
      { label: 'Sat', value: 450 },
      { label: 'Sun', value: 300 }
    ],
    'Chicago': [
      { label: 'Mon', value: 200 },
      { label: 'Tue', value: 250 },
      { label: 'Wed', value: 280 },
      { label: 'Thu', value: 300 },
      { label: 'Fri', value: 350 },
      { label: 'Sat', value: 320 },
      { label: 'Sun', value: 180 }
    ],
    'Toronto': [
      { label: 'Mon', value: 400 },
      { label: 'Tue', value: 450 },
      { label: 'Wed', value: 480 },
      { label: 'Thu', value: 500 },
      { label: 'Fri', value: 550 },
      { label: 'Sat', value: 520 },
      { label: 'Sun', value: 380 }
    ]
  };

  const weeklySalesData = citySalesData[selectedCity as keyof typeof citySalesData] || citySalesData.Atlanta;

  const cityPerformanceData = [
    { name: 'Atlanta', value: 840, change: 5.2, isPositive: true },
    { name: 'Houston', value: 653, change: 8.1, isPositive: true },
    { name: 'Phoenix', value: 708, change: 3.2, isPositive: true },
    { name: 'Salt Lake City', value: 800, change: 2.1, isPositive: true },
    { name: 'San Diego', value: 820, change: 1.4, isPositive: false },
    { name: 'Chicago', value: 530, change: 6.2, isPositive: true },
    { name: 'Toronto', value: 980, change: 4.3, isPositive: true }
  ];

  // City-specific store data
  const cityStoreData = {
    'Atlanta': [
      { name: 'Lemon & Sage Mediterranean Kitchen', sales: 177, change: 2.3, isPositive: true },
      { name: 'Garden Grove Café & Bistro', sales: 408, change: 7.4, isPositive: true },
      { name: 'Bella Vista Pizzeria & Pasta', sales: 198, change: 1.2, isPositive: true },
      { name: 'Twilight Tavern & Lounge', sales: 600, change: 5.8, isPositive: true },
      { name: 'The Harvest Moon Bistro', sales: 45, change: 3.1, isPositive: false },
      { name: 'Olive & Thyme Ristorante', sales: 462, change: 8.9, isPositive: true },
      { name: 'The Loft Kitchen & Bar', sales: 189, change: 4.2, isPositive: true }
    ],
    'Houston': [
      { name: 'Texas BBQ House', sales: 320, change: 6.2, isPositive: true },
      { name: 'Houston Heights Bistro', sales: 280, change: 4.1, isPositive: true },
      { name: 'Downtown Sports Bar', sales: 450, change: 8.5, isPositive: true },
      { name: 'River Oaks Café', sales: 190, change: 2.8, isPositive: true },
      { name: 'Midtown Mexican Grill', sales: 380, change: 5.3, isPositive: true },
      { name: 'Galleria Food Court', sales: 220, change: 1.9, isPositive: true }
    ],
    'Phoenix': [
      { name: 'Desert Oasis Restaurant', sales: 250, change: 3.7, isPositive: true },
      { name: 'Phoenix Downtown Bar', sales: 180, change: 2.1, isPositive: true },
      { name: 'Scottsdale Fine Dining', sales: 420, change: 7.2, isPositive: true },
      { name: 'Tempe University Café', sales: 150, change: 1.5, isPositive: true },
      { name: 'Camelback Mountain Grill', sales: 290, change: 4.8, isPositive: true }
    ],
    'Salt Lake City': [
      { name: 'Mountain View Bistro', sales: 180, change: 2.9, isPositive: true },
      { name: 'Downtown SLC Café', sales: 220, change: 3.4, isPositive: true },
      { name: 'Park City Ski Lodge', sales: 350, change: 6.1, isPositive: true },
      { name: 'Temple Square Restaurant', sales: 160, change: 2.2, isPositive: true }
    ],
    'San Diego': [
      { name: 'Pacific Beach Bar & Grill', sales: 480, change: 8.7, isPositive: true },
      { name: 'Gaslamp Quarter Bistro', sales: 520, change: 9.2, isPositive: true },
      { name: 'La Jolla Seafood House', sales: 380, change: 6.8, isPositive: true },
      { name: 'Mission Bay Café', sales: 290, change: 4.5, isPositive: true },
      { name: 'Downtown San Diego Pub', sales: 420, change: 7.1, isPositive: true }
    ],
    'Chicago': [
      { name: 'Chicago Deep Dish Pizza', sales: 350, change: 5.9, isPositive: true },
      { name: 'Magnificent Mile Bistro', sales: 280, change: 4.2, isPositive: true },
      { name: 'Wrigleyville Sports Bar', sales: 320, change: 5.5, isPositive: true },
      { name: 'Loop Business District Café', sales: 200, change: 2.8, isPositive: true }
    ],
    'Toronto': [
      { name: 'CN Tower Restaurant', sales: 650, change: 11.2, isPositive: true },
      { name: 'Distillery District Bistro', sales: 480, change: 8.9, isPositive: true },
      { name: 'Yorkville Fine Dining', sales: 720, change: 12.5, isPositive: true },
      { name: 'Kensington Market Café', sales: 320, change: 5.7, isPositive: true },
      { name: 'Entertainment District Bar', sales: 580, change: 10.1, isPositive: true }
    ]
  };

  const salesByStoreData = cityStoreData[selectedCity as keyof typeof cityStoreData] || cityStoreData.Atlanta;

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
          value="$2,000" 
          icon={<DollarSign />} 
          color="green"
          change={{ value: 4, period: 'vs yesterday' }}
        />
        <StatCard 
          title="Order Volume" 
          value="1,800" 
          icon={<Users />} 
          color="primary"
          change={{ value: 8, period: 'vs yesterday' }}
        />
        <StatCard 
          title="Average Order Value" 
          value="$120" 
          icon={<Tag />} 
          color="red"
          change={{ value: -3, period: 'vs yesterday' }}
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
      <CityPerformanceCards data={cityPerformanceData} />

      {/* --- Sales Performance and Store Analytics --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LineChart 
          data={weeklySalesData} 
          title={selectedCity} 
          height={300}
          color="#2563EB"
        />
        <SalesByStore data={salesByStoreData} />
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
