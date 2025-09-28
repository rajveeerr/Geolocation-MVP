import { Link } from 'react-router-dom';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { PATHS } from '@/routing/paths';
import React from 'react';

export const BusinessCTA = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { data: merchantData } = useMerchantStatus();
  const isMerchant = !!merchantData?.data?.merchant;
  const { isAdmin } = useAdminStatus();
  // If the current user is an admin, never link to the merchant dashboard
  const to = isAdmin ? PATHS.FOR_BUSINESSES : isMerchant ? PATHS.MERCHANT_DASHBOARD : PATHS.FOR_BUSINESSES;
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

export default BusinessCTA;
