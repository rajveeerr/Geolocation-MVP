// web/src/pages/admin/AdminDashboardPage.tsx
import { useLocation } from 'react-router-dom';
import { AdminOverviewPage } from './AdminOverviewPage';
import { AdminMasterDataManager } from '@/components/admin/AdminMasterDataManager';

export const AdminDashboardPage = () => {
  const location = useLocation();
  
  // Determine which content to show based on the current route
  const renderContent = () => {
    if (location.pathname === '/admin/master-data') {
      return <AdminMasterDataManager />;
    }
    
    if (location.pathname === '/admin/analytics') {
      return <AdminOverviewPage />;
    }
    
    // Default fallback
    return <AdminOverviewPage />;
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default AdminDashboardPage;
