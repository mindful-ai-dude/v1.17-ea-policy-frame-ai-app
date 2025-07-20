import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // For testing purposes, we'll always consider the user authenticated
  // In a real app, you would check if the user is authenticated
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;