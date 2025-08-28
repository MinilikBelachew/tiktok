import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, activeSubTab, onSubTabChange }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      href: '/admin/dashboard',
      subTabs: [
        { id: 'total-users', label: 'Total Users' },
        { id: 'settled-markets', label: 'Settled Markets' },
        { id: 'active-markets', label: 'Active Markets' }
      ]
    },
    {
      id: 'market',
      label: 'Markets',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
      href: '/admin/markets',
      subTabs: [
        { id: 'create-market', label: 'Create Market' },
        { id: 'resolve-market', label: 'Resolve Market' },
        { id: 'edit-active-deactivate', label: 'Edit/Active/Deactivate' }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      href: '/admin/users',
      subTabs: []
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      href: '/admin/financial',
      subTabs: []
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      href: '/admin/settings',
      subTabs: []
    },

  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleSubTabClick = (subTabId: string) => {
    if (onSubTabChange) {
      onSubTabChange(subTabId);
    }
  };

  const currentNavItem = navigationItems.find(item => item.id === activeTab);

  return (
    <div className="bg-gray-200   ">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Management System</h2>
        {/* Main Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between py-2 space-y-2 sm:space-y-0">
          <nav className="flex gap-2 sm:gap-4 flex-wrap w-full justify-evenly">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center space-y-2 p-3 sm:p-4 rounded-xl transition-all duration-300 transform flex-1 border-4 border-gray-400 ${
                  activeTab === item.id
                    ? 'bg-white text-blue-800 shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className={`p-3 rounded-full ${activeTab === item.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  {item.icon}
                </div>
                <span className="text-lg font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Horizontal Line */}
        <div className="border-b border-gray-300 w-full mb-4"></div>

        {/* Sub-navigation (only show if current tab has sub-tabs) */}
        {currentNavItem && currentNavItem.subTabs && currentNavItem.subTabs.length > 0 && (
          <div className=" rounded-b-2xl border-t border-gray-200 pt-4 mt-4 -mx-8 px-8">
            <div className=" bg-white flex flex-wrap">
              {currentNavItem.subTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => handleSubTabClick(subTab.id)}
                  className={`flex-1 px-6 py-2 rounded-none font-semibold transition-colors duration-200 border border-blue-500 ${
                    activeSubTab === subTab.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
