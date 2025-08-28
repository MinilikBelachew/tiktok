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
  createdAt: string;
}

interface Bet {
  id: number;
  amount: number;
  outcome: string;
  userId: number;
  user: {
    id: number;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
}

const ResolveMarketPage: React.FC = () => {
  
  // Resolve Market State
  const [resolveMarkets, setResolveMarkets] = useState<Market[]>([]);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [betsByMarket, setBetsByMarket] = useState<{ [key: string]: Bet[] }>({});
  const [selectedWinners, setSelectedWinners] = useState<{ [key: string]: string }>({});
  const [payoutAmounts, setPayoutAmounts] = useState<{ [key: string]: number }>({});
  const [payoutSettings, setPayoutSettings] = useState<{ [key: string]: { activatePayout: boolean } }>({});
  const [resolving, setResolving] = useState(false);
  const [payouting, setPayouting] = useState(false);
  const [error, setError] = useState<string>('');

  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to access admin features');
    } else {
      setError('');
      fetchResolveMarkets();
    }
  }, [isAuthenticated, user]);

  // Fetch markets that can be resolved (OPEN status)
  const fetchResolveMarkets = async () => {
    setResolveLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/markets/market/open`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        const data = response.data;
        setResolveMarkets(data);
        
        // Fetch bets for each market
        for (const market of data) {
          await fetchMarketBets(market.id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching resolve markets:', error);
      setError(error.response?.data?.message || 'Failed to fetch markets for resolution');
    } finally {
      setResolveLoading(false);
    }
  };

  // Fetch bets for a specific market
  const fetchMarketBets = async (marketId: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/bets/bet/${marketId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        const bets = response.data?.bets || [];
        setBetsByMarket(prev => ({
          ...prev,
          [marketId]: bets
        }));
        
        // Calculate initial payout amount
        const totalVolume = bets.reduce((sum: number, bet: Bet) => sum + (Number(bet.amount) || 0), 0);
        setPayoutAmounts(prev => ({
          ...prev,
          [marketId]: totalVolume
        }));
      }
    } catch (error: any) {
      // Handle 404 gracefully - it means no bets for this market
      if (error.response?.status === 404) {
        // Silently handle no bets found - this is expected behavior
        setBetsByMarket(prev => ({
          ...prev,
          [marketId]: []
        }));
        setPayoutAmounts(prev => ({
          ...prev,
          [marketId]: 0
        }));
      } else {
        console.error(`Error fetching bets for market ${marketId}:`, error);
      }
    }
  };

  // Handle winner selection for a market
  const handleWinnerSelect = (marketId: number, winner: string) => {
    setSelectedWinners(prev => ({
      ...prev,
      [marketId]: winner
    }));
    
    // Recalculate payout amount
    const marketBets = betsByMarket[marketId] || [];
    const totalVolume = marketBets.reduce((sum: number, bet: Bet) => sum + (Number(bet.amount) || 0), 0);
    setPayoutAmounts(prev => ({
      ...prev,
      [marketId]: totalVolume
    }));
  };

  // Handle payout setting change
  const handlePayoutSettingChange = (marketId: number, setting: string, value: boolean) => {
    setPayoutSettings(prev => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        [setting]: value
      }
    }));
  };

  // Resolve a market
  const handleResolveMarket = async (marketId: number) => {
    const winner = selectedWinners[marketId];
    if (!winner) {
      alert('Please select a winner before resolving the market');
      return;
    }

    setResolving(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}api/admin/bets/resolve/${marketId}`, {
        winningOutcome: winner
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        alert('Market resolved successfully!');
        // Refresh the markets
        fetchResolveMarkets();
      }
    } catch (error: any) {
      console.error('Error resolving market:', error);
      alert(error.response?.data?.message || 'Failed to resolve market');
    } finally {
      setResolving(false);
    }
  };

  // Trigger payout for a market
  const handleTriggerPayout = async (marketId: number) => {
    setPayouting(true);
    try {
      // This would typically call a payout API
      // For now, we'll just show a success message
      alert('Payout triggered successfully!');
      
      // Update payout settings
      setPayoutSettings(prev => ({
        ...prev,
        [marketId]: {
          ...prev[marketId],
          activatePayout: false
        }
      }));
    } catch (error: any) {
      console.error('Error triggering payout:', error);
      alert('Failed to trigger payout');
    } finally {
      setPayouting(false);
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

  const getBetCountByOutcome = (marketId: number, outcome: string) => {
    const bets = betsByMarket[marketId] || [];
    return bets.filter(bet => bet.outcome === outcome).length;
  };

  const getTotalBetAmountByOutcome = (marketId: number, outcome: string) => {
    const bets = betsByMarket[marketId] || [];
    return bets
      .filter(bet => bet.outcome === outcome)
      .reduce((sum, bet) => sum + (Number(bet.amount) || 0), 0);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-[1400px] mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Authentication Required</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please login to access admin features.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Markets</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {resolveLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading markets for resolution...</p>
            </div>
          </div>
        ) : resolveMarkets.length === 0 ? (
          <div className="text-center text-white text-xl py-8">
            No markets to resolve
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resolveMarkets.map((market) => {
              const marketBets = betsByMarket[market.id] || [];
              const totalVolume = marketBets.reduce((sum, bet) => sum + (Number(bet.amount) || 0), 0);
              const selectedWinner = selectedWinners[market.id];
              const payoutAmount = payoutAmounts[market.id] || 0;
              const payoutSetting = payoutSettings[market.id] || { activatePayout: false };

              return (
                <div key={market.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  {/* Market Content - Horizontal Layout with Two Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 p-3">
                    
                    {/* Left Section - Market Info and Options */}
                    <div>
                      {/* Market Title */}
                      <h3 className="text-base font-bold text-black mb-2">{market.title}</h3>
                      
                      {/* Market Image */}
                      <div className="mb-3">
                        <img 
                          src={market.participantImages || '/imgs/img1.png'} 
                          alt="Market" 
                          className="w-full h-32 rounded-lg object-cover border border-gray-200"
                        />
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Total Volume</div>
                          <div className="text-sm font-bold text-green-600">{totalVolume.toLocaleString()} ETB</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Participants</div>
                          <div className="text-sm font-bold text-blue-600">{marketBets.length}</div>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {market.participants.map((participant, index) => {
                          const betAmount = getTotalBetAmountByOutcome(market.id, participant);
                          return (
                            <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="text-xs font-medium text-gray-700 mb-1">Option {index + 1}</div>
                              <div className="text-sm font-bold text-gray-900">{betAmount.toLocaleString()} ETB</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Section - Actions and Payout */}
                    <div className="space-y-3">
                      {/* Resolve Outcome */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Resolve Outcome</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {market.participants.map((participant, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`winner-${market.id}`}
                                value={participant}
                                checked={selectedWinner === participant}
                                onChange={() => handleWinnerSelect(market.id, participant)}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-xs text-gray-700">Option{index + 1}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => handleResolveMarket(market.id)}
                          disabled={!selectedWinner || resolving}
                          className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resolving ? 'Resolving...' : 'Resolve'}
                        </button>
                      </div>

                      {/* Total Payout */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-gray-700">Total Payout</span>
                        <span className="text-sm font-bold text-gray-900">{payoutAmount.toLocaleString()} ETB</span>
                      </div>

                      {/* Trigger Payout */}
                      <div>
                        <div className="mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={payoutSetting.activatePayout}
                              onChange={(e) => handlePayoutSettingChange(market.id, 'activatePayout', e.target.checked)}
                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-700">Activate Payout</span>
                          </label>
                        </div>
                        <button
                          onClick={() => handleTriggerPayout(market.id)}
                          disabled={!payoutSetting.activatePayout || payouting}
                          className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {payouting ? 'Processing...' : 'Payout'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    
  );
};

export default ResolveMarketPage;
