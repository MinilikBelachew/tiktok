import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store/rootReducer';
import Spinner from '../ui/Spinner';

type PublicRouteProps = {
  children: React.ReactElement;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const authState = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  console.log('PublicRoute - Full auth state:', authState);
  console.log('PublicRoute - current path:', location.pathname);
  
  useEffect(() => {
    console.log('PublicRoute - useEffect triggered, auth state changed:', authState);
  }, [authState]);
  
  // Show loading spinner while checking authentication
  if (authState.loading) {
    console.log('PublicRoute - Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated (either by isAuthenticated flag or by having user data)
  const isUserAuthenticated = authState.isAuthenticated || (authState.user !== null);
  
  console.log('PublicRoute - isUserAuthenticated:', isUserAuthenticated);
  
  // If user is on login page and is admin, allow them to stay for role-based redirection
  if (isUserAuthenticated && location.pathname === '/login' && authState.user?.role === 'ADMIN') {
    console.log('PublicRoute - Admin user on login page, allowing role-based redirection');
    return children;
  }
  
  if (isUserAuthenticated) {
    console.log('PublicRoute - User is authenticated, redirecting to /home');
    return <Navigate to="/home" replace />;
  }
  
  console.log('PublicRoute - User is not authenticated, rendering children');
  return children;
};

export default PublicRoute;


