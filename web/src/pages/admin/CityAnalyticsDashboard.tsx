// web/src/pages/admin/CityAnalyticsDashboard.tsx
import { useState } from 'react';
import {
  MapPin,
  Building2,
  Users,
  CheckCircle,
  BarChart3,
  DollarSign,
  Utensils,
  Activity,
  Target,
  Loader2
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { useAdminCities } from '@/hooks/useAdminCities';
import { useAdminOverviewStats } from '@/hooks/useAdminOverviewStats';

// Simplified category data - using consistent colors
const categoryData = [
  { name: 'Food & Beverage', count: 45, color: 'primary' },
  { name: 'Entertainment', count: 32, color: 'amber' },
  { name: 'Retail', count: 28, color: 'green' },
  { name: 'Services', count: 22, color: 'red' },
  { name: 'Health & Wellness', count: 18, color: 'primary' },
  { name: 'Automotive', count: 15, color: 'amber' }
];

// Simple category card using consistent design
const CategoryCard = ({ category }: { category: any }) => (
  <div className="bg-white p-4 rounded-lg border shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          category.color === 'primary' ? 'bg-brand-primary-100 text-brand-primary-600' :
          category.color === 'amber' ? 'bg-amber-100 text-amber-600' :
          category.color === 'green' ? 'bg-green-100 text-green-600' :
          'bg-red-100 text-red-600'
        }`}>
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-neutral-900">{category.name}</h3>
          <p className="text-sm text-neutral-600">{category.count} merchants</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-neutral-900">{category.count}</div>
      </div>
    </div>
  </div>
);

// Simple customer card using consistent design
const CustomerCard = ({ customer }: { customer: any }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
    <div className="w-10 h-10 rounded-full bg-brand-primary-100 flex items-center justify-center text-brand-primary-600 font-semibold text-sm">
      {customer.avatar}
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-neutral-900">{customer.name}</h4>
      <p className="text-sm text-neutral-600">{customer.checkIns} check-ins</p>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-brand-primary-600">{customer.checkIns}</div>
    </div>
  </div>
);

export const CityAnalyticsDashboard = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'customers'>('overview');
  const [showCitySelector, setShowCitySelector] = useState<boolean>(true);

  // Use real data from existing hooks
  const { data: citiesData, isLoading: citiesLoading } = useAdminCities({ page: 1, limit: 50 });
  const { data: overviewStats, isLoading: statsLoading } = useAdminOverviewStats();

  const cities = citiesData?.cities || [];
  const selectedCityData = cities.find(city => `${city.name}, ${city.state}` === selectedCity);

  // Mock customer data for now
  const mockCustomers = [
    { name: 'Sarah Johnson', checkIns: 23, avatar: 'SJ' },
    { name: 'Mike Chen', checkIns: 19, avatar: 'MC' },
    { name: 'Lisa Rodriguez', checkIns: 17, avatar: 'LR' },
    { name: 'David Kim', checkIns: 15, avatar: 'DK' },
    { name: 'Emma Wilson', checkIns: 14, avatar: 'EW' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">City Analytics</h1>
        <p className="text-neutral-600 mt-1">Comprehensive merchant and activity insights by city</p>
      </div>

      {/* City Header - Show when city is selected */}
      {selectedCity && !showCitySelector && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-primary-100 text-brand-primary-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{selectedCity}</h2>
                <p className="text-sm text-neutral-600">
                  {selectedCityData?.approvedMerchants} approved merchants
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary-600 hover:bg-brand-primary-50 rounded-lg transition-colors"
            >
              <Target className="h-4 w-4" />
              Change City
            </button>
          </div>
        </div>
      )}

      {/* City Selector - Show when no city selected or when expanding */}
      {showCitySelector && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-primary-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Select City</h2>
            </div>
            {selectedCity && (
              <button
                onClick={() => setShowCitySelector(false)}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
            )}
          </div>
          {citiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cities.map((city) => {
                const cityName = `${city.name}, ${city.state}`;
                return (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(cityName);
                      setShowCitySelector(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCity === cityName
                        ? 'border-brand-primary-500 bg-brand-primary-50'
                        : 'border-neutral-200 hover:border-brand-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedCity === cityName 
                          ? 'bg-brand-primary-500 text-white' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{cityName}</h3>
                        <p className="text-sm text-neutral-600">
                          {city.approvedMerchants} approved merchants
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats - Show when city is selected */}
      {selectedCity && selectedCityData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Merchants"
            value={selectedCityData.approvedMerchants}
            icon={<Building2 className="h-5 w-5" />}
            color="primary"
          />
          <StatCard
            title="Active Stores"
            value={selectedCityData.activeStores}
            icon={<Activity className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Total Stores"
            value={selectedCityData.totalStores}
            icon={<Building2 className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Status"
            value={selectedCityData.active ? 'Active' : 'Inactive'}
            icon={<CheckCircle className="h-5 w-5" />}
            color={selectedCityData.active ? 'green' : 'red'}
          />
        </div>
      )}

      {/* Platform Overview Stats */}
      {overviewStats && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${overviewStats.kpis.totalRevenue.value.toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
              change={{ value: overviewStats.kpis.totalRevenue.change, period: '30d' }}
            />
            <StatCard
              title="New Customers"
              value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.kpis.newCustomers.value.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              color="primary"
              change={{ value: overviewStats.kpis.newCustomers.change, period: '30d' }}
            />
            <StatCard
              title="Active Deals"
              value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.kpis.activeDeals.value.toLocaleString()}
              icon={<Activity className="h-5 w-5" />}
              color="amber"
              change={{ value: overviewStats.kpis.activeDeals.change, period: '30d' }}
            />
            <StatCard
              title="Total Merchants"
              value={statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.kpis.totalMerchants.value.toLocaleString()}
              icon={<Building2 className="h-5 w-5" />}
              color="primary"
              change={{ value: overviewStats.kpis.totalMerchants.change, period: '30d' }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      {selectedCity && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
                { id: 'categories', label: 'Categories', icon: <Utensils className="h-4 w-4" /> },
                { id: 'customers', label: 'Top Customers', icon: <Users className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-primary-500 text-brand-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && selectedCityData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">City Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-3">Store Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Total Stores</span>
                          <span className="font-semibold">{selectedCityData.totalStores}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Active Stores</span>
                          <span className="font-semibold">{selectedCityData.activeStores}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Approved Merchants</span>
                          <span className="font-semibold">{selectedCityData.approvedMerchants}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-3">Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">City Status</span>
                          <span className={`font-semibold ${selectedCityData.active ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedCityData.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Location</span>
                          <span className="font-semibold">{selectedCityData.name}, {selectedCityData.state}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Categories</h3>
                <p className="text-neutral-600 mb-6">Most popular merchant categories in {selectedCity}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryData.map((category, index) => (
                    <CategoryCard key={index} category={category} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Customers</h3>
                <p className="text-neutral-600 mb-6">Most active customers in {selectedCity}</p>
                <div className="space-y-3">
                  {mockCustomers.map((customer, index) => (
                    <CustomerCard key={index} customer={customer} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
