import React, { useState } from 'react';
import { AdminCustomerStatsCards } from '@/components/admin/AdminCustomerStatsCards';
import { AdminCustomerList } from '@/components/admin/AdminCustomerList';
import { AdminCustomerAnalytics } from '@/components/admin/AdminCustomerAnalytics';
import { Calendar, MapPin, Filter } from 'lucide-react';

export const AdminCustomersPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  // Convert city name to city ID (you might want to fetch this from an API)
  const getCityId = (cityName: string) => {
    const cityMap: { [key: string]: number } = {
      'Atlanta': 1,
      'Houston': 2,
      'Phoenix': 3,
      'Salt Lake City': 4,
      'San Diego': 5,
      'Chicago': 6,
      'Toronto': 7
    };
    return cityMap[cityName] || undefined;
  };

  const cityId = selectedCity ? getCityId(selectedCity) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Customer Management</h1>
          <p className="text-neutral-600 mt-1">Manage and analyze your customer base.</p>
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
              <option value="">All Cities</option>
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
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as '1d' | '7d' | '30d' | '90d')}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-brand-primary-500 text-brand-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-brand-primary-500 text-brand-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Customer List
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-brand-primary-500 text-brand-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AdminCustomerStatsCards 
            period={selectedPeriod}
            cityId={cityId}
            state={selectedState}
          />
        </div>
      )}

      {activeTab === 'list' && (
        <AdminCustomerList 
          cityId={cityId}
          state={selectedState}
        />
      )}

      {activeTab === 'analytics' && (
        <AdminCustomerAnalytics 
          period={selectedPeriod}
        />
      )}
    </div>
  );
};
