import { useEffect, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  Clapperboard,
  Tags,
  Users,
  CreditCard,
  Wallet,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import { clsx } from "clsx";

// Phones: pill-shaped tabs in a swipeable row (44px tall). lg+: the vertical sidebar.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "flex min-h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition duration-100 active:scale-95",
    "lg:min-h-10 lg:rounded-md lg:border-transparent lg:px-3",
    isActive
      ? "border-gold-400/50 bg-gold-400/15 text-gold-300"
      : "border-ink-600 bg-ink-800 text-paper-300 active:bg-ink-700 lg:bg-transparent lg:hover:bg-ink-800",
  );

export function AdminLayout() {
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // Keep the current tab visible when the pill row is scrolled sideways.
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
  }, [pathname]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
      <aside className="min-w-0 lg:w-56 lg:shrink-0">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-0 lg:flex-col lg:items-start lg:justify-start">
          <h1 className="order-1 font-display text-2xl tracking-wide text-paper-100 lg:order-2 lg:mb-4">
            Admin
          </h1>
          <Link
            to="/"
            className="order-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-paper-300 transition duration-100 hover:text-paper-100 active:bg-ink-800 lg:order-1 lg:mb-4 lg:min-h-9 lg:px-0 lg:text-paper-500"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </Link>
        </div>
        <nav
          ref={navRef}
          aria-label="Admin sections"
          className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
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
