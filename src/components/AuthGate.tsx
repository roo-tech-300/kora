import { Navigate } from 'react-router-dom';
import { LoadingScreen } from './Common';
import { type UserRole } from '../lib/apis/auth/getCurrentUserProfile';
import { resolveUserRoute } from '../lib/apis/auth/resolveUserRoute';
import { useAuth } from '../context/AuthContext';

type AuthGateProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  pendingOnly?: boolean;
  guestOnly?: boolean;
};

export const AuthGate = ({ children, allowedRoles, pendingOnly = false, guestOnly = false }: AuthGateProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Resolving access gate..." />;
  }

  const resolvedRoute = resolveUserRoute(profile);

  if (guestOnly) {
    if (resolvedRoute !== '/login') {
      return <Navigate to={resolvedRoute} replace />;
    }

    return <>{children}</>;
  }

  if (pendingOnly) {
    if (resolvedRoute !== '/pending') {
      return <Navigate to={resolvedRoute} replace />;
    }

    return <>{children}</>;
  }

  if (resolvedRoute === '/pending') {
    return <Navigate to="/pending" replace />;
  }

  if (resolvedRoute === '/login' || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to={resolvedRoute} replace />;
  }

  return <>{children}</>;
};
