import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated, updateUserData, setAuthLoading } from '../../store/slice/auth';
import type { RootState } from '../../store/rootReducer';
import apiClient from '../../utils/axios';

const SessionInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // If we're logging out, don't check authentication
      if (isLoggingOut.current) {
        console.log('SessionInitializer - Logout in progress, skipping auth check');
        return;
      }

      console.log('SessionInitializer - Starting authentication check...');
      
      // Debug: Check what cookies are available
      console.log('SessionInitializer - Available cookies:', document.cookie);
      
      // If we're already authenticated, don't check again
      if (isAuthenticated) {
        console.log('SessionInitializer - Already authenticated, skipping check');
        return;
      }
      
      try {
        dispatch(setAuthLoading(true));
        
        // Check if user is authenticated by calling a protected endpoint
        console.log('SessionInitializer - Calling /api/auth/check...');
        const response = await apiClient.get('api/auth/check');
        
        console.log('SessionInitializer - Response received:', response.status, response.data);
        
        if (response.status === 200) {
          console.log('SessionInitializer - User is authenticated');
          dispatch(setAuthenticated({ isAuthenticated: true }));
          
          // Also update user data if available
          if (response.data.user) {
            console.log('SessionInitializer - Updating user data:', response.data.user);
            dispatch(updateUserData({ user: response.data.user }));
          }
        }
      } catch (error: any) {
        console.log('SessionInitializer - Error during auth check:', error);
        if (error.response) {
          console.log('SessionInitializer - Error response:', error.response.status, error.response.data);
        }
        console.log('SessionInitializer - User is not authenticated or session expired');
        
        // Ensure we're properly logged out
        dispatch(setAuthenticated({ isAuthenticated: false }));
        
        // Clear any remaining cookies or storage
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem('auth');
        sessionStorage.clear();
      } finally {
        console.log('SessionInitializer - Setting auth loading to false');
        dispatch(setAuthLoading(false));
      }
    };

    // Only check auth if we're not loading and not already authenticated
    if (!authLoading && !isAuthenticated) {
      checkAuthStatus();
    }
  }, [dispatch, isAuthenticated, authLoading]);

  // Listen for logout actions to prevent auth checks during logout
  useEffect(() => {
    if (authLoading && !isAuthenticated) {
      isLoggingOut.current = true;
      console.log('SessionInitializer - Logout detected, setting flag');
    } else if (!authLoading && !isAuthenticated) {
      isLoggingOut.current = false;
      console.log('SessionInitializer - Logout complete, clearing flag');
    }
  }, [authLoading, isAuthenticated]);

  return null; // This component doesn't render anything
};

export default SessionInitializer;
