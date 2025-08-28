import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowUpRight, BarChart, CheckCircle } from 'lucide-react';
import StatCard from '../components/betting/ProfileCard'; // Importing the separate StatCard component
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/rootReducer';
import { getprofileRequest } from '../store/slice/profile';
import Spinner from '../components/ui/Spinner';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user as any | null);
  const { loading } = useSelector((state: RootState) => state.profile);
  const [activeTab, setActiveTab] = useState('positions');

  // Fetch latest profile data when component mounts
  useEffect(() => {
    dispatch(getprofileRequest());
  }, [dispatch]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleDeposit = () => {
    console.log('Deposit clicked');
    // Replace with your actual navigation logic
     navigate('/deposit');
  };

  const handleWithdraw = () => {
    console.log('Withdraw clicked');
    // Replace with your actual navigation logic
     navigate('/withdraw');
  };

  if (loading) {
    return (
      <Layout showHeaderNavigation={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeaderNavigation={false}>
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 p-4 sm:p-6 md:p-8 rounded-lg">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between pb-6 border-b border-gray-400 mb-6">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left w-full lg:w-auto mb-6 lg:mb-0">
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <img
                  src={authUser?.avatarUrl || "imgs/img1.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/144x144/E2E8F0/000000?text=Profile";
                  }}
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1e2a4a] underline break-all">
                  {authUser?.username || 'User'}
                </h1>
                <p className="text-gray-500 mt-1">
                  {authUser?.createdAt ? `Joined ${new Date(authUser.createdAt).toLocaleDateString()}` : 'Joined date unavailable'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 border-2 md:border-4 border-gray-300 rounded-full px-4 py-1 bg-white mb-4">
                <span className="text-base sm:text-lg font-semibold">Balance</span>
                <span className="text-base sm:text-lg font-semibold text-dark">{authUser?.balance ?? 0} ETB</span>
              </div>

              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDeposit}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded font-semibold hover:bg-blue-600 transition-colors"
                >
                  Deposit
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-semibold hover:bg-red-600 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={ArrowUpRight}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              title="Profit/loss"
              value="ETB 21,300"
            />
            <StatCard
              icon={BarChart}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              title="Volume Traded"
              value="ETB 38,300"
            />
            <StatCard
              icon={CheckCircle}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
              title="Markets Traded"
              value="0"
            />
          </div>

          <div>
            <div className="flex space-x-2 sm:space-x-4 pb-4 border-b border-gray-400">
              <button
                onClick={() => handleTabChange('positions')}
                className={`px-3 py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors ${
                  activeTab === 'positions'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-[#1e2a4a]'
                }`}
              >
                Positions
              </button>
              <button
                onClick={() => handleTabChange('activity')}
                className={`px-3 py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-[#1e2a4a]'
                }`}
              >
                Activity
              </button>
            </div>

            <div className="mt-4 bg-white border border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 min-h-[200px]">
              {activeTab === 'positions' ? (
                <div className="text-center text-gray-500">
                  <p>No positions to display</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>No activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
