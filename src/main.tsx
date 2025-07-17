import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './index.css';
import App from './App.tsx';
import performanceMonitoring from './utils/performanceMonitoring';

// Initialize performance monitoring
performanceMonitoring.initPerformanceMonitoring({
  enabled: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
  reportingEndpoint: import.meta.env.VITE_PERFORMANCE_ENDPOINT as string,
  samplingRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development
  includeAllMetrics: import.meta.env.DEV,
  logToConsole: import.meta.env.DEV,
});

// Start measuring app load time
performanceMonitoring.measureAppLoad();

// Initialize Convex client with error handling
let convexUrl = import.meta.env.VITE_CONVEX_URL as string;
if (!convexUrl) {
  console.error('VITE_CONVEX_URL is not defined. Please check your environment variables.');
  convexUrl = 'https://fallback-url.convex.cloud'; // Fallback URL to prevent crash
}
const convex = new ConvexReactClient(convexUrl);

// Register service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// Create a root for React to render into
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id "root" in your HTML.');
}

// Preconnect to critical domains for performance optimization
const preconnectLinks = [
  { rel: 'preconnect', href: convexUrl },
  { rel: 'preconnect', href: 'https://ui-avatars.com' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
];

// Add preconnect links to document head
preconnectLinks.forEach(link => {
  const linkElement = document.createElement('link');
  linkElement.rel = link.rel;
  linkElement.href = link.href;
  if (link.crossOrigin) {
    linkElement.crossOrigin = link.crossOrigin;
  }
  document.head.appendChild(linkElement);
});

// Add meta theme color for PWA
const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#ffffff';
document.head.appendChild(metaThemeColor);

// Render the app with error boundary
try {
  createRoot(rootElement).render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render application:', error);
  // Render a minimal error page
  rootElement.innerHTML = `
    <div style="font-family: system-ui, sans-serif; padding: 2rem; text-align: center;">
      <h1>Something went wrong</h1>
      <p>We're sorry, but the application failed to load. Please try refreshing the page.</p>
      <button onclick="window.location.reload()">Refresh Page</button>
    </div>
  `;
}

// Report web vitals
performanceMonitoring.reportWebVitals();