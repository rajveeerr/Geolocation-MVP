import React, { useState } from 'react';
import { AdminCustomerStatsCards } from '@/components/admin/AdminCustomerStatsCards';
import { AdminCustomerList } from '@/components/admin/AdminCustomerList';
import { AdminCustomerAnalytics } from '@/components/admin/AdminCustomerAnalytics';
import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminCustomersPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const getCityId = (cityName: string) => {
    const cityMap: { [key: string]: number } = {
      'Atlanta': 1, 'Houston': 2, 'Phoenix': 3, 'Salt Lake City': 4,
      'San Diego': 5, 'Chicago': 6, 'Toronto': 7
    };
    return cityMap[cityName] || undefined;
  };

  const cityId = selectedCity ? getCityId(selectedCity) : undefined;

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'list' as const, label: 'Customer List' },
    { id: 'analytics' as const, label: 'Analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">Customer Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage and analyze your customer base.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white px-3 py-2 shadow-sm">
            <MapPin className="h-4 w-4 text-neutral-400" />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none cursor-pointer">
              <option value="">All Cities</option>
              {['Atlanta', 'Houston', 'Phoenix', 'Salt Lake City', 'San Diego', 'Chicago', 'Toronto'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none cursor-pointer">
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Pill style */}
      <div className="inline-flex rounded-xl bg-neutral-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AdminCustomerStatsCards period={selectedPeriod} cityId={cityId} />
        </div>
      )}

      {activeTab === 'list' && <AdminCustomerList cityId={cityId} />}

      {activeTab === 'analytics' && <AdminCustomerAnalytics period={selectedPeriod} />}
    </div>
  );
};
