// src/components/layout/MerchantLayout.tsx
import { Outlet } from 'react-router-dom';
import { MerchantHeader } from './MerchantHeader';
import type { ReactNode } from 'react';

export const MerchantLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <MerchantHeader />
      <main className="flex-grow">{children ?? <Outlet />}</main>
      {/* Optionally add a simple merchant footer here */}
    </div>
  );
};
