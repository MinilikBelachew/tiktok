import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminSettingsPage: React.FC = () => {
  return (
    <AdminLayout activeTab="system-setting">
      <div>
        <h2 className="text-2xl font-bold mb-6">System Settings</h2>
        <p className="text-gray-600">System settings interface coming soon...</p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
