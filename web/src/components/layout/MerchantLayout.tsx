// src/components/layout/MerchantLayout.tsx
import { Outlet } from 'react-router-dom';
import { MerchantHeader } from './MerchantHeader'; // <-- THE FIX

export const MerchantLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <MerchantHeader /> {/* <-- THE FIX */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Optionally add a simple merchant footer here */}
    </div>
  );
};
