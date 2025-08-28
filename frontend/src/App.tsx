// App.js
// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RecentlySettledPage from './pages/RecentlySettledPage';
import MarketsPage from './pages/MarketsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import WalletPage from './pages/WalletPage';


import MarketCardPage from './pages/MarketCardPage';
import NotFoundPage from './pages/NotFoundPage';

// import UpcomingPage from './pages/UpcomingPage';
import TitleUpdater from './components/title';
// Store provider moved to main.tsx for app bootstrap
// Optional: add a global fallback loader if needed
import PublicRoute from './components/routing/PublicRoute';
import AdminRoute from './components/routing/AdminRoute';
import UserRoute from './components/routing/UserRoute';
import AdminRoutes from './routes/AdminRoutes';
import SessionInitializer from './components/session/SessionInitializer';

function App() {
  return (
    <Router>
        <TitleUpdater />
        <SessionInitializer />

        <div className="App">
          <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
           <Route path="/home" element={<UserRoute><HomePage /></UserRoute>} /> 
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/recently-settled" element={<UserRoute><RecentlySettledPage /></UserRoute>} />
          {/* <Route path="/upcoming" element={<UserRoute><UpcomingPage /></UserRoute>} /> */}
          <Route path="/markets" element={<UserRoute><MarketsPage /></UserRoute>} />
          <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />
          <Route path="/settings" element={<UserRoute><SettingsPage /></UserRoute>} />
          <Route path="/deposit" element={<UserRoute><DepositPage /></UserRoute>} />
          <Route path="/withdraw" element={<UserRoute><WithdrawPage /></UserRoute>} />
          <Route path="/wallet" element={<UserRoute><WalletPage /></UserRoute>} />
          
          
          <Route path="/market-card/:marketId" element={<UserRoute><MarketCardPage /></UserRoute>} />
          <Route path="/market-card" element={<UserRoute><MarketCardPage /></UserRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminRoutes /></AdminRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </div>
    </Router>
  );
}

export default App;
