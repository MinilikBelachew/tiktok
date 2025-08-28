import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/rootReducer';
import { logoutRequest } from '../../store/slice/auth';

const AdminHeader: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    
      dispatch(logoutRequest());
      navigate('/login');
    
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-dark-blue text-white p-2 sm:p-3">
      <div className="flex justify-between items-center">
        {/* Left - LOGO Button */}
        
        <img
              src="/logo/pk-logo.jpg"
              alt="Logo"
              className=" bg-yellow-400 rounded-full h-6 sm:h-10 md:h-12 lg:h-14 w-auto"
            />
        
        
        {/* Right - Admin Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile: Collapsible user menu */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
            
                         {/* Mobile dropdown menu */}
             {showUserMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                 <div className="p-3 border-b border-gray-200">
                   <div className="text-sm font-medium text-gray-900">Admin</div>
                   <div className="text-xs text-gray-500 truncate">{user?.username || 'Admin User'}</div>
                 </div>
                 <button
                   onClick={handleProfileClick}
                   className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                   </svg>
                   <span>Profile</span>
                 </button>
                 <button
                   onClick={handleLogout}
                   className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center space-x-2"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                   <span>Logout</span>
                 </button>
               </div>
             )}
          </div>

                     {/* Desktop: Full user info and logout */}
           <div className="hidden sm:flex items-center space-x-3">
             <button
               onClick={handleProfileClick}
               className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
             >
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
               </svg>
             </button>
             <div className="bg-yellow-400 text-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm">
               Admin
             </div>
             <button
               onClick={handleLogout}
               className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
             >
               <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
               <span className="hidden sm:inline">Logout</span>
             </button>
           </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
