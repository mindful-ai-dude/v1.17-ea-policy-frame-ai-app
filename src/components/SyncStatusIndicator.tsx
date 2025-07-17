import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { measureRender } from '../utils/performanceMonitoring';
import logger from '../utils/logger';

// Logger instance for this component
const log = logger.createScoped('SyncStatusIndicator');

interface SyncStatusIndicatorProps {
  className?: string;
}

/**
 * Component that displays the current synchronization status with Convex
 * Shows online/offline status and pending sync operations
 */
const SyncStatusIndicator = ({ className = '' }: SyncStatusIndicatorProps) => {
  // Track online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Track pending sync operations
  const [pendingSyncs, setPendingSyncs] = useState(0);
  
  // Performance measurement
  const performance = measureRender('SyncStatusIndicator');
  
  // Check if we can connect to Convex
  const connectionStatus = useQuery(api.auth.getConnectionStatus) || 'unknown';
  
  // Update online status when network status changes
  useEffect(() => {
    performance.start();
    
    const handleOnline = () => {
      log.info('Device went online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      log.info('Device went offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check for pending sync operations in IndexedDB
    const checkPendingSyncs = async () => {
      try {
        // This would be implemented with actual IndexedDB access in a real app
        // For now, we'll simulate it
        const pendingCount = localStorage.getItem('pendingSyncCount') 
          ? parseInt(localStorage.getItem('pendingSyncCount') || '0', 10) 
          : 0;
        setPendingSyncs(pendingCount);
      } catch (error) {
        log.error('Failed to check pending syncs', error as Error);
      }
    };
    
    // Check initially and then every 30 seconds
    checkPendingSyncs();
    const interval = setInterval(checkPendingSyncs, 30000);
    
    performance.end();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);
  
  // Determine status and message
  let status: 'online' | 'offline' | 'syncing' | 'error' = 'offline';
  let message = 'Offline';
  
  if (isOnline) {
    if (connectionStatus === 'connected') {
      status = 'online';
      message = 'Online';
      
      if (pendingSyncs > 0) {
        status = 'syncing';
        message = `Syncing ${pendingSyncs} item${pendingSyncs === 1 ? '' : 's'}...`;
      }
    } else if (connectionStatus === 'connecting') {
      status = 'syncing';
      message = 'Connecting...';
    } else {
      status = 'error';
      message = 'Connection error';
    }
  }
  
  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    syncing: 'bg-blue-500',
    error: 'bg-red-500',
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} mr-2`}></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
    </div>
  );
};

export default SyncStatusIndicator;