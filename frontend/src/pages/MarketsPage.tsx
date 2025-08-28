import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BettingCard from '../components/betting/BettingCard';
import NavigationTabs from '../components/ui/NavigationTabs';
import TikTokBanner from '../components/ui/TikTokBanner';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/rootReducer';
import { fetchMarketsRequest } from '../store/slice/market';
import { useNavigate } from 'react-router-dom';

const MarketsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { markets: allMarkets, loading, error } = useSelector((state: RootState) => state.market);
  const { user } = useSelector((state: RootState) => state.auth);
  const activeTab = 'markets';


  // Additional security check - prevent admin access
  if (user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin users cannot access user pages.</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {user?.role}</p>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fetch markets on component mount
  useEffect(() => {
    dispatch(fetchMarketsRequest());
  }, [dispatch]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(allMarkets.length / pageSize));
  const paginated = useMemo(() => {
    // Sort markets by createdAt date (most recent first)
    const sortedMarkets = [...allMarkets].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    const start = (currentPage - 1) * pageSize;
    return sortedMarkets.slice(start, start + pageSize);
  }, [allMarkets, currentPage]);

  

  const handleBet = (participantId: string) => {
    console.log('Bet placed on:', participantId);
    // TODO: Implement betting logic
  };

  const handleNavigate = (marketId: string) => {
    navigate(`/market-card/${marketId}`);
  };

  return (
    <Layout  showHeaderNavigation={false}>
      {/* TikTok Banner - Mobile Only */}
      <div className="sm:hidden">
        <TikTokBanner />
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} />

      {/* Betting Cards */}
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && <div className="col-span-full text-center text-gray-600">Loading markets...</div>}
            {error && <div className="col-span-full text-center text-red-600">{error}</div>}
            {!loading && !error && paginated.map((m: any) => {
              const chance = typeof m.chance === 'number' ? m.chance : Math.min(90, Math.max(10, (Number(m.id) * 7) % 100));
              return (
                <BettingCard
                  key={m.id}
                  id={String(m.id)}
                  title={m.title}
                  participants={Array.isArray(m.participants) ? m.participants.map((p: string, idx: number) => ({ id: String(idx), name: p, image: m.participantImages || '', odds: 1 })) : []}
                  combinedImage={m.participantImages || ''}
                  volume={m.volume || ''}
                  date={m.startTime ? new Date(m.startTime).toLocaleDateString() : ''}
                  startTime={m.startTime ? new Date(m.startTime).toLocaleTimeString() : undefined}
                  endTime={m.endTime ? new Date(m.endTime).toLocaleTimeString() : undefined}
                  chance={chance}
                  onBet={handleBet}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
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
        </div>
      </div>
    </Layout>
  );
};

export default MarketsPage;
