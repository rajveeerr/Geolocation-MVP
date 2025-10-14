// src/pages/merchant/MerchantAnalyticsPage.tsx
import { useState } from 'react';
import { MerchantKPICards } from '@/components/merchant/MerchantKPICards';
import { MerchantAnalyticsTabs } from '@/components/merchant/MerchantAnalyticsTabs';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export const MerchantAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time'>('all_time');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const { data: merchantData, isLoading: merchantLoading } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  if (merchantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (merchantStatus === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Analytics Unavailable
          </h1>
          <p className="text-neutral-600 mb-6">
            Analytics are only available for approved merchants. Your application is currently under review.
          </p>
          <Button asChild variant="secondary">
            <Link to={PATHS.MERCHANT_DASHBOARD}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (merchantStatus === 'REJECTED' || merchantStatus === 'SUSPENDED') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Analytics Unavailable
          </h1>
          <p className="text-neutral-600 mb-6">
            Analytics are only available for approved merchants. Please contact support for assistance.
          </p>
          <Button asChild variant="secondary">
            <Link to={PATHS.MERCHANT_DASHBOARD}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!merchantStatus) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Join as a Merchant</h1>
          <p className="text-neutral-600 mb-8">
            Start creating deals and access analytics
          </p>
          <Button asChild size="lg">
            <Link to={PATHS.MERCHANT_ONBOARDING}>Become a Merchant</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" asChild>
            <Link to={PATHS.MERCHANT_DASHBOARD}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Analytics Dashboard</h1>
            <p className="text-neutral-600 mt-1">
              Comprehensive insights into your business performance
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <Link to={PATHS.MERCHANT_DEALS_CREATE}>
              Create Deal
            </Link>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'overview'
              ? 'text-brand-primary-600 border-b-2 border-brand-primary-600'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'analytics'
              ? 'text-brand-primary-600 border-b-2 border-brand-primary-600'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          Detailed Analytics
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-neutral-700">Time Period:</p>
        <div className="flex gap-2">
          {[
            { value: 'last_7_days', label: 'Last 7 Days' },
            { value: 'last_30_days', label: 'Last 30 Days' },
            { value: 'this_month', label: 'This Month' },
            { value: 'this_year', label: 'This Year' },
            { value: 'all_time', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === option.value
                  ? 'bg-brand-primary-100 text-brand-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <MerchantKPICards period={selectedPeriod} />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Analytics Tabs */}
          <MerchantAnalyticsTabs period={selectedPeriod} />
        </div>
      )}
    </div>
  );
};
