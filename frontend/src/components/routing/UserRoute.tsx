
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/rootReducer';
import Spinner from '../ui/Spinner';

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  console.log('UserRoute - Auth state:', { isAuthenticated, userRole: user?.role, loading });

  // Show loading spinner while checking authentication or during logout
  if (loading) {
    console.log('UserRoute - Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 text-sm">
            {isAuthenticated ? 'Logging out...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('UserRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated as admin, redirect to admin dashboard
  if (user?.role === 'ADMIN') {
    console.log(`UserRoute - User role is ${user?.role}, redirecting to admin dashboard`);
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If regular user, render the protected content
  console.log('UserRoute - User access granted, rendering content');
  return <>{children}</>;
};

export default UserRoute;
