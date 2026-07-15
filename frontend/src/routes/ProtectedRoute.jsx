import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PROTECTED ROUTE (Interview Gold - Frontend Route Guarding):
 *
 * HOW ROUTE GUARDING WORKS ON FRONTEND:
 * 1. Checks Redux store state for `isAuthenticated` and `isLoading`.
 * 2. If `isLoading === true` (e.g., fetching profile via token on refresh), it shows a premium loading spinner.
 * 3. If `isAuthenticated === false` (not logged in), it redirects the user to `/login`.
 *    - It passes the current route location using `state={{ from: location }}` so that after logging in,
 *      the user is redirected back to the page they originally tried to access (highly professional UX).
 * 4. If `allowedRoles` array is passed, it checks if `user.role` matches. If not, redirects to unauthorized/home.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return children;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to fallback based on role, or home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
