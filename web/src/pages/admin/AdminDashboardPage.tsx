// web/src/pages/admin/AdminDashboardPage.tsx
import { useState } from 'react';
// ...existing code...
import { cn } from '@/lib/utils';
// ...existing code...


import { MerchantApprovalDashboard } from './MerchantApprovalDashboard';
import { CityManagementDashboard } from './CityManagementDashboard';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'merchants' | 'cities'>('merchants');

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
      <p className="text-neutral-600 mt-1">Platform management and oversight.</p>
      
      <div className="border-b mt-6">
        <button
          onClick={() => setActiveTab('merchants')}
          className={cn("px-4 py-2 font-semibold border-b-2", activeTab === 'merchants' ? "border-brand-primary-500 text-brand-primary-600" : "border-transparent text-neutral-500 hover:border-neutral-300")}
        >Merchant Approvals</button>
        <button
          onClick={() => setActiveTab('cities')}
          className={cn("px-4 py-2 font-semibold border-b-2", activeTab === 'cities' ? "border-brand-primary-500 text-brand-primary-600" : "border-transparent text-neutral-500 hover:border-neutral-300")}
        >City Management</button>
      </div>

      <div className="mt-6">
        {activeTab === 'merchants' && <MerchantApprovalDashboard />}
        {activeTab === 'cities' && <CityManagementDashboard />}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
