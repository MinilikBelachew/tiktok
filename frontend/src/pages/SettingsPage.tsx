import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/rootReducer';
import Spinner from '../components/ui/Spinner';
import { getprofileRequest, updateProfleRequest } from '../store/slice/profile';

interface ProfileUser { email?: string; phone?: string; username?: string; bio?: string; avatarUrl?: string; createdAt?: string; }

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.profile);
  const authUser = useSelector((state: RootState) => state.auth.user as any | null);
  
  console.log('SettingsPage - Current state:', { user, authUser, loading, error });
  
  const [avatarUrl, setAvatarUrl] = useState<string>('imgs/img1.png');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [updateRequested, setUpdateRequested] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    dispatch(getprofileRequest());
  }, [dispatch]);

  useEffect(() => {
    const source = (user || authUser) as ProfileUser | null;
    console.log('SettingsPage - User data source:', { user, authUser, source });
    if (source) {
      console.log('SettingsPage - Setting form data from source:', source);
      setEmail(source.email || '');
      setPhone(source.phone || '');
      setUsername(source.username || '');
      setBio(source.bio || '');
      if (source.avatarUrl) setAvatarUrl(source.avatarUrl);
    } else {
      console.log('SettingsPage - No user data available');
    }
  }, [user, authUser]);

  // Watch for update results to trigger notifications
  useEffect(() => {
    if (!updateRequested) return;
    if (!loading && !error) {
      setShowSuccess(true);
      setErrorMessage(null);
      setUpdateRequested(false);
    } else if (!loading && error) {
      setErrorMessage(String(error));
      setShowSuccess(false);
      setUpdateRequested(false);
    }
  }, [loading, error, updateRequested]);

  // Auto-hide success message
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  // Auto-hide error message
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  const handleSave = () => {
    setShowSuccess(false);
    setErrorMessage(null);
    setUpdateRequested(true);
    dispatch(updateProfleRequest({ email, phone, bio, username, avatarFile }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setAvatarUrl(nextUrl);
    setAvatarFile(file);
  };

  // Debug logging for username
  console.log('SettingsPage - Username state value:', username);
  console.log('SettingsPage - User from profile:', user);
  console.log('SettingsPage - Auth user:', authUser);

  return (
    <Layout showHeaderNavigation={false}>
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 p-4 sm:p-6 md:p-8 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-300 mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <label htmlFor="avatar-input" className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 cursor-pointer group">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:opacity-90" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/96x96/E2E8F0/000000?text=Profile'; }} />
                <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1e2a4a] underline break-all">{username  || 'User'}</h2>
                <p className="text-gray-500 text-sm sm:text-base">{authUser?.createdAt ? `Joined ${new Date(authUser.createdAt).toLocaleDateString()}` : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base text-gray-700">Notifications</span>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {showSuccess && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">Profile updated successfully!</div>
            </div>
          )}

          {errorMessage && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{errorMessage}</div>
            </div>
          )}

          {/* Form Fields */}
          <div className="max-w-4xl mx-auto space-y-6">

          <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Please enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Please enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Please enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Spinner /> Saving...</span>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
