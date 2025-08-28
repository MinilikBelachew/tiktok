import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TikTokBanner from '../components/ui/TikTokBanner';
import Spinner from '../components/ui/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, clearError } from '../store/slice/auth';
import type { RootState } from '../store/rootReducer';
import PasswordInput from '../components/ui/PasswordInput';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    acceptTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, user } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error || formError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        setFormError(null);
      }, 3000); // 3 seconds

      // Cleanup the timer if the component unmounts or the error changes
      return () => clearTimeout(timer);
    }
  }, [error, formError, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('LoginPage - User is authenticated, checking role for redirect');
      console.log('User role:', user.role);
      setSuccessMessage('Login successful! Redirecting...');
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        console.log('Redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('Redirecting to user home');
        navigate('/home');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Client-side validation
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!/.+@.+\..+/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setFormError('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    
    const payload = { email: formData.email, password: formData.password };
    dispatch(loginRequest(payload));
  };

  // Enhanced error message handling
  const getErrorMessage = (error: any) => {
    if (typeof error === 'string') {
      // Handle specific backend error messages
      if (error.toLowerCase().includes('invalid credentials') || error.toLowerCase().includes('incorrect')) {
        setFormError('Incorrect email or password. Please try again.');
        return 'Incorrect email or password. Please try again.';
      }
      if (error.toLowerCase().includes('user not found')) {
        setFormError('No account found with this email address.');
        return 'No account found with this email address.';
      }
      if (error.toLowerCase().includes('your account has been suspended. you cannot login at this time contact the administartor.')) {
        setFormError('Your account has been suspended. You cannot login at this time contact the administartor.');
        return 'Your account has been suspended. You cannot login at this time contact the administartor.';
      }
      if (error.toLowerCase().includes('password')) {
        setFormError('Incorrect password. Please try again.');
        return 'Incorrect password. Please try again.';
      }
      if (error.toLowerCase().includes('email')) {
        setFormError('Please enter a valid email address.');
        return 'Please enter a valid email address.';
      }
      return error;
    }
    return 'Login failed. Please try again.';
  };

  return (
    <Layout showHeaderNavigation={false}>
      <div className="min-h-screen flex flex-col">

        {/* Banner Section - Full Width */}
        <div className="w-full mb-8">
          <TikTokBanner />
        </div>

        {/* Form Section - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {(formError || error) && (
              <div className="flex items-center gap-2 text-white mb-4 bg-red-500 rounded-sm px-3 py-2 text-sm">
                {formError || getErrorMessage(error)}
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-white mb-4">
                <Spinner />
                <span>Signing you in...</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 text-white mb-4 bg-green-500 rounded-sm px-3 py-2 text-sm">
                {successMessage}
              </div>
            )}

            

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-sm border-gray-600 bg-white text-dark-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-sunrise hover:text-opacity-80 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Remember Me & Terms */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sunrise focus:ring-sunrise border-gray-300"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  // Changed to be smaller than the form and centered
                  className="rounded-sm w-2/3 bg-sunrise text-black py-3 px-4 font-bold hover:bg-opacity-80 transition-colors"
                >
                  Sign In
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-white">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className=" text-sunrise cursor-pointer hover:text-opacity-80 font-semibold"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
