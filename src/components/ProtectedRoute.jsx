import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show anything while checking auth
  // AuthProvider already handles loading screen
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected page
  return children;
}

/**
 * Public Route Component
 * Redirects to trading if user is already authenticated
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show anything while checking auth
  if (isLoading) {
    return null;
  }

  // Redirect to trading if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/trading" replace />;
  }

  // User is not authenticated, render the public page
  return children;
}
