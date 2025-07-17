import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

/**
 * 404 Not Found page component
 */
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center">
        <div className="text-white/60 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        
        <p className="text-white/80 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex justify-center">
          <Link to="/">
            <GlassButton>
              Return Home
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default NotFound;