import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import BettingCard from '../components/betting/BettingCard';
import NavigationTabs from '../components/ui/NavigationTabs';
import TikTokBanner from '../components/ui/TikTokBanner';

const RecentlySettledPage: React.FC = () => {
  const activeTab = 'recently-settled';
  const [settledMarkets, setSettledMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch settled markets from backend
  useEffect(() => {
    const fetchSettledMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/markets/market/settled`);
        
        // Sort by most recent first (by createdAt date)
        const sortedMarkets = response.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setSettledMarkets(sortedMarkets);
      } catch (err: any) {
        console.error('Error fetching settled markets:', err);
        setError(err?.response?.data?.message || 'Failed to fetch settled markets');
      } finally {
        setLoading(false);
      }
    };


    fetchSettledMarkets();
  }, []);

  const handleBet = (participantId: string) => {
    console.log('Bet placed on:', participantId);
    // TODO: Implement betting logic
  };

  const handleNavigate = (marketId: string) => {
    // Navigate to market card page
    window.location.href = `/market-card/${marketId}`;
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(settledMarkets.length / pageSize));
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return settledMarkets.slice(start, start + pageSize);
  }, [currentPage, settledMarkets]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [settledMarkets]);

  if (loading) {
    return (
      <Layout showHeaderNavigation={false}>
        <div className="bg-dark-blue py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="text-white text-xl">Loading settled markets...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showHeaderNavigation={false}>
        <div className="bg-dark-blue py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="text-red-400 text-xl">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeaderNavigation={false}>
      {/* TikTok Banner - Mobile Only */}
      <div className="sm:hidden">
        <TikTokBanner />
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} />

      {/* Settled Betting Cards */}
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          {settledMarkets.length === 0 ? (
            <div className="text-center text-white text-xl py-8">
              No settled markets found
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCards.map((market) => {
                  // Create participant data for BettingCard
                  const participants = Array.isArray(market.participants) && market.participants.length >= 2 
                    ? market.participants.map((name: string, idx: number) => ({
                        id: String(idx),
                        name,
                        image: market.participantImages || '',
                        odds: 1
                      }))
                    : [];

                  // Determine winner (for now, just show the first participant as winner)
                  const winnerName = participants[0]?.name || 'Winner';
                  const winnerTitle = `${winnerName} won`;

                  return (
                    <BettingCard
                      key={market.id}
                      id={market.id}
                      title={winnerTitle}
                      participants={participants}
                      combinedImage={market.participantImages || ''}
                      volume={market.volume || '0 ETB'}
                      date={market.startTime ? new Date(market.startTime).toLocaleDateString() : ''}
                      startTime={market.startTime ? new Date(market.startTime).toLocaleTimeString() : undefined}
                      endTime={market.endTime ? new Date(market.endTime).toLocaleTimeString() : undefined}
                      chance={market.chance || (market.id % 100)}
                      isSettled={true}
                      onBet={handleBet}
                      onNavigate={handleNavigate}
                    />
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-1 rounded border ${
                        p === currentPage
                          ? 'bg-yellow-400 text-white border-yellow-500'
                          : 'bg-white text-blue-700 border-gray-300'
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecentlySettledPage;
