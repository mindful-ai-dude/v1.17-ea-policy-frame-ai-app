import { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useAppStore } from './store/useAppStore';
import './App.css';

// Import performance monitoring
import { startMeasurement, endMeasurement } from './utils/performanceMonitoring';
import { setupLazyLoading, preloadCriticalImages } from './utils/imageOptimization';

// Lazy load components for better performance
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner'));
const GlassCard = lazy(() => import('./components/GlassCard'));

// Lazy load all pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Library = lazy(() => import('./pages/Library'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const GlassmorphicDemo = lazy(() => import('./pages/GlassmorphicDemo'));
const GenerationDashboard = lazy(() => import('./pages/GenerationDashboard'));
const OutputDisplay = lazy(() => import('./pages/OutputDisplay'));

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="glass-card p-8 text-center">
      <div className="loading-spinner loading-lg"></div>
      <p className="text-white mt-4">Loading page...</p>
    </div>
  </div>
);

// Lightweight initial loader (no dependencies)
const InitialLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="p-8 text-center bg-blue-900/30 backdrop-blur-xl rounded-xl">
      <div className="w-12 h-12 border-4 border-t-blue-400 border-blue-200/30 rounded-full animate-spin mx-auto"></div>
      <p className="text-white mt-4">Loading EA PolicyFrame App...</p>
    </div>
  </div>
);

function App() {
  const { checkAuth, isLoading } = useAppStore();
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Check authentication status on app load
  useEffect(() => {
    // Start measuring component mount time
    startMeasurement('app-component-mount');
    
    // Check authentication
    checkAuth();
    
    // Setup lazy loading for images
    setupLazyLoading();
    
    // Preload critical images
    preloadCriticalImages([
      // Add paths to critical images here
      '/vite.svg',
    ]);
    
    // Mark app as ready after a short delay to ensure smooth transitions
    const readyTimer = setTimeout(() => {
      setIsAppReady(true);
      endMeasurement('app-component-mount', 'app-ready', 'app-ready-time');
    }, 100);
    
    return () => clearTimeout(readyTimer);
  }, [checkAuth]);
  
  // Show initial loading state
  if (isLoading || !isAppReady) {
    return <InitialLoader />;
  }
  
  return (
    <ConvexProvider client={convex}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Landing />
                  </Suspense>
                } 
              />
              
              <Route 
                path="/login" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                } 
              />
              
              <Route 
                path="/demo" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <GlassmorphicDemo />
                  </Suspense>
                } 
              />
              
              {/* Protected routes with MainLayout */}
              <Route 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MainLayout />
                  </Suspense>
                }
              >
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Dashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Settings />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/library" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Library />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/generate" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <GenerationDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/output/:id" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <OutputDisplay />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              {/* 404 route */}
              <Route 
                path="/404" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                } 
              />
              
              {/* Redirect all other routes to 404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </Router>
    </ConvexProvider>
  );
}

export default App;