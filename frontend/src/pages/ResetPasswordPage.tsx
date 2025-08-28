import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TikTokBanner from '../components/ui/TikTokBanner';
import Spinner from '../components/ui/Spinner';
import axios from 'axios';
import PasswordInput from '../components/ui/PasswordInput';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);
  const apiKey = import.meta.env.VITE_API_URL;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);
    
    if (!newPassword.trim()) {
      setFormError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (!token) {
      setFormError('Reset token is missing or invalid');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${apiKey}api/auth/reset-password`, { token, newPassword }, { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
      setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const msg = getErrorMessage(backendMessage || 'Failed to reset password');
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error message handling
  const getErrorMessage = (error: any) => {
    if (typeof error === 'string') {
      // Handle specific backend error messages
      if (error.toLowerCase().includes('invalid token') || error.toLowerCase().includes('expired token')) {
        return 'Reset link has expired or is invalid. Please request a new password reset.';
      }
      if (error.toLowerCase().includes('token')) {
        return 'Invalid reset token. Please check your email for the correct link.';
      }
      if (error.toLowerCase().includes('password')) {
        return 'Password must be at least 8 characters long.';
      }
      if (error.toLowerCase().includes('user not found')) {
        return 'No account found with this reset token.';
      }
      if (error.toLowerCase().includes('validation')) {
        return 'Please check your input and try again.';
      }
      return error;
    }
    return 'Password reset failed. Please try again.';
  };

  return (
    <Layout showHeaderNavigation={false}>
      <div className="min-h-screen flex flex-col">
        <div className="w-full mb-8">
          <TikTokBanner />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-gray-300">Enter your new password below.</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">New Password</label>
                  <PasswordInput id="newPassword" name="newPassword" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <PasswordInput id="confirmPassword" name="confirmPassword" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
              </div>
              {(formError) && (
                <div className="rounded-sm bg-red-500 text-white px-4 py-2 text-sm">{formError}</div>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-white mb-2">
                  <Spinner />
                  <span>Updating password...</span>
                </div>
              )}
              {message && (
                <div className={`p-3 rounded-lg text-center font-semibold ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {message.text}
                </div>
              )}
              <button type="submit" className="w-full bg-sunrise text-black py-3 px-4 rounded-lg font-bold text-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-sunrise focus:ring-offset-2 focus:ring-offset-dark-blue">Set New Password</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
