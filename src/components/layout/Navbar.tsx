import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Film,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  Clapperboard,
  CreditCard,
  Heart,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@/api/types";
import { buttonClass } from "../ui/button-styles";
import { Button } from "../ui/Button";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "text-sm font-medium transition-colors hover:text-gold-300",
    isActive ? "text-gold-400" : "text-paper-300",
  );

export function Navbar() {
  const [open, setOpen] = useState(false);
  const isValid = useAuthStore((s) => s.isTokenValid());
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: me } = useCurrentUser();

  const isStaff =
    me?.role === UserRole.ADMIN || me?.role === UserRole.SUPERADMIN;

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    close();
    navigate("/");
  }

  // Close the menu on any route change (including browser back/forward).
  // Done during render ("adjust state when a value changes") rather than in an
  // effect, so there is no extra render with the menu still open.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // While the menu is open: lock page scroll behind it, let Escape close it,
  // and close it if the screen grows to desktop width (e.g. phone rotated).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mql = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (mql.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mql.addEventListener("change", onResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" onClick={close}>
            <Film className="size-6 text-gold-400" aria-hidden />
            <span className="font-display text-xl tracking-wide text-paper-100 sm:text-2xl">
              REELHOUSE
            </span>
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
                  className="flex items-center gap-2 rounded-md border border-ink-600 px-3 py-1.5 text-sm text-paper-100 transition hover:border-gold-400 active:bg-ink-700"
                >
                  <User className="size-4" aria-hidden />
                  {me?.username ?? "Account"}
                  {isStaff && (
                    <ShieldCheck
                      className="size-3.5 text-gold-400"
                      aria-hidden
                    />
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-paper-500 transition hover:text-crimson-400 active:bg-ink-800"
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-paper-100 hover:text-gold-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-300 active:bg-gold-500"
                >
                  Join now
                </Link>
              </>
            )}
          </div>

          {/* Phones: guests get "Sign in" right in the header (one tap, not two),
              next to a 44px menu button. */}
          <div className="flex items-center gap-2 md:hidden">
            {!isValid && (
              <Link
                to="/login"
                className={buttonClass({ variant: "primary", size: "sm" })}
                onClick={close}
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-md border border-ink-600 text-paper-100 transition duration-100 active:scale-90 active:bg-ink-700"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? (
                <X className="size-6" aria-hidden />
              ) : (
                <Menu className="size-6" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu is a sibling of <header> on purpose: the header's backdrop-blur
          would otherwise become the containing block for this fixed panel. */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-ink-700 bg-ink-900 md:hidden"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex min-h-full max-w-md flex-col gap-2 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
          >
            <MobileLink to="/" end icon={Clapperboard} onNavigate={close}>
              Browse
            </MobileLink>
            <MobileLink to="/plans" icon={CreditCard} onNavigate={close}>
              Plans
            </MobileLink>
            {isValid && (
              <MobileLink to="/favourites" icon={Heart} onNavigate={close}>
                My List
              </MobileLink>
            )}

            {isStaff && (
              <Link
                to="/admin"
                onClick={close}
                className="mt-2 flex min-h-14 items-center gap-3 rounded-xl bg-gold-400 px-4 text-base font-semibold text-ink-950 transition duration-100 active:scale-[0.98] active:bg-gold-500"
              >
                <ShieldCheck className="size-5 shrink-0" aria-hidden />
                <span className="flex-1">Admin panel</span>
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            )}

            <div className="mt-auto flex flex-col gap-3 border-t border-ink-700 pt-4">
              {isValid ? (
                <>
                  <Link
                    to="/account"
                    onClick={close}
                    className="flex min-h-16 items-center gap-3 rounded-xl border border-ink-700 bg-ink-800 px-4 transition duration-100 active:scale-[0.98] active:bg-ink-700"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700 text-paper-500">
                      {me?.avatar_url ? (
                        <img
                          src={me.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="size-5" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-paper-100">
                        {me?.username ?? "My account"}
                      </span>
                      <span className="block truncate text-xs text-paper-500">
                        Account &amp; security
                      </span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-paper-500"
                      aria-hidden
                    />
                  </Link>
                  <Button
                    variant="dangerOutline"
                    size="lg"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-5" aria-hidden />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={close}
                    className={buttonClass({
                      variant: "primary",
                      size: "lg",
                      className: "w-full",
                    })}
                  >
                    Join now
                  </Link>
                  <Link
                    to="/login"
                    onClick={close}
                    className={buttonClass({
                      variant: "secondary",
                      size: "lg",
                      className: "w-full",
                    })}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function MobileLink({
  to,
  end,
  icon: Icon,
  onNavigate,
  children,
}: {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        clsx(
          "flex min-h-14 items-center gap-3 rounded-xl border px-4 text-base font-medium transition duration-100 active:scale-[0.98]",
          isActive
            ? "border-gold-500/40 bg-gold-400/10 text-gold-300"
            : "border-ink-700 bg-ink-800 text-paper-100 active:bg-ink-700",
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="flex-1">{children}</span>
      <ChevronRight className="size-4 shrink-0 text-paper-500" aria-hidden />
    </NavLink>
  );
}
