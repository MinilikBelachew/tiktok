
import {  useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../store/slice/auth';
import type { RootState } from '../../store/rootReducer';
import { Bell,   Settings,  Wallet, UserRound } from 'lucide-react';

interface HeaderProps {
  showNavigation?: boolean;
}
const Header: React.FC<HeaderProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  

  const handleNavigation = (page: string) => {
    navigate(`/${page}`);
  };

  const handleLogout = () => {
    
      dispatch(logoutRequest());
      navigate('/login');
    
  };

  return (
    <header className="bg-dark-blue text-white">
      <div className="container mx-auto px-2 sm:px-4 py-1 md:py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => handleNavigation('')}
            className="cursor-pointer p-0 bg-transparent hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <img
              src="/logo/pk-logo.jpg"
              alt="Logo"
              className="rounded-full h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto"
            />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {user ? (
            <>
              {/* Notification Bell - Always visible */}
              <button 
                className="bg-transparent text-[#ffcb05] p-1 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
              </button>

              {/* Wallet - Responsive version */}
              <div className="flex items-stretch">
                <button 
                  onClick={() => handleNavigation('wallet')}
                  className="cursor-pointer hidden sm:block bg-[#ffcb05] text-black px-2 sm:px-3 md:px-4 py-2 rounded-l-xl font-bold hover:bg-opacity-80 transition-colors text-xs sm:text-sm"
                >
                  Wallet
                </button>
                <button 
                  onClick={() => handleNavigation('wallet')}
                  className="sm:hidden bg-transparent text-[#ffcb05] p-1 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
                  aria-label="Wallet"
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                </button>
                <button 
                  onClick={() => handleNavigation('wallet')}
                  className="cursor-pointer hidden sm:flex bg-[#ffcb05] text-black p-1 rounded-r-xl font-bold hover:bg-opacity-80 transition-colors sm:border-l border-gray-400"
                  aria-label="Wallet"
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                </button>
              </div>

              {/* Profile - Responsive version */}
              <div className="flex items-stretch">
                <button 
                  onClick={() => handleNavigation('profile')}
                  className="cursor-pointer hidden sm:block bg-[#ffcb05] text-black px-2 sm:px-3 md:px-4 py-2 rounded-l-xl font-bold hover:bg-opacity-80 transition-colors text-xs sm:text-sm"
                >
                  Profile
                </button>
                <button 
                  onClick={() => handleNavigation('profile')}
                  className="cursor-pointer sm:hidden bg-transparent text-[#ffcb05] p-1 rounded-lg hover:bg-opacity-80 transition-colors"
                  aria-label="Profile"
                >
                  <UserRound className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                </button>
                <button 
                  onClick={() => handleNavigation('profile')}
                  className="cursor-pointer hidden sm:flex bg-[#ffcb05] text-black p-1 rounded-r-xl font-bold hover:bg-opacity-80 transition-colors sm:border-l border-gray-400"
                  aria-label="Profile"
                >
                  <UserRound className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                </button>
              </div>
              
              {/* Settings - Always visible */}
              <button 
                onClick={() => handleNavigation('settings')}
                className="cursor-pointer bg-transparent text-[#ffcb05] p-1 rounded-lg hover:bg-opacity-80 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="cursor-pointer bg-sunrise text-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm font-bold hover:bg-opacity-80 transition-colors text-xs sm:text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login/Register buttons */}
              <button
                onClick={() => handleNavigation('login')}
                className="cursor-pointer bg-sunrise text-black w-20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm font-bold hover:bg-opacity-80 transition-colors text-xs sm:text-sm text-center"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigation('register')}
                className="cursor-pointer bg-sunrise text-black w-20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm font-bold hover:bg-opacity-80 transition-colors text-xs sm:text-sm text-center"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

