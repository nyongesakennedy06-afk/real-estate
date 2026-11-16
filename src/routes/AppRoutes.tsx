import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireAdmin } from '@/routes/RequireAdmin';

// Public Pages
import { HomePage } from '@/pages/public/HomePage';
import { ListingsPage } from '@/pages/public/ListingsPage';
import { PropertyDetailPage } from '@/pages/public/PropertyDetailPage';
import { ValuationRequestPage } from '@/pages/public/ValuationRequestPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Account Pages
import { ProfilePage } from '@/pages/account/ProfilePage';
import { BookingsPage } from '@/pages/account/BookingsPage';
import { ValuationsPage } from '@/pages/account/ValuationsPage';

// Admin Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminListingsPage } from '@/pages/admin/AdminListingsPage';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminValuationsPage } from '@/pages/admin/AdminValuationsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';

// 404
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public & Account Routes inside main Layout */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<ListingsPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/valuation/new" element={<ValuationRequestPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Account (User) */}
        <Route
          path="/account/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/bookings"
          element={
            <RequireAuth>
              <BookingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/valuations"
          element={
            <RequireAuth>
              <ValuationsPage />
            </RequireAuth>
          }
        />

        {/* Catch-all 404 within Public Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Panel Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="listings" element={<AdminListingsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="valuations" element={<AdminValuationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>
    </Routes>
  );
};
