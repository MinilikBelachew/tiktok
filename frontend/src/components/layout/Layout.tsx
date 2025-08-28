import React from 'react';
import Header from './Header'; // Assuming Header.tsx is in the same directory as this file
import Footer from './Footer';

// Component for the page layout
interface LayoutProps {
  children: React.ReactNode;
  showHeaderNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeaderNavigation = true
}) => {
  return (
    <div className="min-h-screen bg-dark-blue flex flex-col font-inter">
      <Header showNavigation={showHeaderNavigation} />
      <main className="flex-1 ">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
