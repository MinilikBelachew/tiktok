// import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  activeSubTab, 
  onSubTabChange 
}) => {
  return (
    <div className="min-h-screen bg-gray-200 ">
      
      {/* Header */}
      <AdminHeader />
      
      {/* Navigation */}
      <AdminSidebar 
        activeTab={activeTab} 
        activeSubTab={activeSubTab}
        onSubTabChange={onSubTabChange}
      />
      
      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="bg-gray-200 rounded-lg  p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
