import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSubTabNavigation } from '../../hooks/useSubTabNavigation';
import { CreateMarketPage, ResolveMarketPage, EditActiveDeactivatePage } from './markets';

type MarketSubTab = 'create-market' | 'resolve-market' | 'edit-active-deactivate';

const AdminMarketsPage: React.FC = () => {
  
  
  // Use custom hook for sub-tab navigation
  const { activeSubTab, handleSubTabChange, renderActiveComponent } = useSubTabNavigation<MarketSubTab>({
    initialTab: 'create-market',
    components: {
      'create-market': <CreateMarketPage />,
      'resolve-market': <ResolveMarketPage />,
      'edit-active-deactivate': <EditActiveDeactivatePage />
    }
  });

  return (
    <AdminLayout 
      activeTab="market" 
      activeSubTab={activeSubTab}
      onSubTabChange={handleSubTabChange}
    >
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Market Management</h1>
        </div> */}

        {/* Render the active sub-tab content using custom hook */}
        {renderActiveComponent()}
      </div>
    </AdminLayout>
  );
};

export default AdminMarketsPage;