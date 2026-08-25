import { NavLink, Outlet, Link } from 'react-router-dom';
import { Clapperboard, Tags, Users, CreditCard, Wallet, Receipt, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-gold-400/15 text-gold-300' : 'text-paper-300 hover:bg-ink-800',
  );

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-56 lg:shrink-0">
        <Link to="/" className="mb-6 flex items-center gap-1.5 text-sm text-paper-500 hover:text-paper-100">
          <ArrowLeft className="size-4" aria-hidden />
          Back to site
        </Link>
        <h1 className="mb-4 font-display text-2xl tracking-wide text-paper-100">Admin</h1>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          <NavLink to="/admin/movies" className={linkClass}>
            <Clapperboard className="size-4" aria-hidden />
            Movies
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            <Tags className="size-4" aria-hidden />
            Categories
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <Users className="size-4" aria-hidden />
            Users
          </NavLink>
          <NavLink to="/admin/plans" className={linkClass}>
            <CreditCard className="size-4" aria-hidden />
            Plans
          </NavLink>
          <NavLink to="/admin/subscriptions" className={linkClass}>
            <Wallet className="size-4" aria-hidden />
            Subscriptions
          </NavLink>
          <NavLink to="/admin/payments" className={linkClass}>
            <Receipt className="size-4" aria-hidden />
            Payments
          </NavLink>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}


