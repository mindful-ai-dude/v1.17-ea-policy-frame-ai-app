import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import localStorageCache from '../utils/localStorageCache';
import logger from '../utils/logger';

// Logger instance for this hook
const log = logger.createScoped('useConvexSync');

// Types for pending sync operations
interface PendingSyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

/**
 * Hook for managing Convex synchronization
 * Handles offline operations and synchronization when back online
 */
export function useConvexSync() {
  // Track online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Track pending sync operations
  const [pendingSyncs, setPendingSyncs] = useState<PendingSyncOperation[]>([]);
  
  // Track sync status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  // Convex mutations
  const createDocument = useMutation(api.content.create);
  const updateDocument = useMutation(api.content.update);
  const deleteDocument = useMutation(api.content.remove);
  
  // Load pending syncs from storage
  useEffect(() => {
    const loadPendingSyncs = () => {
      const storedSyncs = localStorageCache.getItem<PendingSyncOperation[]>('pendingSyncs');
      if (storedSyncs) {
        setPendingSyncs(storedSyncs);
        log.info(`Loaded ${storedSyncs.length} pending sync operations`);
      }
    };
    
    loadPendingSyncs();
  }, []);
  
  // Save pending syncs to storage whenever they change
  useEffect(() => {
    if (pendingSyncs.length > 0) {
      localStorageCache.setItem('pendingSyncs', pendingSyncs);
      // Also store a simple count for the indicator component
      localStorage.setItem('pendingSyncCount', pendingSyncs.length.toString());
    } else {
      localStorageCache.removeItem('pendingSyncs');
      localStorage.removeItem('pendingSyncCount');
    }
  }, [pendingSyncs]);
  
  // Update online status when network status changes
  useEffect(() => {
    const handleOnline = () => {
      log.info('Device went online');
      setIsOnline(true);
      // Trigger sync when we go online
      syncPendingOperations();
    };
    
    const handleOffline = () => {
      log.info('Device went offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Function to add a pending sync operation
  const addPendingOperation = useCallback((operation: Omit<PendingSyncOperation, 'id' | 'timestamp'>) => {
    const newOperation: PendingSyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    setPendingSyncs(prev => [...prev, newOperation]);
    log.info(`Added pending ${operation.type} operation for ${operation.table}`);
    
    return newOperation.id;
  }, []);
  
  // Function to remove a pending sync operation
  const removePendingOperation = useCallback((id: string) => {
    setPendingSyncs(prev => prev.filter(op => op.id !== id));
    log.info(`Removed pending operation ${id}`);
  }, []);
  
  // Function to sync pending operations with Convex
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingSyncs.length === 0 || syncStatus === 'syncing') {
      return;
    }
    
    setSyncStatus('syncing');
    log.info(`Starting sync of ${pendingSyncs.length} pending operations`);
    
    // Sort operations by timestamp to maintain order
    const sortedOperations = [...pendingSyncs].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of sortedOperations) {
      try {
        switch (operation.type) {
          case 'create':
            await createDocument(operation.data);
            break;
          case 'update':
            await updateDocument(operation.data);
            break;
          case 'delete':
            await deleteDocument({ id: operation.data.id });
            break;
        }
        
        // Remove from pending operations if successful
        removePendingOperation(operation.id);
        log.info(`Successfully synced operation ${operation.id}`);
      } catch (error) {
        log.error(`Failed to sync operation ${operation.id}`, error as Error);
        // Keep the operation in the queue to try again later
      }
    }
    
    setSyncStatus('idle');
  }, [isOnline, pendingSyncs, syncStatus, createDocument, updateDocument, deleteDocument, removePendingOperation]);
  
  // Trigger sync when online status changes or pending syncs change
  useEffect(() => {
    if (isOnline && pendingSyncs.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline, pendingSyncs.length, syncPendingOperations]);
  
  // Create a document with offline support
  const createWithOfflineSupport = useCallback(async (table: string, data: any) => {
    if (isOnline) {
      try {
        // Try to create directly
        const result = await createDocument(data);
        log.info(`Created document in ${table}`);
        return result;
      } catch (error) {
        // If fails, add to pending operations
        log.warn(`Failed to create document in ${table}, adding to pending operations`, error as Error);
        const operationId = addPendingOperation({
          type: 'create',
          table,
          data,
        });
        return { _id: operationId, _creationTime: Date.now() };
      }
    } else {
      // If offline, add to pending operations
      log.info(`Offline: Adding create operation for ${table} to pending operations`);
      const operationId = addPendingOperation({
        type: 'create',
        table,
        data,
      });
      return { _id: operationId, _creationTime: Date.now() };
    }
  }, [isOnline, createDocument, addPendingOperation]);
  
  // Update a document with offline support
  const updateWithOfflineSupport = useCallback(async (table: string, id: string, data: any) => {
    if (isOnline) {
      try {
        // Try to update directly
        const result = await updateDocument({ id, ...data });
        log.info(`Updated document ${id} in ${table}`);
        return result;
      } catch (error) {
        // If fails, add to pending operations
        log.warn(`Failed to update document ${id} in ${table}, adding to pending operations`, error as Error);
        addPendingOperation({
          type: 'update',
          table,
          data: { id, ...data },
        });
        return false;
      }
    } else {
      // If offline, add to pending operations
      log.info(`Offline: Adding update operation for ${id} in ${table} to pending operations`);
      addPendingOperation({
        type: 'update',
        table,
        data: { id, ...data },
      });
      return true;
    }
  }, [isOnline, updateDocument, addPendingOperation]);
  
  // Delete a document with offline support
  const deleteWithOfflineSupport = useCallback(async (table: string, id: string) => {
    if (isOnline) {
      try {
        // Try to delete directly
        const result = await deleteDocument({ id });
        log.info(`Deleted document ${id} from ${table}`);
        return result;
      } catch (error) {
        // If fails, add to pending operations
        log.warn(`Failed to delete document ${id} from ${table}, adding to pending operations`, error as Error);
        addPendingOperation({
          type: 'delete',
          table,
          data: { id },
        });
        return false;
      }
    } else {
      // If offline, add to pending operations
      log.info(`Offline: Adding delete operation for ${id} in ${table} to pending operations`);
      addPendingOperation({
        type: 'delete',
        table,
        data: { id },
      });
      return true;
    }
  }, [isOnline, deleteDocument, addPendingOperation]);
  
  // Force a sync attempt
  const forceSync = useCallback(() => {
    if (isOnline && pendingSyncs.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline, pendingSyncs.length, syncPendingOperations]);
  
  return {
    isOnline,
    pendingSyncs: pendingSyncs.length,
    syncStatus,
    create: createWithOfflineSupport,
    update: updateWithOfflineSupport,
    remove: deleteWithOfflineSupport,
    forceSync,
  };
}