/**
 * Application Router — Complete Route Configuration
 *
 * Architecture:
 * - createBrowserRouter (React Router v6 data router)
 * - Code splitting via React.lazy on all page-level components
 * - Route guards via ProtectedRoute and RoleGuard wrappers
 * - Layout nesting — all routes share appropriate layouts
 *
 * Route Structure:
 * /                    → PublicLayout
 *   /                  → HomePage
 *   /venues            → VenueListingPage
 *   /venues/:slug      → VenueDetailPage
 *   /search            → SearchPage
 *   /compare           → ComparePage
 *   /about             → AboutPage
 *   /contact           → ContactPage
 *   /faq               → FAQPage
 *   /privacy           → PrivacyPage
 *   /terms             → TermsPage
 *
 * /auth                → AuthLayout
 *   /login             → LoginPage
 *   /register          → RegisterPage
 *   /forgot-password   → ForgotPasswordPage
 *   /reset-password    → ResetPasswordPage
 *
 * /dashboard           → DashboardLayout (customer)
 *   /dashboard         → CustomerDashboardPage
 *   /dashboard/bookings → BookingsPage
 *   /dashboard/bookings/:id → BookingDetailPage
 *   /dashboard/wishlist → WishlistPage
 *   /dashboard/reviews  → MyReviewsPage
 *   /dashboard/notifications → NotificationsPage
 *   /dashboard/profile  → ProfilePage
 *   /dashboard/invoices → InvoicesPage
 *
 * /owner               → DashboardLayout (owner)
 *   /owner/dashboard   → OwnerDashboardPage
 *   ...
 *
 * /admin               → DashboardLayout (admin)
 *   /admin/dashboard   → AdminDashboardPage
 *   ...
 *
 * /book/:venueId       → BookingLayout
 *   /book/:venueId/details   → BookingDetailsStep
 *   /book/:venueId/payment   → PaymentStep
 *   /book/:venueId/confirm   → ConfirmationStep
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import PublicLayout   from '@shared/components/layout/PublicLayout';
import AuthLayout     from '@shared/components/layout/AuthLayout';
import DashboardLayout from '@shared/components/layout/DashboardLayout';
import BookingLayout  from '@shared/components/layout/BookingLayout';

// Guards
import ProtectedRoute from '@shared/components/layout/ProtectedRoute';
import RoleGuard      from '@shared/components/layout/RoleGuard';

// Shared
import PageLoader    from '@shared/components/feedback/PageLoader';
import NotFoundPage  from '@shared/components/feedback/NotFoundPage';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';

// ─── Lazy Loaded Pages ──────────────────────────────────────────────────────
// Public
const HomePage            = lazy(() => import('@features/venues/pages/HomePage'));
const VenueListingPage    = lazy(() => import('@features/venues/pages/VenueListingPage'));
const VenueDetailPage     = lazy(() => import('@features/venues/pages/VenueDetailPage'));
const SearchPage          = lazy(() => import('@features/venues/pages/SearchPage'));
const ComparePage         = lazy(() => import('@features/compare/components/ComparePage'));
const AboutPage           = lazy(() => import('@shared/components/layout/AboutPage'));
const ContactPage         = lazy(() => import('@shared/components/layout/ContactPage'));
const FAQPage             = lazy(() => import('@shared/components/layout/FAQPage'));
const PrivacyPage         = lazy(() => import('@shared/components/layout/PrivacyPage'));
const TermsPage           = lazy(() => import('@shared/components/layout/TermsPage'));

// Auth
const LoginPage           = lazy(() => import('@features/auth/pages/LoginPage'));
const RegisterPage        = lazy(() => import('@features/auth/pages/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('@features/auth/pages/ResetPasswordPage'));

// Customer Dashboard
const CustomerDashboard   = lazy(() => import('@features/dashboard/customer/pages/CustomerDashboard'));
const BookingsPage        = lazy(() => import('@features/dashboard/customer/pages/BookingsPage'));
const BookingDetailPage   = lazy(() => import('@features/dashboard/customer/pages/BookingDetailPage'));
const WishlistPage        = lazy(() => import('@features/dashboard/customer/pages/WishlistPage'));
const MyReviewsPage       = lazy(() => import('@features/dashboard/customer/pages/MyReviewsPage'));
const NotificationsPage   = lazy(() => import('@features/dashboard/customer/pages/NotificationsPage'));
const ProfilePage         = lazy(() => import('@features/dashboard/customer/pages/ProfilePage'));
const InvoicesPage        = lazy(() => import('@features/dashboard/customer/pages/InvoicesPage'));
const PaymentsPage        = lazy(() => import('@features/dashboard/customer/pages/PaymentsPage'));

// Booking Flow
const BookingPage         = lazy(() => import('@features/bookings/pages/BookingPage'));
const PaymentPage         = lazy(() => import('@features/payments/pages/PaymentPage'));
const BookingConfirmPage  = lazy(() => import('@features/bookings/pages/BookingConfirmPage'));

// Owner Panel
const OwnerDashboard      = lazy(() => import('@features/dashboard/owner/pages/OwnerDashboard'));
const OwnerVenuesPage     = lazy(() => import('@features/dashboard/owner/pages/OwnerVenuesPage'));
const OwnerVenueForm      = lazy(() => import('@features/dashboard/owner/pages/OwnerVenueForm'));
const OwnerBookingsPage   = lazy(() => import('@features/dashboard/owner/pages/OwnerBookingsPage'));
const OwnerInquiriesPage  = lazy(() => import('@features/dashboard/owner/pages/OwnerInquiriesPage'));
const OwnerCalendarPage   = lazy(() => import('@features/dashboard/owner/pages/OwnerCalendarPage'));
const OwnerReviewsPage    = lazy(() => import('@features/dashboard/owner/pages/OwnerReviewsPage'));
const OwnerProfilePage    = lazy(() => import('@features/dashboard/owner/pages/OwnerProfilePage'));
const OwnerSettingsPage   = lazy(() => import('@features/dashboard/owner/pages/OwnerSettingsPage'));
const OwnerEarningsPage   = lazy(() => import('@features/dashboard/owner/pages/OwnerEarningsPage'));

// Admin Panel
const AdminDashboard          = lazy(() => import('@features/dashboard/admin/pages/AdminDashboard'));
const AdminVenuesPage         = lazy(() => import('@features/dashboard/admin/pages/AdminVenuesPage'));
const AdminVenueDetailPage    = lazy(() => import('@features/dashboard/admin/pages/AdminVenueDetailPage'));
const AdminOwnersPage         = lazy(() => import('@features/dashboard/admin/pages/AdminOwnersPage'));
const AdminOwnerDetailPage    = lazy(() => import('@features/dashboard/admin/pages/AdminOwnerDetailPage'));
const AdminRejectedVenuesPage = lazy(() => import('@features/dashboard/admin/pages/AdminRejectedVenuesPage'));
const AdminRejectedOwnersPage = lazy(() => import('@features/dashboard/admin/pages/AdminRejectedOwnersPage'));
const AdminBookingsPage       = lazy(() => import('@features/dashboard/admin/pages/AdminBookingsPage'));
const AdminUsersPage          = lazy(() => import('@features/dashboard/admin/pages/AdminUsersPage'));
const AdminReviewsPage        = lazy(() => import('@features/dashboard/admin/pages/AdminReviewsPage'));
const AdminAnalyticsPage      = lazy(() => import('@features/dashboard/admin/pages/AdminAnalyticsPage'));
const AdminSettingsPage       = lazy(() => import('@features/dashboard/admin/pages/AdminSettingsPage'));

// ─── Suspense Wrapper ───────────────────────────────────────────────────────
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ─── Router Configuration ───────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public Routes ──
  {
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true,              element: withSuspense(HomePage) },
      { path: 'venues',          element: withSuspense(VenueListingPage) },
      { path: 'venues/:slug',    element: withSuspense(VenueDetailPage) },
      { path: 'search',          element: withSuspense(SearchPage) },
      { path: 'compare',         element: withSuspense(ComparePage) },
      { path: 'about',           element: withSuspense(AboutPage) },
      { path: 'contact',         element: withSuspense(ContactPage) },
      { path: 'faq',             element: withSuspense(FAQPage) },
      { path: 'privacy',         element: withSuspense(PrivacyPage) },
      { path: 'terms',           element: withSuspense(TermsPage) },
    ],
  },

  // ── Auth Routes ──
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      { path: 'login',           element: withSuspense(LoginPage) },
      { path: 'register',        element: withSuspense(RegisterPage) },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: 'reset-password',  element: withSuspense(ResetPasswordPage) },
    ],
  },

  // ── Booking Flow (protected) ──
  {
    path: 'book',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['customer', 'owner', 'admin']}>
          <BookingLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: ':venueId',            element: withSuspense(BookingPage) },
      { path: ':venueId/payment',    element: withSuspense(PaymentPage) },
      { path: ':venueId/confirm/:bookingId', element: withSuspense(BookingConfirmPage) },
    ],
  },

  // ── Customer Dashboard ──
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['customer', 'owner', 'admin']}>
          <DashboardLayout role="customer" />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true,               element: withSuspense(CustomerDashboard) },
      { path: 'bookings',          element: withSuspense(BookingsPage) },
      { path: 'bookings/:id',      element: withSuspense(BookingDetailPage) },
      { path: 'wishlist',          element: withSuspense(WishlistPage) },
      { path: 'reviews',           element: withSuspense(MyReviewsPage) },
      { path: 'notifications',     element: withSuspense(NotificationsPage) },
      { path: 'profile',           element: withSuspense(ProfilePage) },
      { path: 'invoices',          element: withSuspense(InvoicesPage) },
      { path: 'payments',          element: withSuspense(PaymentsPage) },
    ],
  },

  // ── Owner Panel ──
  {
    path: 'owner',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['owner', 'customer', 'admin']}>
          <DashboardLayout role="owner" />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true,               element: withSuspense(OwnerDashboard) },
      { path: 'dashboard',         element: withSuspense(OwnerDashboard) },
      { path: 'venues',            element: withSuspense(OwnerVenuesPage) },
      { path: 'venues/new',        element: withSuspense(OwnerVenueForm) },
      { path: 'venues/add',        element: withSuspense(OwnerVenueForm) },
      { path: 'venues/:id/edit',   element: withSuspense(OwnerVenueForm) },
      { path: 'bookings',          element: withSuspense(OwnerBookingsPage) },
      { path: 'inquiries',         element: withSuspense(OwnerInquiriesPage) },
      { path: 'calendar',          element: withSuspense(OwnerCalendarPage) },
      { path: 'reviews',           element: withSuspense(OwnerReviewsPage) },
      { path: 'earnings',          element: withSuspense(OwnerEarningsPage) },
      { path: 'profile',           element: withSuspense(OwnerProfilePage) },
      { path: 'settings',          element: withSuspense(OwnerSettingsPage) },
    ],
  },

  // ── Admin Panel ──
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['admin']}>
          <DashboardLayout role="admin" />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true,               element: withSuspense(AdminDashboard) },
      { path: 'dashboard',         element: withSuspense(AdminDashboard) },
      { path: 'venues',            element: withSuspense(AdminVenuesPage) },
      { path: 'venues/:id',        element: withSuspense(AdminVenueDetailPage) },
      { path: 'owners',            element: withSuspense(AdminOwnersPage) },
      { path: 'owners/:id',        element: withSuspense(AdminOwnerDetailPage) },
      { path: 'rejected-venues',   element: withSuspense(AdminRejectedVenuesPage) },
      { path: 'rejected-owners',   element: withSuspense(AdminRejectedOwnersPage) },
      { path: 'bookings',          element: withSuspense(AdminBookingsPage) },
      { path: 'users',             element: withSuspense(AdminUsersPage) },
      { path: 'reviews',           element: withSuspense(AdminReviewsPage) },
      { path: 'analytics',         element: withSuspense(AdminAnalyticsPage) },
      { path: 'settings',          element: withSuspense(AdminSettingsPage) },
    ],
  },

  // ── 404 ──
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
