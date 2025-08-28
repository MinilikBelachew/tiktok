import React from 'react';
import { useNavigate } from 'react-router-dom';
// import Layout from '../components/layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sunrise/20">
              <span className="text-4xl font-black text-sunrise">404</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Page not found</h1>
          <p className="text-gray-300 mb-8">
            The page you’re looking for doesn’t exist or was moved. Check the URL, or head back home.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="bg-sunrise text-black px-5 py-2 rounded-sm font-bold hover:bg-opacity-80 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border border-gray-500 text-white px-5 py-2 rounded-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    
  );
};

export default NotFoundPage;


