/**
 * Application configuration management
 * Centralizes access to environment variables and configuration settings
 */

// Define the configuration schema with default values and types
interface AppConfig {
  // API configuration
  api: {
    url: string;
    timeout: number;
    rateLimit: number;
  };
  
  // Convex configuration
  convex: {
    url: string;
  };
  
  // Feature flags
  features: {
    analytics: boolean;
    errorReporting: boolean;
    pwa: boolean;
    offlineMode: boolean;
  };
  
  // Security settings
  security: {
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
    xssProtection: boolean;
  };
  
  // Performance monitoring
  performance: {
    enabled: boolean;
    endpoint?: string;
    samplingRate: number;
  };
  
  // Application metadata
  app: {
    version: string;
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
}

// Helper function to parse boolean environment variables
const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

// Helper function to parse numeric environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Create and export the configuration object
export const config: AppConfig = {
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    timeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
    rateLimit: parseNumber(import.meta.env.VITE_API_RATE_LIMIT, 100),
  },
  
  convex: {
    url: import.meta.env.VITE_CONVEX_URL || '',
  },
  
  features: {
    analytics: parseBool(import.meta.env.VITE_ENABLE_ANALYTICS),
    errorReporting: parseBool(import.meta.env.VITE_ENABLE_ERROR_REPORTING),
    pwa: parseBool(import.meta.env.VITE_ENABLE_PWA),
    offlineMode: parseBool(import.meta.env.VITE_ENABLE_OFFLINE_MODE),
  },
  
  security: {
    contentSecurityPolicy: parseBool(import.meta.env.VITE_CONTENT_SECURITY_POLICY),
    strictTransportSecurity: parseBool(import.meta.env.VITE_STRICT_TRANSPORT_SECURITY),
    xssProtection: parseBool(import.meta.env.VITE_XSS_PROTECTION),
  },
  
  performance: {
    enabled: parseBool(import.meta.env.VITE_PERFORMANCE_MONITORING),
    endpoint: import.meta.env.VITE_PERFORMANCE_ENDPOINT,
    samplingRate: parseNumber(import.meta.env.VITE_PERFORMANCE_SAMPLING_RATE, 0.1),
  },
  
  app: {
    version: import.meta.env.VITE_APP_VERSION || '0.0.0',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.DEV === true,
    isProduction: import.meta.env.PROD === true,
    isTest: import.meta.env.MODE === 'test',
  },
};

/**
 * Validate critical configuration settings
 * Logs warnings for missing or invalid configuration
 */
export const validateConfig = (): boolean => {
  const issues: string[] = [];
  
  // Check for critical configuration
  if (!config.convex.url) {
    issues.push('Missing Convex URL (VITE_CONVEX_URL)');
  }
  
  // Log any issues
  if (issues.length > 0) {
    console.error('Configuration validation failed:', issues);
    return false;
  }
  
  return true;
};

export default {
  ...config,
  validate: validateConfig,
};