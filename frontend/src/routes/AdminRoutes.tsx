import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/rootReducer';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminMarketsPage from '../pages/admin/AdminMarketsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminFinancialPage from '../pages/admin/AdminFinancialPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

const AdminRoutes: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Double-check admin role (backup security)
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboardPage />} />
      <Route path="/markets" element={<AdminMarketsPage />} />
      <Route path="/users" element={<AdminUsersPage />} />
      <Route path="/financial" element={<AdminFinancialPage />} />
      <Route path="/settings" element={<AdminSettingsPage />} />
      <Route path="/profile" element={<AdminProfilePage />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
