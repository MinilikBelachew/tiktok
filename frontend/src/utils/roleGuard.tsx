import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/rootReducer';

export const useRoleGuard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';
  
  const getRedirectPath = () => {
    if (isAdmin) {
      return '/admin/dashboard';
    }
    if (isUser) {
      return '/'; // Home page for regular users
    }
    return '/login'; // Default to login if no role
  };
  
  return {
    isAdmin,
    isUser,
    getRedirectPath,
    hasRole: !!user?.role
  };
};

export const requireAdmin = (Component: React.ComponentType) => {
  return (props: any) => {
    const { isAdmin } = useRoleGuard();
    
    if (!isAdmin) {
      return <div>Access Denied. Admin privileges required.</div>;
    }
    
    return <Component {...props} />;
  };
};
