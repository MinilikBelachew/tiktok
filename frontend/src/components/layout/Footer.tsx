import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-blue border-t border-white/10 text-white">
      <div className="container mx-auto px-2 sm:px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className=" flex items-center gap-3">
          <img src="/logo/pk-logo.jpg" alt="Logo" className="h-8 w-auto rounded-full" />
          <span className="text-sm text-white/80">© {new Date().getFullYear()} Bet TikTok. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




