/**
 * Local storage cache utility for offline support and performance optimization
 * Provides a simple API for storing and retrieving data with expiration
 */

// Cache item structure
interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp in milliseconds or null for no expiration
  version: string; // App version when cached, used for cache invalidation on updates
}

// Cache configuration
interface CacheConfig {
  prefix: string;
  defaultExpiry: number | null; // Default expiration time in milliseconds
  version: string; // Current app version
}

// Default configuration
const defaultConfig: CacheConfig = {
  prefix: 'ea-policyframe-',
  defaultExpiry: 24 * 60 * 60 * 1000, // 24 hours
  version: import.meta.env.VITE_APP_VERSION || '0.0.0',
};

// Current configuration
let config: CacheConfig = { ...defaultConfig };

/**
 * Configure the cache
 * @param newConfig - Partial configuration to merge with current config
 */
export const configureCache = (newConfig: Partial<CacheConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Get the full key with prefix
 * @param key - Cache key
 * @returns Full key with prefix
 */
const getFullKey = (key: string): string => {
  return `${config.prefix}${key}`;
};

/**
 * Set an item in the cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param expiry - Optional expiration time in milliseconds
 * @returns True if successful, false otherwise
 */
export const setItem = <T>(key: string, value: T, expiry: number | null = config.defaultExpiry): boolean => {
  try {
    const fullKey = getFullKey(key);
    const item: CacheItem<T> = {
      value,
      expiry: expiry ? Date.now() + expiry : null,
      version: config.version,
    };
    
    localStorage.setItem(fullKey, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Failed to set cache item:', error);
    return false;
  }
};

/**
 * Get an item from the cache
 * @param key - Cache key
 * @returns Cached value or null if not found or expired
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const fullKey = getFullKey(key);
    const json = localStorage.getItem(fullKey);
    
    if (!json) return null;
    
    const item: CacheItem<T> = JSON.parse(json);
    
    // Check version - invalidate if app version changed
    if (item.version !== config.version) {
      removeItem(key);
      return null;
    }
    
    // Check expiration
    if (item.expiry && Date.now() > item.expiry) {
      removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error('Failed to get cache item:', error);
    return null;
  }
};

/**
 * Remove an item from the cache
 * @param key - Cache key
 * @returns True if successful, false otherwise
 */
export const removeItem = (key: string): boolean => {
  try {
    const fullKey = getFullKey(key);
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error('Failed to remove cache item:', error);
    return false;
  }
};

/**
 * Clear all cached items
 * @param onlyExpired - If true, only clear expired items
 * @returns Number of items cleared
 */
export const clearCache = (onlyExpired: boolean = false): number => {
  try {
    let count = 0;
    
    // If clearing all items
    if (!onlyExpired) {
      const keysToRemove: string[] = [];
      
      // Find all keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all matching keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        count++;
      });
      
      return count;
    }
    
    // If only clearing expired items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(config.prefix)) {
        try {
          const json = localStorage.getItem(key);
          if (json) {
            const item = JSON.parse(json);
            
            // Check version or expiration
            if (item.version !== config.version || (item.expiry && Date.now() > item.expiry)) {
              localStorage.removeItem(key);
              count++;
            }
          }
        } catch (e) {
          // If we can't parse the item, remove it
          localStorage.removeItem(key);
          count++;
        }
      }
    }
    
    return count;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return 0;
  }
};

/**
 * Get cache stats
 * @returns Object with cache statistics
 */
export const getCacheStats = (): { totalItems: number, totalSize: number, expiredItems: number } => {
  try {
    let totalItems = 0;
    let totalSize = 0;
    let expiredItems = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(config.prefix)) {
        const json = localStorage.getItem(key);
        if (json) {
          totalItems++;
          totalSize += json.length * 2; // Approximate size in bytes (2 bytes per character)
          
          try {
            const item = JSON.parse(json);
            if (item.version !== config.version || (item.expiry && Date.now() > item.expiry)) {
              expiredItems++;
            }
          } catch (e) {
            // If we can't parse the item, count it as expired
            expiredItems++;
          }
        }
      }
    }
    
    return { totalItems, totalSize, expiredItems };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { totalItems: 0, totalSize: 0, expiredItems: 0 };
  }
};

export default {
  configure: configureCache,
  setItem,
  getItem,
  removeItem,
  clearCache,
  getCacheStats,
};