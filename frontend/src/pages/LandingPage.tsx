import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import BettingCard from '../components/betting/BettingCard';
import TikTokBanner from '../components/ui/TikTokBanner';
import Spinner from '../components/ui/Spinner';
import { fetchMarketsRequest } from '../store/slice/market';
import type { RootState } from '../store/rootReducer';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { markets, loading, error } = useSelector((state: RootState) => state.market);

  const handleBet = (participantId: string) => {
    console.log('Bet placed on:', participantId);
    // TODO: Implement betting logic
  };

  const handleNavigate = (marketId: string) => {
    navigate(`/market-card/${marketId}`);
  };

  // Fetch markets on component mount
  useEffect(() => {
    dispatch(fetchMarketsRequest());
  }, [dispatch]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil((markets?.length || 0) / pageSize));
  
  const paginatedCards = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    
    const sortedMarkets = [...markets].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    const start = (currentPage - 1) * pageSize;
    return sortedMarkets.slice(start, start + pageSize);
  }, [markets, currentPage]);

  // Reset pagination when markets change
  useEffect(() => {
    setCurrentPage(1);
  }, [markets]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner />
            <p className="text-white mt-4">Loading markets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-red-500 mb-4">Error loading markets: {error}</p>
            <button 
              onClick={() => dispatch(fetchMarketsRequest())}
              className="bg-sunrise text-black px-4 py-2 rounded hover:bg-opacity-80"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero/Banner Section */}
      <div className="relative bg-porcelain h-64 mb-8">
        {/* TikTok Banner */}
        <div className="absolute inset-0">
          <TikTokBanner className="h-full" />
        </div>
        
        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex justify-center mb-6">
          <h2 className="relative inline-flex items-center text-sunrise font-serif font-bold text-2xl tracking-wider">
            TRENDING
            <svg
              className="w-6 h-6 text-sunrise ml-1 -mt-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </h2>
        </div>

        {markets && markets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCards.map((market: any) => {
                const chance = typeof market.chance === 'number' ? market.chance : Math.min(90, Math.max(10, (Number(market.id) * 7) % 100));
                return (
                  <BettingCard
                    key={market.id}
                    id={String(market.id)}
                    title={market.title}
                    participants={Array.isArray(market.participants) ? market.participants.map((p: string, idx: number) => ({ id: String(idx), name: p, image: market.participantImages || '', odds: 1 })) : []}
                    combinedImage={market.participantImages || ''}
                    volume={market.volume || ''}
                    date={market.startTime ? new Date(market.startTime).toLocaleDateString() : ''}
                    startTime={market.startTime ? new Date(market.startTime).toLocaleTimeString() : undefined}
                    endTime={market.endTime ? new Date(market.endTime).toLocaleTimeString() : undefined}
                    chance={chance}
                    onBet={handleBet}
                    onNavigate={() => handleNavigate(market.id)}
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
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No markets available at the moment</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandingPage; 