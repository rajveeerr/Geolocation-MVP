// web/src/pages/admin/AdminOverviewPage.tsx
import { useState } from 'react';
import { Calendar, Filter, MapPin } from 'lucide-react';
import { AdminPerformanceStatsCards } from '@/components/admin/AdminPerformanceStatsCards';
import { AdminCityPerformanceCards } from '@/components/admin/AdminCityPerformanceCards';
import { AdminSalesByStore } from '@/components/admin/AdminSalesByStore';
import { AdminWeeklyChart } from '@/components/admin/AdminWeeklyChart';
import { AdminTopMerchants } from '@/components/admin/AdminTopMerchants';
import { AdminTopCities } from '@/components/admin/AdminTopCities';
import { AdminTopCategories } from '@/components/admin/AdminTopCategories';
import { useAdminCities } from '@/hooks/useAdminCities';

export const AdminOverviewPage = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'checkins' | 'saves' | 'sales'>('checkins');

  // Fetch active cities from the backend
  const { data: citiesData, isLoading: citiesLoading } = useAdminCities({ 
    active: true, 
    limit: 100 // Get all active cities
  });

  const activeCities = citiesData?.cities || [];

  // Convert city name to city ID using the fetched cities data
  const getCityId = (cityName: string) => {
    const city = activeCities.find(c => c.name === cityName);
    return city?.id || undefined;
  };

  const cityId = selectedCity ? getCityId(selectedCity) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
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
              disabled={citiesLoading}
            >
              <option value="">All Cities</option>
              {citiesLoading ? (
                <option value="" disabled>Loading cities...</option>
              ) : (
                activeCities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}, {city.state}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value as '1d' | '7d' | '30d' | '90d')}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value as 'checkins' | 'saves' | 'sales')}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="checkins">Check-ins</option>
              <option value="saves">Saves</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Key Metric Stat Cards --- */}
      <AdminPerformanceStatsCards 
        period={selectedTimeRange}
        cityId={cityId}
      />

      {/* --- City Performance Section --- */}
      <AdminCityPerformanceCards period={selectedTimeRange} />

      {/* --- Sales Performance and Store Analytics --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminWeeklyChart 
          cityId={cityId}
          metric={selectedMetric}
          title={selectedCity ? `${selectedCity} - Weekly ${selectedMetric}` : `Weekly ${selectedMetric}`}
        />
        <AdminSalesByStore 
          cityId={cityId}
          period={selectedTimeRange}
        />
      </div>

      {/* --- Leaderboards Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdminTopMerchants 
          period={selectedTimeRange}
        />
        <AdminTopCities 
          period={selectedTimeRange}
        />
        <AdminTopCategories 
          period={selectedTimeRange}
          cityId={cityId}
        />
      </div>
    </div>
  );
};
