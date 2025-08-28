import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TikTokBanner from '../components/ui/TikTokBanner';
import Spinner from '../components/ui/Spinner';
import axios from 'axios';

/**
 * Props for the ForgotPasswordPage component.
 * @param onNavigate - A function to handle navigation between pages.
 */
// interface ForgotPasswordPageProps {
//   onNavigate?: (page: string) => void;
// }

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  // State to hold the email input value
  const [email, setEmail] = useState('');
  
  // State for showing success/error messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (formError || message?.type === 'error') {
      const timer = setTimeout(() => {
        setFormError(null);
        setMessage(null);
      }, 3000); // 3 seconds

      // Cleanup the timer if the component unmounts or the error changes
      return () => clearTimeout(timer);
    }
  }, [formError, message]);
  
  /**
   * Handles changes to the email input field.
   * @param e - The change event from the input element.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Handles the form submission for password reset.
   * In a real application, this would call an API to send a reset email.
   * @param e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);
    
    // Client-side validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}api/auth/request-password-reset`, { email }, { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
      setMessage({
        text: 'If an account with that email exists, a reset link has been sent to your email.',
        type: 'success',
      });
      // Clear the email field after successful request
      setEmail('');
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const msg = getErrorMessage(backendMessage || 'Failed to request password reset');
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error message handling
  const getErrorMessage = (error: any) => {
    if (typeof error === 'string') {
      // Handle specific backend error messages
      if (error.toLowerCase().includes('user not found') || error.toLowerCase().includes('no account')) {
        return 'No account found with this email address.';
      }
      if (error.toLowerCase().includes('email')) {
        return 'Please enter a valid email address.';
      }
      if (error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('too many requests')) {
        return 'Too many reset requests. Please wait a few minutes before trying again.';
      }
      if (error.toLowerCase().includes('validation')) {
        return 'Please check your email format and try again.';
      }
      return error;
    }
    return 'Failed to request password reset. Please try again.';
  };

  return (
    // The prop name has been corrected from `showHeader` to `showHeaderNavigation`
    <Layout showHeaderNavigation={false}>
      <div className="min-h-screen flex flex-col">
     
        {/* Banner Section - Full Width */}
        <div className="w-full mb-8">
          <TikTokBanner />
        </div>

        {/* Form Section - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-300">Enter your email address to receive a password reset link.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {(formError || (message && message.type === 'error')) && (
                <div className="flex items-center gap-2 text-white mb-4 bg-red-500 rounded-sm px-3 py-2 text-sm">
                  {formError || (message && message.text)}
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-white mb-2">
                  <Spinner />
                  <span>Sending reset link...</span>
                </div>
              )}
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-white text-dark-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-transparent"
                    placeholder="Please enter"
                  />
                </div>
              </div>

              {/* Message display */}
              {message && message.type === 'success' && (
                <div className="flex items-center gap-2 text-white mb-4 bg-green-500 rounded-sm px-3 py-2 text-sm">
                  {message.text}
                </div>
              )}

              {/* Reset Password Button */}
              <button
                type="submit"
                className="w-full bg-sunrise text-black py-3 px-4 rounded-lg font-bold text-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-sunrise focus:ring-offset-2 focus:ring-offset-dark-blue"
              >
                Reset Password
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-300">
                Remember your password?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-sunrise hover:text-opacity-80 font-semibold"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
