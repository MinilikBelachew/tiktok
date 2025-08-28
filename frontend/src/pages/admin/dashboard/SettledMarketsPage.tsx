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
  totalPayout: number | null;
  totalParticipants: number | null;
  resolvedOutcome?: string | null;
  totalBettors?: number | null;
}

const SettledMarketsPage: React.FC = () => {
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
      fetchSettledMarkets();
    }
  }, [isAuthenticated, user]);

  const fetchSettledMarkets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/markets/market/settled`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setMarkets(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching settled markets:', error);
      setError(error.response?.data?.message || 'Failed to fetch settled markets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatEndTime = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diffInHours = Math.abs((now.getTime() - end.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `ENDED ${Math.round(diffInHours)} Hours AGO`;
    } else {
      return `ENDED ${formatDate(endTime)}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card - Reduced Height */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-green-900">Settled Markets</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-green-600">Loading...</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-green-600">{markets.length.toLocaleString()}</div>
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
              <h3 className="text-sm font-medium text-red-800">Error loading settled markets</h3>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : markets.length === 0 && !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No settled markets found</h3>
          <p className="text-gray-500">
            There are no settled markets in the system yet.
          </p>
        </div>
      ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {markets.map((market) => (
             <div key={market.id} className="bg-white border border-yellow-300 rounded-lg p-4">
               {/* Three Parts Arranged Horizontally */}
               <div className="flex items-start justify-between">
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
                
                                 {/* Second Part: Other Info */}
                 <div className="flex flex-col space-y-3 mt-8">
                   {/* Total Payout */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">TOTAL PAYOUT</span>
                     <span className="text-sm font-bold text-gray-900">
                       {market.totalPayout ? `${market.totalPayout} ETB` : 'N/A'}
                     </span>
                   </div>
                   
                   {/* Total Bettors */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">
                       {market.totalBettors ? market.totalBettors.toLocaleString() : '0'}
                     </span>
                     <span className="text-sm text-gray-600">👥</span>
                   </div>
                   
                   {/* Resolved Outcome */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">RESOLVED</span>
                     <span className="text-sm font-bold text-gray-900">
                       {market.resolvedOutcome || 'N/A'}
                     </span>
                   </div>
                   
                   {/* End Time */}
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span className="text-sm font-medium text-gray-700">
                       {market.endTime ? formatEndTime(market.endTime) : 'N/A'}
                     </span>
                   </div>
                 </div>
                
                                 {/* Third Part: Icon - Centered */}
                 <div className="flex-shrink-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
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

export default SettledMarketsPage;
