import { useState } from 'react';
import { MerchantKPICards } from '@/components/merchant/MerchantKPICards';
import { MerchantAnalyticsTabs } from '@/components/merchant/MerchantAnalyticsTabs';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { ArrowLeft } from 'lucide-react';
import {
  MerchantMetaCard,
  MerchantPageIntro,
  MerchantPageState,
  MerchantSegmentedControl,
} from '@/components/merchant/MerchantAppleUI';

export const MerchantAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time'
  >('all_time');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const { data: merchantData, isLoading: merchantLoading } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const merchantName = merchantData?.data?.merchant?.businessName || 'Your business';

  if (merchantLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary-600" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (merchantStatus === 'PENDING') {
    return (
      <MerchantPageState
        tone="amber"
        title="Analytics unavailable"
        description="Analytics are only available for approved merchants. Your application is currently under review."
        action={
          <Button asChild variant="secondary" className="rounded-xl">
            <Link to={PATHS.MERCHANT_DASHBOARD} className="inline-flex items-center whitespace-nowrap">
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
              Back to dashboard
            </Link>
          </Button>
        }
      />
    );
  }

  if (merchantStatus === 'REJECTED' || merchantStatus === 'SUSPENDED') {
    return (
      <MerchantPageState
        tone="red"
        title="Analytics unavailable"
        description="Analytics are only available for approved merchants. Please contact support for assistance."
        action={
          <Button asChild variant="secondary" className="rounded-xl">
            <Link to={PATHS.MERCHANT_DASHBOARD} className="inline-flex items-center whitespace-nowrap">
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
              Back to dashboard
            </Link>
          </Button>
        }
      />
    );
  }

  if (!merchantStatus) {
    return (
      <MerchantPageState
        title="Join as a merchant"
        description="Start creating deals and access analytics once your merchant profile is active."
        action={
          <Button asChild size="lg" className="rounded-xl">
            <Link to={PATHS.MERCHANT_ONBOARDING}>Become a Merchant</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <MerchantPageIntro
        eyebrow="Analytics"
        title={`${merchantName} performance overview`}
        description="Track sales, engagement, customer movement, and comparison trends in a cleaner Apple-style analytics workspace."
        aside={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MerchantMetaCard label="Merchant status" value={merchantStatus} caption="Live access to analytics is enabled." />
            <MerchantMetaCard label="Workspace" value="Analytics" caption="Responsive views for KPI, trends, and comparison." />
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <MerchantSegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'overview', label: 'Overview' },
            { value: 'analytics', label: 'Detailed analytics' },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="secondary"
            className="rounded-full border-border bg-card px-4 text-sm text-foreground hover:bg-muted"
          >
            <Link to={PATHS.MERCHANT_DASHBOARD} className="inline-flex items-center whitespace-nowrap">
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
              Dashboard
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-foreground px-4 text-sm text-background hover:bg-foreground/85"
          >
            <Link to={PATHS.MERCHANT_DEALS_CREATE}>Create Deal</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[13px] font-semibold text-foreground">Time period</div>
        <div className="overflow-x-auto pb-1">
          <MerchantSegmentedControl
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={[
              { value: 'last_7_days', label: 'Last 7 Days' },
              { value: 'last_30_days', label: 'Last 30 Days' },
              { value: 'this_month', label: 'This Month' },
              { value: 'this_year', label: 'This Year' },
              { value: 'all_time', label: 'All Time' },
            ]}
            className="min-w-max"
          />
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <MerchantKPICards period={selectedPeriod} />
        </div>
      ) : (
        <div className="space-y-6">
          <MerchantAnalyticsTabs period={selectedPeriod} />
        </div>
      )}
    </div>
  );
};
