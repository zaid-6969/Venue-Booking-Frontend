/**
 * RoleGuard — Prevents access to routes based on user role
 */
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '@features/auth/redux/authSlice';

const ROLE_REDIRECTS = {
  admin:    '/admin/dashboard',
  owner:    '/owner/dashboard',
  customer: '/dashboard',
};

const RoleGuard = ({ children, allowedRoles }) => {
  const role = useSelector(selectUserRole);

  if (!allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard
    const redirect = ROLE_REDIRECTS[role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default RoleGuard;
