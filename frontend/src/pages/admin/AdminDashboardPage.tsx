import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSubTabNavigation } from '../../hooks/useSubTabNavigation';
import { TotalUsersPage, SettledMarketsPage, ActiveMarketsPage } from './dashboard';

type DashboardSubTab = 'total-users' | 'settled-markets' | 'active-markets';

const AdminDashboardPage: React.FC = () => {
  // Use custom hook for sub-tab navigation
  const { activeSubTab, handleSubTabChange, renderActiveComponent } = useSubTabNavigation<DashboardSubTab>({
    initialTab: 'total-users',
    components: {
      'total-users': <TotalUsersPage />,
      'settled-markets': <SettledMarketsPage />,
      'active-markets': <ActiveMarketsPage />
    }
  });

  return (
    <AdminLayout 
      activeTab="dashboard" 
      activeSubTab={activeSubTab}
      onSubTabChange={handleSubTabChange}
    >
      <div className="space-y-6 ">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div> */}

        {/* Content based on active sub-tab using custom hook */}
        {renderActiveComponent()}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
