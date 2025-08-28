import React, { useMemo, useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);
import Layout from "../components/layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import apiClient from '../utils/axios';
import { fetchMarketBetsRequest, fetchUserBetsRequest, placeBetRequest } from "../store/slice/bet";

interface Comment {
  id: string;
  text: string;
  user: string;
  liked: boolean;
  likeCount: number;
  createdAt: string;
  marketId: string;
  userProfileImage?: string; // Added for profile image
}

const MarketCardPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading, user } = useSelector((state: RootState) => state.auth);
  const [selectedParticipant, setSelectedParticipant] = useState<
    "left" | "right"
  >("left");
  const [amount, setAmount] = useState("40");
  const [activeTab, setActiveTab] = useState("comments");
  const [title, setTitle] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [leftName, setLeftName] = useState<string | null>(null);
  const [rightName, setRightName] = useState<string | null>(null);
  const [leftOdds, setLeftOdds] = useState<number | null>(null);
  const [rightOdds, setRightOdds] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [postingComment, setPostingComment] = useState(false);

  // Related markets state
  const [relatedMarkets, setRelatedMarkets] = useState<Array<{
    id: string;
    title: string;
    volume: string;
    participants: string[];
    startTime: string;
    status: string;
  }>>([]);
  const [relatedMarketsLoading, setRelatedMarketsLoading] = useState(false);

  // Bets state from Redux
  const marketBets = useSelector((state: RootState) => (marketId ? state.bet.byMarket[marketId]?.bets : []) || []);
  const placing = useSelector((state: RootState) => state.bet.placing);
  const userBets = useSelector((state: RootState) => state.bet.userBets);

  // Fetch market data from backend
  useEffect(() => {
    const fetchMarket = async () => {
      if (!marketId || !isAuthenticated || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`api/admin/markets/market/${marketId}`);
        const market = response.data;
        
        if (market) {
          setTitle(market.title);
          setVolume(market.volume || '0 ETB');
          setDate(market.startTime ? new Date(market.startTime).toLocaleDateString() : '');
          setStartTime(market.startTime ? new Date(market.startTime).toLocaleTimeString() : '');
          setEndTime(market.endTime ? new Date(market.endTime).toLocaleTimeString() : '');

          // Set participant data
          if (Array.isArray(market.participants) && market.participants.length >= 2) {
            setLeftName(market.participants[0]);
            setRightName(market.participants[1]);
            setCombinedImage(market.participantImages || '/imgs/img1.png');
            setLeftOdds(1.5); // Default odds
            setRightOdds(2.1); // Default odds
          }
        }
      } catch (error: any) {
        console.error('Error fetching market:', error);
        
        // Handle authentication errors specifically
        if (error.response?.status === 401) {
          console.log('MarketCardPage - User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }
        
        // Set default values on error
        setTitle('Market Not Found');
        setVolume('0 ETB');
        setDate('');
        setStartTime('');
        setEndTime('');
        setLeftName('Left');
        setRightName('Right');
        setCombinedImage('/imgs/img1.png');
        setLeftOdds(1.5);
        setRightOdds(2.1);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();

    // Fetch bets for this market and user
    if (marketId && isAuthenticated && !authLoading) {
      dispatch(fetchMarketBetsRequest({ marketId }));
      if (user?.id) {
        dispatch(fetchUserBetsRequest({ userId: user.id }));
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Reset state when component unmounts
      setLoading(false);
      setCommentsLoading(false);
    };
  }, [marketId, isAuthenticated, authLoading, navigate]);

  // Fetch comments for this market
  useEffect(() => {
    const fetchComments = async () => {
      if (!marketId || !isAuthenticated || authLoading) return;

      try {
        setCommentsLoading(true);
        setCommentError(null);
        console.log(`Fetching comments for market ${marketId}`);
        const response = await apiClient.get(`api/comments/${marketId}`);
        console.log('Comments API response:', response.data);
        
        if (response.data.formattedComments) {
          console.log('Setting comments:', response.data.formattedComments);
          setComments(response.data.formattedComments);
        } else {
          console.log('No formattedComments in response, using empty array');
          setComments([]);
        }
      } catch (error: any) {
        console.error('Error fetching comments:', error);
        
        // Handle authentication errors specifically
        if (error.response?.status === 401) {
          console.log('MarketCardPage - User not authenticated for comments, redirecting to login');
          navigate('/login');
          return;
        }
        
        setCommentError('Failed to load comments');
        // Set some default comments if API fails
        setComments([
          { id: '1', text: "I think shara is going to win this one", user: "User1", liked: false, likeCount: 0, createdAt: new Date().toISOString(), marketId, userProfileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
          { id: '2', text: "I love this game it is going to be tight call", user: "User2", liked: true, likeCount: 0, createdAt: new Date().toISOString(), marketId, userProfileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
          { id: '3', text: "lets gooo abel", user: "User3", liked: false, likeCount: 0, createdAt: new Date().toISOString(), marketId, userProfileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        ]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [marketId, isAuthenticated, authLoading, navigate]);

  // Fetch related markets
  useEffect(() => {
    const fetchRelatedMarkets = async () => {
      if (!isAuthenticated || authLoading) return;

      try {
        setRelatedMarketsLoading(true);
        console.log('Fetching related markets...');
        
        // Fetch markets from the backend (excluding current market)
        const response = await apiClient.get('api/admin/markets/market');
        
        if (response.data && Array.isArray(response.data)) {
          // Filter out current market and format the data
          const filteredMarkets = response.data
            .filter((market: any) => market.id.toString() !== marketId)
            .slice(0, 5) // Limit to 5 related markets
            .map((market: any) => ({
              id: market.id.toString(),
              title: market.title || 'TikTok Live Battle',
              volume: market.volume ? `${market.volume} ETB` : '0 ETB',
              participants: market.participants || ['Left', 'Right'],
              startTime: market.startTime || new Date().toISOString(),
              status: market.status || 'active'
            }));
          
          console.log('Setting related markets:', filteredMarkets);
          setRelatedMarkets(filteredMarkets);
        } else {
          console.log('No markets data in response, using empty array');
          setRelatedMarkets([]);
        }
      } catch (error: any) {
        console.error('Error fetching related markets:', error);
        
        // Set some default related markets if API fails
        setRelatedMarkets([
          { id: '1', title: "TikTok Live: Ben vs Noah", volume: "32K ETB", participants: ['Ben', 'Noah'], startTime: new Date().toISOString(), status: 'active' },
          { id: '2', title: "TikTok Live: Hana vs Ruth", volume: "21K ETB", participants: ['Hana', 'Ruth'], startTime: new Date().toISOString(), status: 'active' },
          { id: '3', title: "TikTok Live: Kiya vs Eden", volume: "18K ETB", participants: ['Kiya', 'Eden'], startTime: new Date().toISOString(), status: 'active' },
        ]);
      } finally {
        setRelatedMarketsLoading(false);
      }
    };

    fetchRelatedMarkets();
  }, [marketId, isAuthenticated, authLoading]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600 text-sm">Checking authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Chart data memoized at component level
  const chartData = useMemo(() => {
    const labels = ["Start", "Q1", "Q2", "Q3", "End"];
    // Simple demo: build trend based on odds (higher odds => lower implied chance)
    const leftBase = leftOdds ? Math.max(20, 200 / leftOdds) : 120;
    const rightBase = rightOdds ? Math.max(20, 200 / rightOdds) : 110;
    return {
      labels,
      datasets: [
        {
          label: leftName || "Left",
          data: [
            leftBase,
            leftBase + 10,
            leftBase + 30,
            leftBase + 20,
            leftBase + 25,
          ],
          borderColor: "#60A5FA",
          backgroundColor: "rgba(96,165,250,0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: rightName || "Right",
          data: [
            rightBase,
            rightBase - 10,
            rightBase + 15,
            rightBase + 5,
            rightBase + 18,
          ],
          borderColor: "#34D399",
          backgroundColor: "rgba(52,211,153,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [leftOdds, rightOdds, leftName, rightName]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep only digits
    let digitsOnly = raw.replace(/[^0-9]/g, "");
    // Remove leading zeros
    digitsOnly = digitsOnly.replace(/^0+/, "");
    // Enforce minimum of 1 while typing
    if (digitsOnly === "") {
      digitsOnly = "1";
    }
    setAmount(digitsOnly);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (
      allowedKeys.includes(e.key) ||
      // Allow Ctrl/Cmd + A/C/V/X
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    // Block non-digits
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountBlur = () => {
    const valueNum = parseInt(amount || "0", 10);
    if (!valueNum || valueNum < 1) {
      setAmount("1");
    }
  };

  const handleParticipantSelect = (side: "left" | "right") => {
    setSelectedParticipant(side);
  };

  const handleQuickAmount = (quickAmount: string) => {
    setAmount(quickAmount);
  };

  const handleRelatedMarketClick = (marketId: string) => {
    console.log(`Navigating to related market: ${marketId}`);
    navigate(`/market-card/${marketId}`);
  };

  const handleTrade = () => {
    if (!marketId) return;
    const amtNum = parseFloat(amount || "0");
    if (!amtNum || amtNum <= 0) return;
    const outcomeName = selectedParticipant === "left" ? leftName : rightName;
    if (!outcomeName) return;
    dispatch(placeBetRequest({ marketId, amount: amtNum, outcome: outcomeName }));
  };

  // Compute expected payout: (userBet / totalOnChosen) * totalMarket
  const expectedPayout = (() => {
    const amt = parseFloat(amount || "0");
    if (!amt || !leftName || !rightName) return 0;
    const totalMarket = marketBets.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0);
    const chosenName = selectedParticipant === "left" ? leftName : rightName;
    const totalOnChosen = marketBets
      .filter((b: any) => b.outcome === chosenName)
      .reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0);
    if (totalOnChosen <= 0 || totalMarket <= 0) return 0;
    return Math.round((amt / totalOnChosen) * totalMarket);
  })();

  const handleSendComment = async () => {
    if (!newComment.trim() || !marketId) return;

    try {
      setPostingComment(true);
      setCommentError(null);

      const newCommentObj = {
        text: newComment.trim(),
        marketId: marketId
      };

      console.log('Sending new comment:', newCommentObj);

      // Send to backend
      const response = await apiClient.post(`api/comments/${marketId}`, newCommentObj);
      console.log('Comment creation response:', response.data);

      // Add the new comment to the list
      const commentToAdd: Comment = {
        id: response.data.id,
        text: response.data.text,
        user: response.data.user || "You", // This should come from user context in real app
        liked: false,
        likeCount: 0, // Initialize likeCount
        createdAt: response.data.createdAt,
        marketId: marketId,
        userProfileImage: response.data.userProfileImage // Assuming backend returns this
      };

      console.log('Adding new comment to state:', commentToAdd);
      setComments(prev => [commentToAdd, ...prev]);
      setNewComment("");
    } catch (error: any) {
      console.error('Error posting comment:', error);
      setCommentError('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendComment();
    }
  };

  const handleLikeToggle = async (commentId: string) => {
    console.log(`handleLikeToggle called for comment ${commentId} in market ${marketId}`);
    
    try {
      // Store the original comment state for rollback
      const originalComment = comments.find(c => c.id === commentId);
      if (!originalComment) {
        console.log('Comment not found in state:', commentId);
        return;
      }

      console.log(`Original comment state - liked: ${originalComment.liked}, likeCount: ${originalComment.likeCount}`);

      // Optimistically update UI
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? { ...comment, liked: !comment.liked } : comment
        )
      );

      console.log(`Making API call to: api/comments/${marketId}/${commentId}/like`);
      
      // Send like/unlike to backend
      const response = await apiClient.post(`api/comments/${marketId}/${commentId}/like`);
      
      console.log('Backend response:', response.data);
      
      // Update the comment with the actual response from backend
      if (response.data && response.data.comment) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId 
              ? { 
                  ...comment, 
                  liked: response.data.liked,
                  likeCount: response.data.comment.likeCount || comment.likeCount
                } 
              : comment
          )
        );
        console.log(`Like toggled successfully. New like count: ${response.data.comment.likeCount}`);
      } else {
        console.log('Unexpected response format:', response.data);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update on error
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId 
            ? { 
                ...comment, 
                liked: comment.liked, // Keep current state
                likeCount: comment.likeCount // Keep current count
              } 
            : comment
        )
      );
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        console.log('User not authenticated for like action');
        // You could show a toast notification here
      } else {
        console.log('Network or server error during like action');
        // You could show a toast notification here
      }
    }
  };

  const formatCommentTime = (createdAt: string) => {
    const now = new Date();
    const commentTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Layout showHeaderNavigation={false}>
      <div className="min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading market...</p>
            </div>
          </div>
        ) : !marketId ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Market ID Required
              </h1>
              <p className="text-gray-300 mb-6">
                Please provide a valid market ID in the URL.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Event Details Section (Mobile: 1st, Desktop: Top-Left) */}
              <div className="lg:col-span-2 order-1">
                <div className="bg-gray-200 border border-gray-300 rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                  {/* Event Title Section */}
                  <div className="flex items-start justify-between mb-4 ">
                    <div className="flex items-start gap-3 ">
                      <img
                        src="/tiktok-logo/TikTok-Logo.png"
                        alt="TikTok"
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-md bg-white"
                      />
                      <a className="text-base sm:text-lg font-bold text-dark-blue underline hover:text-blue-700 cursor-pointer">
                        {title ||
                          "Tiktok Live Battle Shara vs Abel, Who will win?"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <button
                        className="hover:text-dark-blue"
                        aria-label="Info"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                      <button
                        className="hover:text-dark-blue"
                        aria-label="Bookmark"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Event details + Participants row (details left, image right) */}
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Event details group (bordered) - responsive order */}
                      <div className="order-2 sm:order-1 w-full sm:flex-1 flex flex-wrap items-center gap-6 sm:gap-12 text-xs sm:text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <div className="inline-flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                          <span className="font-medium text-dark-blue">
                            Volume {volume || "121K ETB"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium text-dark-blue">
                            {date || "Nov 27, 2027"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium text-dark-blue">
                            {startTime && endTime
                              ? `${startTime} - ${endTime}`
                              : "8pm - 10 pm"}
                          </span>
                        </div>
                      </div>

                      {/* Participants image - responsive order */}
                      <div className="order-1 sm:order-2 w-full sm:w-auto flex items-center gap-3">
                        <div className="text-center w-full sm:w-auto">
                          <img
                            src={combinedImage || "/imgs/img1.png"}
                            alt="Participants"
                            className="w-full h-40 sm:w-64 sm:h-36 rounded-lg object-cover border-2 border-white shadow"
                          />
                          <div className="flex justify-between items-center mt-2 gap-4">
                            {leftName && (
                              <div className="text-xs text-dark-blue font-semibold">
                                {leftName}
                              </div>
                            )}
                            {rightName && (
                              <div className="text-xs text-dark-blue font-semibold">
                                {rightName}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            {typeof leftOdds === "number" && (
                              <div className="text-[11px] text-gray-600">
                                Odds {leftOdds}
                              </div>
                            )}
                            {typeof rightOdds === "number" && (
                              <div className="text-[11px] text-gray-600">
                                Odds {rightOdds}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Performance Chart */}
                  <div className="mb-2 sm:mb-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-3 h-56 sm:h-64 lg:h-72">
                      <Line
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: true, position: "top" },
                            tooltip: { enabled: true },
                          },
                          scales: {
                            x: { grid: { display: false } },
                            y: {
                              grid: { color: "#e5e7eb" },
                              ticks: { stepSize: 20 },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section (Mobile: 3rd, Desktop: Bottom-Left) */}
              <div className="lg:col-span-2 order-3 lg:order-3">
                {/* Link-style tabs header separated from comments card */}
                <div className="mb-0.5 ">
                  <div className="flex flex-wrap gap-0.5">
                    {(["comments", "activity", "related"] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 sm:flex-1 py-3 text-sm font-semibold rounded-sm border transition-colors ${
                            activeTab === tab
                              ? "bg-yellow-400 text-white border-yellow-500"
                              : "bg-white text-blue-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Tab bodies */}
                {activeTab === "comments" && (
                  <div className="bg-gray-200 border border-gray-300 rounded-xl shadow-sm p-5 sm:p-6 mb-3 sm:mb-4">
                    {/* Comment Input */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={handleCommentKeyPress}
                        className="flex-grow w-full sm:w-auto bg-white px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={!newComment.trim() || postingComment}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {postingComment ? "Posting..." : "Send"}
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {commentsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading comments...</p>
                        </div>
                      ) : commentError ? (
                        <div className="text-center py-8 text-red-500">
                          {commentError}
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No comments yet. Be the first to add one!
                        </div>
                      ) : (
                        Array.isArray(comments) && comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 flex-shrink-0 overflow-hidden bg-gray-300">
                              {comment.userProfileImage ? (
                                <img 
                                  src={comment.userProfileImage} 
                                  alt={comment.user}
                                  className="w-full h-full object-cover rounded-full"
                                  loading="lazy"
                                  onError={(e) => {
                                    // Fallback to first letter if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold ${comment.userProfileImage ? 'hidden' : ''}`}>
                                {comment.user.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-dark-blue">
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <span>{comment.user}</span>
                                <span>{formatCommentTime(comment.createdAt)}</span>
                              </div>
                              {comment.text}
                            </div>
                            <button
                              onClick={() => handleLikeToggle(comment.id)}
                              className={`flex-shrink-0 flex items-center gap-1 ${
                                comment.liked ? "text-blue-600" : "text-gray-500"
                              } hover:text-blue-600`}
                              aria-label="Like"
                            >
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span className="text-xs font-medium">{comment.likeCount}</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-5 sm:p-6 mb-3 sm:mb-4">
                    <div className="space-y-4">
                      {/* activityFeed state was removed, so this will always show "No activity" */}
                      <div className="text-center py-8 text-gray-500">
                        No activity yet
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "related" && (
                  <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-5 sm:p-6">
                    <div className="space-y-4">
                      {relatedMarketsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-500 text-sm">Loading related markets...</p>
                        </div>
                      ) : relatedMarkets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No related markets found</p>
                        </div>
                      ) : (
                        relatedMarkets.map((mkt) => (
                          <div
                            key={mkt.id}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-dark-blue mb-1">
                                {mkt.title}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Volume: {mkt.volume}</span>
                                <span>•</span>
                                <span>{mkt.participants.join(' vs ')}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  mkt.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  mkt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {mkt.status}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRelatedMarketClick(mkt.id)}
                              className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ml-3"
                            >
                              View
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar (Mobile: 2nd, Desktop: Right) */}
              <div className="lg:col-span-1 order-2 lg:order-2 lg:row-span-2">
                {/* Place Bet Section */}
                <div className="bg-gray-200 border border-gray-300 rounded-xl shadow-md p-5 sm:p-6 mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-dark-blue mb-2 text-center">
                    Place Bet
                  </h2>
                  <div className="border-t border-gray-300 mb-4" />
                  <div className="space-y-5 sm:space-y-6">
                    {/* Participant Selection */}
                    <div className="bg-white border-2 border-blue-600 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-2">
                        <button
                          onClick={() => handleParticipantSelect("left")}
                          className={`w-full py-2 font-semibold ${
                            selectedParticipant === "left"
                              ? "bg-yellow-400 text-black"
                              : "bg-white text-blue-700"
                          }`}
                        >
                          {leftName?.toUpperCase() || "LEFT"}
                        </button>
                        <button
                          onClick={() => handleParticipantSelect("right")}
                          className={`w-full py-2 font-semibold ${
                            selectedParticipant === "right"
                              ? "bg-red-500 text-white"
                              : "bg-white text-blue-700"
                          }`}
                        >
                          {rightName?.toUpperCase() || "RIGHT"}
                        </button>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <label className="text-sm font-semibold text-dark-blue whitespace-nowrap shrink-0">
                          Amount
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={amount}
                          onChange={handleAmountChange}
                          onKeyDown={handleAmountKeyDown}
                          onBlur={handleAmountBlur}
                          className="bg-white min-w-0 flex-1 px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter amount"
                        />
                        <div className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 bg-white whitespace-nowrap shrink-0">
                          ETB
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-300" />

                    {/* Quick Amount Buttons */}
                    <div className="bg-white border border-gray-300 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {(["20", "40", "60"] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => handleQuickAmount(q)}
                            className={`w-full py-2 rounded-md text-sm font-semibold ${
                              amount === q
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {q} ETB
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-300" />

                    {/* Expected Payout */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-semibold">
                        EXPECTED PAYOUT
                      </p>
                      <p className="text-lg font-bold text-dark-blue">
                        ETB{" "}
                        {expectedPayout}
                      </p>
                    </div>
                    <div className="border-t border-gray-300" />

                    {/* Trade Button */}
                    <button
                      onClick={handleTrade}
                      disabled={placing}
                      className={`block mx-auto w-3/4 sm:w-1/2 text-white py-3 rounded-lg font-semibold transition-colors ${placing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {placing ? 'PLACING...' : 'TRADE'}
                    </button>
                  </div>
                </div>

                {/* Order History Section */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-dark-blue mb-4">
                    Order History
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left font-semibold text-dark-blue border border-gray-300 text-sm">
                            Order
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-dark-blue border border-gray-300 text-sm">
                            ID
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = (userBets || []).filter((b: any) => String(b.marketId) === String(marketId));
                          if (!rows.length) {
                            return (
                              <tr>
                                <td className="px-4 py-3 border border-gray-300 text-sm text-gray-500" colSpan={2}>
                                  No orders yet
                                </td>
                              </tr>
                            );
                          }
                          return rows.map((b: any) => (
                            <tr key={b.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 border border-gray-300 text-sm text-dark-blue">
                                {b.outcome}
                              </td>
                              <td className="px-4 py-3 border border-gray-300 text-sm text-gray-700">
                                {b.id}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MarketCardPage;
