import React from 'react';
import GlassCard from '../components/GlassCard';
import { useAppStore } from '../store/useAppStore';

/**
 * Dashboard page component
 */
const Dashboard: React.FC = () => {
  const { user } = useAppStore();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/80 mt-1">Welcome back, {user?.name || 'User'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <h3 className="text-xl font-medium text-white mb-2">Content Generated</h3>
          <p className="text-3xl font-bold text-white">{user?.usage?.totalGenerations || 0}</p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-xl font-medium text-white mb-2">Total Tokens</h3>
          <p className="text-3xl font-bold text-white">{user?.usage?.totalTokens || 0}</p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-xl font-medium text-white mb-2">API Status</h3>
          <p className="text-white/80">
            {user?.apiKeys?.gemini ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-yellow-400">Not Connected</span>
            )}
          </p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-xl font-medium text-white mb-2">Default Model</h3>
          <p className="text-white/80">{user?.preferences?.defaultModel || 'gemini-2.5-pro'}</p>
        </GlassCard>
      </div>
      
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Recent Content</h2>
        <div className="text-white/80">
          <p>Your recent content will appear here.</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;