import type { ReportHandler } from 'web-vitals';

/**
 * Performance monitoring utility for tracking Core Web Vitals and custom metrics
 * Enhanced for production deployment with remote logging capabilities
 */

// Performance configuration
interface PerformanceConfig {
  enabled: boolean;
  reportingEndpoint?: string;
  samplingRate: number;
  includeAllMetrics: boolean;
  logToConsole: boolean;
}

// Default configuration
const config: PerformanceConfig = {
  enabled: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
  reportingEndpoint: import.meta.env.VITE_PERFORMANCE_ENDPOINT,
  samplingRate: 0.1, // Sample 10% of users in production
  includeAllMetrics: import.meta.env.DEV ? true : false,
  logToConsole: import.meta.env.DEV ? true : false,
};

// Custom performance marks
const PERFORMANCE_MARKS = {
  APP_LOAD_START: 'app-load-start',
  APP_LOAD_END: 'app-load-end',
  CONTENT_GENERATION_START: 'content-generation-start',
  CONTENT_GENERATION_END: 'content-generation-end',
  API_REQUEST_START: 'api-request-start',
  API_REQUEST_END: 'api-request-end',
  FRAMING_ANALYSIS_START: 'framing-analysis-start',
  FRAMING_ANALYSIS_END: 'framing-analysis-end',
  DOCUMENT_SEARCH_START: 'document-search-start',
  DOCUMENT_SEARCH_END: 'document-search-end',
  RENDER_START: 'render-start',
  RENDER_END: 'render-end',
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (customConfig?: Partial<PerformanceConfig>): void => {
  // Apply custom configuration if provided
  Object.assign(config, customConfig);

  // Only enable for sampled users in production
  if (!config.enabled || (!import.meta.env.DEV && Math.random() > config.samplingRate)) {
    return;
  }

  // Register performance observers
  registerPerformanceObservers();

  // Start measuring app load time
  measureAppLoad();

  // Log initialization
  if (config.logToConsole) {
    console.log('[Performance] Monitoring initialized', {
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
      sampling: config.samplingRate,
    });
  }
};

/**
 * Register performance observers for long tasks and resource timing
 */
const registerPerformanceObservers = (): void => {
  try {
    // Observe long tasks (tasks that block the main thread for more than 50ms)
    if ('PerformanceObserver' in window) {
      // Long Task Observer
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const taskDuration = entry.duration;
          if (taskDuration > 100) { // Only report tasks longer than 100ms
            logPerformanceMetric('long-task', taskDuration, {
              startTime: entry.startTime,
              name: entry.name,
              entryType: entry.entryType,
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Resource Timing Observer
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Only track resources that take longer than 1000ms to load
          if (entry.duration > 1000) {
            logPerformanceMetric('slow-resource', entry.duration, {
              name: entry.name,
              initiatorType: (entry as PerformanceResourceTiming).initiatorType,
              size: (entry as PerformanceResourceTiming).transferSize,
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Layout Shift Observer
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Layout shifts have a 'value' property but it's not in the PerformanceEntry type
          // We need to cast to any to access it
          const layoutShift = entry as any;
          if (layoutShift && typeof layoutShift.value === 'number' && layoutShift.value > 0.1) {
            logPerformanceMetric('layout-shift', layoutShift.value, {
              startTime: entry.startTime,
            });
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (error) {
    console.error('Failed to register performance observers:', error);
  }
};

/**
 * Report web vitals metrics to analytics
 */
export const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (!config.enabled) return;

  const sendToAnalytics: ReportHandler = (metric) => {
    // Send to custom handler if provided
    if (onPerfEntry && onPerfEntry instanceof Function) {
      onPerfEntry(metric);
    }

    // Log the metric
    logPerformanceMetric(`web-vital-${metric.name.toLowerCase()}`, metric.value, {
      id: metric.id,
      name: metric.name,
      delta: metric.delta,
      rating: metric.rating,
    });
  };

  // Import and register web vitals
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(sendToAnalytics); // Cumulative Layout Shift
      onFID(sendToAnalytics); // First Input Delay
      onFCP(sendToAnalytics); // First Contentful Paint
      onLCP(sendToAnalytics); // Largest Contentful Paint
      onTTFB(sendToAnalytics); // Time to First Byte
      onINP(sendToAnalytics); // Interaction to Next Paint
    });
  }
};

/**
 * Start performance measurement
 */
export const startMeasurement = (markName: string): void => {
  if (!config.enabled) return;

  try {
    performance.mark(markName);
  } catch (error) {
    console.error(`Failed to start performance measurement: ${markName}`, error);
  }
};

/**
 * End performance measurement and record metric
 */
export const endMeasurement = (startMarkName: string, endMarkName: string, measureName: string): number | null => {
  if (!config.enabled) return null;

  try {
    performance.mark(endMarkName);
    performance.measure(measureName, startMarkName, endMarkName);
    
    const entries = performance.getEntriesByName(measureName);
    const duration = entries.length > 0 ? entries[0].duration : null;
    
    // Log the performance metric
    logPerformanceMetric(measureName, duration);
    
    return duration;
  } catch (error) {
    console.error(`Failed to end performance measurement: ${measureName}`, error);
    return null;
  }
};

/**
 * Log performance metric to analytics service
 */
const logPerformanceMetric = (metricName: string, value: number | null, additionalData: Record<string, any> = {}): void => {
  if (!config.enabled || value === null) return;

  // Log to console in development
  if (config.logToConsole) {
    console.log(`[Performance] ${metricName}: ${value}${typeof value === 'number' && value > 0 ? 'ms' : ''}`);
  }

  // Send to remote endpoint if configured
  if (config.reportingEndpoint) {
    const payload = {
      metricName,
      value,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
      environment: import.meta.env.MODE,
      ...additionalData,
    };

    // Use sendBeacon for better reliability during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(config.reportingEndpoint, blob);
    } else {
      // Fallback to fetch
      fetch(config.reportingEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // Keep the request alive even if the page is unloading
      }).catch(error => {
        if (config.logToConsole) {
          console.error('Failed to send performance metric:', error);
        }
      });
    }
  }
};

/**
 * Measure app load time
 */
export const measureAppLoad = (): void => {
  if (!config.enabled) return;

  startMeasurement(PERFORMANCE_MARKS.APP_LOAD_START);
  
  window.addEventListener('load', () => {
    endMeasurement(
      PERFORMANCE_MARKS.APP_LOAD_START,
      PERFORMANCE_MARKS.APP_LOAD_END,
      'app-load-time'
    );

    // Report navigation timing metrics
    reportNavigationTiming();
  });
};

/**
 * Report navigation timing metrics
 */
const reportNavigationTiming = (): void => {
  if (!config.enabled) return;

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      // DNS lookup time
      logPerformanceMetric('dns-lookup-time', navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart);
      
      // TCP connection time
      logPerformanceMetric('tcp-connection-time', navigationEntry.connectEnd - navigationEntry.connectStart);
      
      // TLS negotiation time
      if (navigationEntry.secureConnectionStart > 0) {
        logPerformanceMetric('tls-negotiation-time', navigationEntry.connectEnd - navigationEntry.secureConnectionStart);
      }
      
      // Time to first byte
      logPerformanceMetric('ttfb', navigationEntry.responseStart - navigationEntry.requestStart);
      
      // Document download time
      logPerformanceMetric('document-download-time', navigationEntry.responseEnd - navigationEntry.responseStart);
      
      // DOM processing time
      logPerformanceMetric('dom-processing-time', navigationEntry.domComplete - navigationEntry.responseEnd);
      
      // Page load time (from navigation start to load event)
      logPerformanceMetric('page-load-time', navigationEntry.loadEventEnd - navigationEntry.startTime);
    }
  } catch (error) {
    console.error('Failed to report navigation timing metrics:', error);
  }
};

/**
 * Measure content generation time
 */
export const measureContentGeneration = (): { start: () => void; end: () => number | null } => {
  return {
    start: () => startMeasurement(PERFORMANCE_MARKS.CONTENT_GENERATION_START),
    end: () => endMeasurement(
      PERFORMANCE_MARKS.CONTENT_GENERATION_START,
      PERFORMANCE_MARKS.CONTENT_GENERATION_END,
      'content-generation-time'
    ),
  };
};

/**
 * Measure API request time
 */
export const measureApiRequest = (): { start: () => void; end: () => number | null } => {
  return {
    start: () => startMeasurement(PERFORMANCE_MARKS.API_REQUEST_START),
    end: () => endMeasurement(
      PERFORMANCE_MARKS.API_REQUEST_START,
      PERFORMANCE_MARKS.API_REQUEST_END,
      'api-request-time'
    ),
  };
};

/**
 * Measure framing analysis time
 */
export const measureFramingAnalysis = (): { start: () => void; end: () => number | null } => {
  return {
    start: () => startMeasurement(PERFORMANCE_MARKS.FRAMING_ANALYSIS_START),
    end: () => endMeasurement(
      PERFORMANCE_MARKS.FRAMING_ANALYSIS_START,
      PERFORMANCE_MARKS.FRAMING_ANALYSIS_END,
      'framing-analysis-time'
    ),
  };
};

/**
 * Measure document search time
 */
export const measureDocumentSearch = (): { start: () => void; end: () => number | null } => {
  return {
    start: () => startMeasurement(PERFORMANCE_MARKS.DOCUMENT_SEARCH_START),
    end: () => endMeasurement(
      PERFORMANCE_MARKS.DOCUMENT_SEARCH_START,
      PERFORMANCE_MARKS.DOCUMENT_SEARCH_END,
      'document-search-time'
    ),
  };
};

/**
 * Measure component render time
 */
export const measureRender = (componentName: string): { start: () => void; end: () => number | null } => {
  const startMark = `${PERFORMANCE_MARKS.RENDER_START}_${componentName}`;
  const endMark = `${PERFORMANCE_MARKS.RENDER_END}_${componentName}`;
  const measureName = `render-time-${componentName}`;
  
  return {
    start: () => startMeasurement(startMark),
    end: () => endMeasurement(startMark, endMark, measureName),
  };
};

/**
 * Track a custom performance metric
 */
export const trackCustomMetric = (name: string, value: number, additionalData: Record<string, any> = {}): void => {
  if (!config.enabled) return;
  
  logPerformanceMetric(`custom-${name}`, value, additionalData);
};

/**
 * Get all performance metrics
 */
export const getAllPerformanceMetrics = (): PerformanceEntryList => {
  return performance.getEntries();
};

/**
 * Clear all performance marks and measures
 */
export const clearPerformanceMetrics = (): void => {
  performance.clearMarks();
  performance.clearMeasures();
};

/**
 * Update performance monitoring configuration
 */
export const updatePerformanceConfig = (newConfig: Partial<PerformanceConfig>): void => {
  Object.assign(config, newConfig);
};

export default {
  PERFORMANCE_MARKS,
  initPerformanceMonitoring,
  reportWebVitals,
  startMeasurement,
  endMeasurement,
  measureAppLoad,
  measureContentGeneration,
  measureApiRequest,
  measureFramingAnalysis,
  measureDocumentSearch,
  measureRender,
  trackCustomMetric,
  getAllPerformanceMetrics,
  clearPerformanceMetrics,
  updatePerformanceConfig,
};