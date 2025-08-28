import React from "react";
import { useNavigate } from "react-router-dom";

interface NavigationTabsProps {
  activeTab: string;
  className?: string;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  className = "",
}) => {
  const navigate = useNavigate();

  const tabs = [
    // { id: "tiktok-live", label: "TikTok Live Match", path: "/home" }, // Shortened label for mobile
     { id: "upcoming", label: "Upcoming", path: "/home" },
    {
      id: "recently-settled",
      label: "Recently Settled",
      path: "/recently-settled",
    }, // Shortened
    { id: "markets", label: "Markets", path: "/markets" },
  ];

  const handleTabChange = (tabId: string, path: string) => {
    if (tabId !== activeTab) {
      navigate(path);
    }
  };

  return (
    <div className={`bg-dark-blue py-3 md:py-6 ${className}`}>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-wrap justify-center gap-1 md:gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id, tab.path)}
              className={`px-2 py-2 md:px-4 md:py-3 lg:px-6 lg:py-5 rounded-none font-semibold transition-colors
                  flex-1 md:flex-none md:w-auto lg:w-60 text-xs sm:text-sm md:text-base cursor-pointer
                  ${
                    activeTab === tab.id
                      ? "bg-yellow-400 text-black"
                      : "bg-white text-blue-600 hover:text-blue-800"
                  }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;
