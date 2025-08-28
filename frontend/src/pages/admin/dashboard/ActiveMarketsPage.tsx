import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/rootReducer';
import axios from 'axios';

interface Market {
  id: number;
  title: string;
  participants: string[];
  participantImages: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  calendar: string | null;
  createdAt: string;
  updatedAt: string;
  chance: number | null;
  totalVolume: number | null;
}

const ActiveMarketsPage: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated');
    } else {
      fetchActiveMarkets();
    }
  }, [isAuthenticated, user]);

  const fetchActiveMarkets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/markets/market/open`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setMarkets(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching active markets:', error);
      setError(error.response?.data?.message || 'Failed to fetch active markets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // const formatDateTime = (dateString: string | null) => {
  //   if (!dateString) return 'N/A';
  //   return new Date(dateString).toLocaleString();
  // };

  const formatEndTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const endDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (endDate.getTime() - now.getTime()) / 1000;

    if (diffInSeconds < 0) {
      return 'Ended';
    }

    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
             {/* Summary Card - Reduced Height */}
       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
         <div className="flex items-center gap-3">
           <h2 className="text-lg font-bold text-yellow-900">Active Markets</h2>
           {loading ? (
             <div className="flex items-center space-x-2">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
               <span className="text-yellow-600">Loading...</span>
             </div>
           ) : (
             <div className="text-2xl font-bold text-yellow-600">{markets.length.toLocaleString()}</div>
           )}
         </div>
       </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading active markets</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markets List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      ) : markets.length === 0 && !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active markets found</h3>
          <p className="text-gray-500">
            There are no active markets in the system yet.
          </p>
        </div>
      ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {markets.map((market) => (
             <div key={market.id} className="bg-white border border-yellow-300 rounded-lg p-4">
               {/* Three Parts Arranged Horizontally */}
               <div className="flex items-center justify-between">
                 {/* First Part: Title and Rectangular Image */}
                 <div className="flex flex-col items-start space-y-3">
                   {/* Bet Title */}
                   <h3 className="text-lg font-semibold text-black">{market.title}</h3>
                   
                   {/* Single Rectangular Image - Increased Width */}
                   <div className="w-48 h-32 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                     {market.participantImages ? (
                       <img 
                         src={market.participantImages} 
                         alt="Market Image" 
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                       </svg>
                     )}
                   </div>
                 </div>
                 
                 {/* Second Part: Pie Chart with Chance - Centered Vertically */}
                 <div className="flex flex-col items-center justify-center space-y-3">
                   {/* Standard Filled Pie Chart */}
                   <div className="w-24 h-24 relative">
                     <svg className="w-24 h-24" viewBox="0 0 100 100">
                                               {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="#ffb6c1"
                        />
                                               {/* Filled pie slice */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="#87ceeb"
                          stroke="#87ceeb"
                          strokeWidth="0"
                          transform={`rotate(-90 50 50)`}
                          strokeDasharray={`${(market.chance || 0) * 251.2 / 100} 251.2`}
                          strokeDashoffset="0"
                        />
                     </svg>
                                         </div>
                    <span className="text-xs text-gray-600 font-medium">
                      CHANCE {market.chance ? `${market.chance}%` : '0%'}
                    </span>
                 </div>
                 
                 {/* Third Part: Info (Volume, Date, Ends In) - Aligned with Title */}
                 <div className="flex flex-col space-y-3">
                                       {/* Total Volume */}
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">VOLUME</span>
                      <span className="text-sm font-bold text-gray-900">
                        {market.totalVolume ? `${market.totalVolume} ETB` : 'N/A'}
                      </span>
                    </div>
                   
                   {/* Date */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">DATE</span>
                     <span className="text-sm font-bold text-gray-900">
                       {market.createdAt ? formatDate(market.createdAt) : 'N/A'}
                     </span>
                   </div>
                   
                   {/* Ends In Time */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">
                       {market.endTime ? formatEndTime(market.endTime) : 'N/A'}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

export default ActiveMarketsPage;
