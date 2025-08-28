import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminFinancialPage: React.FC = () => {
  return (
    <AdminLayout activeTab="financial">
      <div>
        <h2 className="text-2xl font-bold mb-6">Financial Management</h2>
        <p className="text-gray-600">Financial management interface coming soon...</p>
      </div>
    </AdminLayout>
  );
};

export default AdminFinancialPage;
