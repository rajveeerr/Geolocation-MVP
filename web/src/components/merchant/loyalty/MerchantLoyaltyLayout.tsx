import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

type MerchantLoyaltyLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const TABS = [
  { label: 'Setup', to: PATHS.MERCHANT_LOYALTY_SETUP },
  { label: 'Program', to: PATHS.MERCHANT_LOYALTY_PROGRAM },
  { label: 'Analytics', to: PATHS.MERCHANT_LOYALTY_ANALYTICS },
  { label: 'Customers', to: PATHS.MERCHANT_LOYALTY_CUSTOMERS },
  { label: 'Transactions', to: PATHS.MERCHANT_LOYALTY_TRANSACTIONS },
];

export function MerchantLoyaltyLayout({ title, subtitle, children }: MerchantLoyaltyLayoutProps) {
  const location = useLocation();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}

type MerchantLoyaltyProgramMissingStateProps = {
  title?: string;
  description?: string;
};

export function MerchantLoyaltyProgramMissingState({
  title = 'No loyalty program found',
  description = 'Initialize your loyalty program first to unlock this section.',
}: MerchantLoyaltyProgramMissingStateProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      <Link
        to={PATHS.MERCHANT_LOYALTY_SETUP}
        className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Set Up Program
      </Link>
    </div>
  );
}
