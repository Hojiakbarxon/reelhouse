import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Spinner } from '@/components/ui/Feedback';
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

// Role now lives only on the User record (GET /users/:id), not in the JWT,
// so these guards resolve it via useCurrentUser before deciding — showing a
// brief spinner rather than flashing a redirect before we actually know.
export function RequireAdmin() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  const location = useLocation();
  const { data: me, isLoading, isError } = useCurrentUser();

  if (!isValid) return <Navigate to="/login" replace state={{ from: location }} />;
  if (isLoading) return <Spinner label="Checking access" />;
  if (isError || !me || (me.role !== UserRole.ADMIN && me.role !== UserRole.SUPERADMIN)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function RequireSuperAdmin() {
  const isValid = useAuthStore((s) => s.isTokenValid());
  const location = useLocation();
  const { data: me, isLoading, isError } = useCurrentUser();

  if (!isValid) return <Navigate to="/login" replace state={{ from: location }} />;
  if (isLoading) return <Spinner label="Checking access" />;
  if (isError || !me || me.role !== UserRole.SUPERADMIN) return <Navigate to="/" replace />;
  return <Outlet />;
}