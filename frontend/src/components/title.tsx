import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Landing - Tiktok Battle",
  "/home": "Home - Tiktok Battle",
  "/register": "Register - Tiktok Battle",
  "/login": "Login - Tiktok Battle",
  "/forgot-password": "Forgot Password - Tiktok Battle",
  "/recently-settled": "Recently Settled - Tiktok Battle",
  "/upcoming": "Upcoming - Tiktok Battle",
  "/markets": "Markets - Tiktok Battle",
  "/profile": "Profile - Tiktok Battle",
  "/settings": "Settings - Tiktok Battle",
  "/deposit": "Deposit - Tiktok Battle",
  "/withdraw": "Withdraw - Tiktok Battle",
  "/wallet": "Wallet - Tiktok Battle",
//   "/order-placed": "Order Placed - Tiktok Battle",
  "/market-card": "Market Card - Tiktok Battle",
};

export default function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    document.title = titles[location.pathname] || "My App";
  }, [location]);

  return null;
}
