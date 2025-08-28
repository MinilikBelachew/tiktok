import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/rootReducer';
import Spinner from '../ui/Spinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  console.log('AdminRoute - Auth state:', { isAuthenticated, userRole: user?.role, loading });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('AdminRoute - Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not admin, redirect to home page
  if (user?.role !== 'ADMIN') {
    console.log(`AdminRoute - User role is ${user?.role}, not ADMIN, redirecting to home`);
    return <Navigate to="/home" replace />;
  }

  // If admin, render the protected content
  console.log('AdminRoute - Admin access granted, rendering content');
  return <>{children}</>;
};

export default AdminRoute;
