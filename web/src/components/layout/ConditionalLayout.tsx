// src/components/layout/ConditionalLayout.tsx
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MerchantHeader } from './MerchantHeader';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const location = useLocation();
  const { data: merchantData } = useMerchantStatus();

  // Check if user is on merchant pages
  const isMerchantPage = location.pathname.startsWith('/merchant');

  // Check if user is an approved merchant
  const isApprovedMerchant =
    merchantData?.data?.merchant?.status === 'APPROVED';

  // Show MerchantHeader if:
  // 1. User is on merchant pages AND
  // 2. User is an approved merchant
  const showMerchantHeader = isMerchantPage && isApprovedMerchant;

  return (
    <>
      {showMerchantHeader ? <MerchantHeader /> : <Header />}
      <main className="min-h-screen">{children}</main>
    </>
  );
};
