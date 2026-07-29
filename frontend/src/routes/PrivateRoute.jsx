import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — protects a route by checking authentication and optionally role.
 *
 * HOW IT WORKS:
 *   1. Reads isAuthenticated + userRole from AuthContext.
 *   2. If not logged in  → redirects to /login (replaces history entry).
 *   3. If logged in but wrong role → redirects to correct dashboard.
 *   4. Otherwise → renders the child component.
 *
 * USAGE:
 *   <Route
 *     path="/customer/home"
 *     element={
 *       <PrivateRoute allowedRoles={['customer']}>
 *         <CustomerHome />
 *       </PrivateRoute>
 *     }
 *   />
 *
 * @param {React.ReactNode} children       - The protected page component
 * @param {string[]}        allowedRoles   - Optional: roles that may access this route
 */
function PrivateRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, userRole } = useAuth();

  // ── Step 1: Not logged in at all ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Step 2: Logged in but wrong role ─────────────────────────────────────────
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect them to their own dashboard instead of showing a blank/403
    const fallback =
      userRole === 'provider' ? '/provider/dashboard' : '/customer/home';
    return <Navigate to={fallback} replace />;
  }

  // ── Step 3: Authenticated + correct role → render the page ───────────────────
  return children;
}

export default PrivateRoute;
