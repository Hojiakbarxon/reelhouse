import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserRole } from '@/api/types';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'text-sm font-medium transition-colors hover:text-gold-300',
    isActive ? 'text-gold-400' : 'text-paper-300',
  );

export function Navbar() {
  const [open, setOpen] = useState(false);
  const isValid = useAuthStore((s) => s.isTokenValid());
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();

  const isStaff = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Film className="size-6 text-gold-400" aria-hidden />
          <span className="font-display text-2xl tracking-wide text-paper-100">REELHOUSE</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Browse
          </NavLink>
          <NavLink to="/plans" className={navLinkClass}>
            Plans
          </NavLink>
          {isValid && (
            <NavLink to="/favourites" className={navLinkClass}>
              My List
            </NavLink>
          )}
          {isStaff && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isValid ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-md border border-ink-600 px-3 py-1.5 text-sm text-paper-100 hover:border-gold-400"
              >
                <User className="size-4" aria-hidden />
                {me?.username ?? 'Account'}
                {isStaff && <ShieldCheck className="size-3.5 text-gold-400" aria-hidden />}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-paper-500 hover:text-crimson-400"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-paper-100 hover:text-gold-300">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
              >
                Join now
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-paper-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-700 bg-ink-900 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>
              Browse
            </NavLink>
            <NavLink to="/plans" className={navLinkClass} onClick={() => setOpen(false)}>
              Plans
            </NavLink>
            {isValid && (
              <NavLink to="/favourites" className={navLinkClass} onClick={() => setOpen(false)}>
                My List
              </NavLink>
            )}
            {isStaff && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}
            <div className="mt-2 flex flex-col gap-3 border-t border-ink-700 pt-4">
              {isValid ? (
                <>
                  <Link to="/account" className={navLinkClass({ isActive: false })} onClick={() => setOpen(false)}>
                    {me?.username ?? 'Account'}
                  </Link>
                  <button onClick={handleLogout} className="text-left text-sm text-crimson-400">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={navLinkClass({ isActive: false })} onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="w-fit rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950"
                    onClick={() => setOpen(false)}
                  >
                    Join now
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}


