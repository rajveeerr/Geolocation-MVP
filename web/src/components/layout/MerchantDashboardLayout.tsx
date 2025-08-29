// src/components/layout/MerchantDashboardLayout.tsx
import { Outlet } from 'react-router-dom';

export const MerchantDashboardLayout = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Outlet />
    </div>
  );
};
