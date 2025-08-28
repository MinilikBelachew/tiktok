import React from "react";
import Layout from "../components/layout/Layout";
import BettingCard from "../components/betting/BettingCard";
import { useNavigate } from "react-router-dom";
import TikTokBanner from "../components/ui/TikTokBanner";
import NavigationTabs from "../components/ui/NavigationTabs";
import { MOCK_BETTING_MATCHES } from "../constants";

const UpcomingPage: React.FC = () => {
  const activeTab = "upcoming";
  const navigate = useNavigate();

  const handleNavigate = (match: any) => {
    navigate(`/market-card/${match.id}`);
  };

  const todayMatches = MOCK_BETTING_MATCHES.slice(0, 3);
  const tomorrowMatches = MOCK_BETTING_MATCHES.slice(3, 9);

  return (
    <Layout showHeaderNavigation={false}>
      <div className="sm:hidden">
        <TikTokBanner />
      </div>

      <NavigationTabs activeTab={activeTab} />

      {/* Main Content */}
      <div className="bg-dark-blue py-8">
        <div className="container mx-auto px-4">
          {/* Today Section */}
          <div className="mb-8">
             
            <h2 className="text-white text-2xl font-bold mb-6 border-b border-light-grey pb-2">
              Today
            </h2>
             
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayMatches.map((match: any) => (
                <BettingCard
                  key={match.id}
                  {...match}
                  isSettled={false}
                  onNavigate={() => handleNavigate(match)}
                />
              ))}
               
            </div>
          </div>

          {/* Tomorrow Section */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-6 border-b border-light-grey pb-2">
              Tomorrow
            </h2>
             
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tomorrowMatches.map((match: any) => (
                <BettingCard
                  key={match.id}
                  {...match}
                  isSettled={false}
                  onNavigate={() => handleNavigate(match)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpcomingPage;
