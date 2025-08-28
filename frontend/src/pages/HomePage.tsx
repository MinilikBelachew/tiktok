import React, { useMemo, useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import BettingCard from "../components/betting/BettingCard";
import { useNavigate } from "react-router-dom";
import NavigationTabs from "../components/ui/NavigationTabs";
import TikTokBanner from "../components/ui/TikTokBanner";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarketsRequest } from "../store/slice/market";
import type { RootState } from "../store/rootReducer";
import Spinner from "../components/ui/Spinner";

const HomePage: React.FC = () => {
  const activeTab = "upcoming";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get markets and user from Redux store
  const { markets, loading, error } = useSelector((state: RootState) => state.market);
  const { user } = useSelector((state: RootState) => state.auth);

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

  const handleNavigate = (marketId: string) => {
    navigate(`/market-card/${marketId}`);
  };

  // Filter markets by startTime (today and tomorrow)
  const { todayMarkets, tomorrowMarkets } = useMemo(() => {
    if (!markets || markets.length === 0) {
      return { todayMarkets: [], tomorrowMarkets: [] };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Filtering markets - Today date:', today);
    console.log('Filtering markets - Tomorrow date:', tomorrow);

    const todayMarkets = markets.filter((market: any) => {
      if (!market.startTime) {
        console.log('Market has no startTime:', market.id, market.title);
        return false;
      }
      const marketDate = new Date(market.startTime);
      const marketDateOnly = new Date(marketDate.getFullYear(), marketDate.getMonth(), marketDate.getDate());
      const isToday = marketDateOnly.getTime() === today.getTime();
      console.log(`Market ${market.id} (${market.title}): startTime=${market.startTime}, dateOnly=${marketDateOnly}, isToday=${isToday}`);
      return isToday;
    });

    const tomorrowMarkets = markets.filter((market: any) => {
      if (!market.startTime) {
        console.log('Market has no startTime:', market.id, market.title);
        return false;
      }
      const marketDate = new Date(market.startTime);
      const marketDateOnly = new Date(marketDate.getFullYear(), marketDate.getMonth(), marketDate.getDate());
      const isTomorrow = marketDateOnly.getTime() === tomorrow.getTime();
      console.log(`Market ${market.id} (${market.title}): startTime=${market.startTime}, dateOnly=${marketDateOnly}, isTomorrow=${isTomorrow}`);
      return isTomorrow;
    });

    console.log('Filtered results - Today markets:', todayMarkets.length, 'Tomorrow markets:', tomorrowMarkets.length);
    return { todayMarkets, tomorrowMarkets };
  }, [markets]);

  // Pagination per section
  const [currentTodayPage, setCurrentTodayPage] = useState(1);
  const [currentTomorrowPage, setCurrentTomorrowPage] = useState(1);
  const pageSize = 6;

  const totalTodayPages = Math.max(1, Math.ceil(todayMarkets.length / pageSize));
  const totalTomorrowPages = Math.max(1, Math.ceil(tomorrowMarkets.length / pageSize));

  const paginatedToday = useMemo(() => {
    const start = (currentTodayPage - 1) * pageSize;
    return todayMarkets.slice(start, start + pageSize);
  }, [todayMarkets, currentTodayPage]);

  const paginatedTomorrow = useMemo(() => {
    const start = (currentTomorrowPage - 1) * pageSize;
    return tomorrowMarkets.slice(start, start + pageSize);
  }, [tomorrowMarkets, currentTomorrowPage]);

  // Fetch markets on component mount
  useEffect(() => {
    dispatch(fetchMarketsRequest());
  }, [dispatch]);

  // Debug: Log markets data
  useEffect(() => {
    if (markets && markets.length > 0) {
      console.log('Markets data from backend:', markets);
      console.log('First market structure:', markets[0]);
    }
  }, [markets]);

  // Reset pagination when markets change
  useEffect(() => {
    setCurrentTodayPage(1);
    setCurrentTomorrowPage(1);
  }, [markets]);

  if (loading) {
    return (
      <Layout showHeaderNavigation={false}>
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
      <Layout showHeaderNavigation={false}>
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
    <Layout showHeaderNavigation={false}>
      {/* TikTok Banner */}
      <div className="sm:hidden">
        <TikTokBanner />
      </div>
      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} />

      {/* Main Content */}
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          {/* Today Section */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-6 border-b border-light-grey pb-2">
              Today {todayMarkets.length > 0 && `(${todayMarkets.length})`}
            </h2>
            {todayMarkets.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No markets scheduled for today</p>
              </div>
            ) : (
              <>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {paginatedToday.map((market: any) => {
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
                         onBet={(participantId: string) => console.log('Bet placed on:', participantId)}
                         onNavigate={() => handleNavigate(market.id)}
                       />
                     );
                   })}
                 </div>
                {/* Today Pagination */}
                {totalTodayPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                      onClick={() => setCurrentTodayPage((p) => Math.max(1, p - 1))}
                      disabled={currentTodayPage === 1}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalTodayPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`px-3 py-1 rounded border ${
                          p === currentTodayPage
                            ? 'bg-yellow-400 text-white border-yellow-500'
                            : 'bg-white text-blue-700 border-gray-300'
                        }`}
                        onClick={() => setCurrentTodayPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                      onClick={() => setCurrentTodayPage((p) => Math.min(totalTodayPages, p + 1))}
                      disabled={currentTodayPage === totalTodayPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tomorrow Section */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-6 border-b border-light-grey pb-2">
              Tomorrow {tomorrowMarkets.length > 0 && `(${tomorrowMarkets.length})`}
            </h2>
            {tomorrowMarkets.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No markets scheduled for tomorrow</p>
              </div>
            ) : (
              <>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {paginatedTomorrow.map((market: any) => {
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
                         onBet={(participantId: string) => console.log('Bet placed on:', participantId)}
                         onNavigate={() => handleNavigate(market.id)}
                       />
                     );
                   })}
                 </div>
                {/* Tomorrow Pagination */}
                {totalTomorrowPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                      onClick={() => setCurrentTomorrowPage((p) => Math.max(1, p - 1))}
                      disabled={currentTomorrowPage === 1}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalTomorrowPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`px-3 py-1 rounded border ${
                          p === currentTomorrowPage
                            ? 'bg-yellow-400 text-white border-yellow-500'
                            : 'bg-white text-blue-700 border-gray-300'
                        }`}
                        onClick={() => setCurrentTomorrowPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-blue-700 disabled:opacity-50"
                      onClick={() => setCurrentTomorrowPage((p) => Math.min(totalTomorrowPages, p + 1))}
                      disabled={currentTomorrowPage === totalTomorrowPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
