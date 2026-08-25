import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RequireAuth, RequireGuest, RequireAdmin } from './guards';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { AdminSuspense } from './AdminSuspense';

import { BrowsePage } from '@/pages/movies/BrowsePage';
import { MovieDetailPage } from '@/pages/movies/MovieDetailPage';
import { PlansPage } from '@/pages/movies/PlansPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ConfirmOtpPage } from '@/pages/auth/ConfirmOtpPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

import { FavouritesPage } from '@/pages/user/FavouritesPage';
import { AccountPage } from '@/pages/user/AccountPage';

// The admin dashboard is a meaningful chunk of code that only admins/superadmins
// ever load — code-split it so regular visitors' initial bundle stays lean.
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminMoviesPage = lazy(() =>
  import('@/pages/admin/movies/AdminMoviesPage').then((m) => ({ default: m.AdminMoviesPage })),
);
const AdminMovieFormPage = lazy(() =>
  import('@/pages/admin/movies/AdminMovieFormPage').then((m) => ({ default: m.AdminMovieFormPage })),
);
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/categories/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/users/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminPlansPage = lazy(() =>
  import('@/pages/admin/plans/AdminPlansPage').then((m) => ({ default: m.AdminPlansPage })),
);
const AdminSubscriptionsPage = lazy(() =>
  import('@/pages/admin/subscriptions/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage })),
);
const AdminPaymentsPage = lazy(() =>
  import('@/pages/admin/payments/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })),
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <BrowsePage /> },
      { path: '/plans', element: <PlansPage /> },

      {
        element: <RequireGuest />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/confirm-otp', element: <ConfirmOtpPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },

      {
        element: <RequireAuth />,
        children: [
          { path: '/movies/:slug', element: <MovieDetailPage /> },
          { path: '/favourites', element: <FavouritesPage /> },
          { path: '/account', element: <AccountPage /> },
        ],
      },

      {
        element: <RequireAdmin />,
        children: [
          {
            path: '/admin',
            element: (
              <AdminSuspense>
                <AdminLayout />
              </AdminSuspense>
            ),
            children: [
              { index: true, element: <Navigate to="movies" replace /> },
              {
                path: 'movies',
                element: (
                  <AdminSuspense>
                    <AdminMoviesPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'movies/new',
                element: (
                  <AdminSuspense>
                    <AdminMovieFormPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'movies/:id/edit',
                element: (
                  <AdminSuspense>
                    <AdminMovieFormPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'categories',
                element: (
                  <AdminSuspense>
                    <AdminCategoriesPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'users',
                element: (
                  <AdminSuspense>
                    <AdminUsersPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'plans',
                element: (
                  <AdminSuspense>
                    <AdminPlansPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'subscriptions',
                element: (
                  <AdminSuspense>
                    <AdminSubscriptionsPage />
                  </AdminSuspense>
                ),
              },
              {
                path: 'payments',
                element: (
                  <AdminSuspense>
                    <AdminPaymentsPage />
                  </AdminSuspense>
                ),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);


