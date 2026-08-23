import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/api/types';

export function RequireAuth() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  const location = useLocation();

  if (!isValid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireGuest() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  if (isValid) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (!isValid) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function RequireSuperAdmin() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (!isValid) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== UserRole.SUPERADMIN) return <Navigate to="/" replace />;
  return <Outlet />;
}
