/**
 * ProtectedRoute — Redirects unauthenticated users to login
 * Waits for auth initialization before rendering (avoids flash)
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsInitialized } from '@features/auth/redux/authSlice';
import PageLoader from '@shared/components/feedback/PageLoader';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized   = useSelector(selectIsInitialized);
  const location        = useLocation();

  // Wait for auth check to complete before making redirect decisions
  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Preserve the intended destination for redirect after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
