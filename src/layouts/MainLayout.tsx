import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import GlassNavigation from '../components/GlassNavigation';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import { useAppStore } from '../store/useAppStore';
import { useConvexSync } from '../hooks/useConvexSync';

interface MainLayoutProps {
  children?: React.ReactNode;
}

/**
 * Main application layout with navigation
 * Provides consistent layout structure for all main application pages
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAppStore();
  const { isOnline, clearCache, syncStatus, syncPendingChanges } = useConvexSync();
  const navigate = useNavigate();
  
  // Handle logout with cache clearing
  const handleLogout = async () => {
    // Clear cache before logging out
    clearCache();
    await logout();
    navigate('/login');
  };
  
  // Try to sync pending changes when coming back online
  useEffect(() => {
    if (isOnline && syncStatus === 'offline') {
      syncPendingChanges();
    }
  }, [isOnline, syncStatus, syncPendingChanges]);
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Library', path: '/library' },
    { label: 'Settings', path: '/settings' },
  ];
  
  const rightContent = user ? (
    <div className="flex items-center gap-2">
      <span className="text-white/80 hidden sm:inline-block">
        {user.name}
      </span>
      {!isOnline && (
        <span className="text-red-400 text-xs px-2 py-1 rounded-full bg-red-900/30 mr-2">
          Offline
        </span>
      )}
      <img 
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
        alt={user.name}
        className="w-8 h-8 rounded-full"
      />
      <button 
        onClick={handleLogout}
        className="ml-2 text-xs text-white/80 hover:text-white"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <a href="/login" className="glass-button-outline">Sign In</a>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <GlassNavigation
        title="EA PolicyFrame"
        items={navItems}
        rightContent={rightContent}
      />
      
      <main className="flex-grow container-responsive py-6 px-4">
        {children || <Outlet />}
      </main>
      
      {/* Sync Status Indicator */}
      {user && <SyncStatusIndicator />}
      
      <footer className="glass-nav mt-auto py-4">
        <div className="container-responsive text-center text-white/60 text-sm">
          &copy; {new Date().getFullYear()} EA PolicyFrame App • Powered by Convex
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;