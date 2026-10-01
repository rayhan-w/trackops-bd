import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ApprovalPending from './pages/ApprovalPending';
import AccountSuspended from './pages/AccountSuspended';
import AccountRejected from './pages/AccountRejected';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import LinkDetails from './pages/LinkDetails';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import TelecomGateway from './pages/TelecomGateway';
import CellConverter from './pages/CellConverter';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import VisitorConsentPage from './pages/VisitorConsentPage';
import VisitorActivity from './pages/VisitorActivity';
import VisitorDetail from './pages/VisitorDetail';
import AccountExpired from './pages/AccountExpired';
import WhatsAppContactCard from './components/WhatsAppContactCard';

// Short link helper redirect: /l/:shortCode -> /v/:shortCode
function ShortLinkRedirect() {
  const { shortCode } = useParams();
  return <Navigate to={`/v/${shortCode}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/v/:shortCode" element={<VisitorConsentPage />} />
        <Route path="/l/:shortCode" element={<ShortLinkRedirect />} />

        {/* Account Status Interceptors */}
        <Route path="/approval-pending" element={<ApprovalPending />} />
        <Route path="/account-suspended" element={<AccountSuspended />} />
        <Route path="/account-rejected" element={<AccountRejected />} />
        <Route path="/account-expired" element={<AccountExpired />} />

        {/* Officer & General Protected Routes (Requires APPROVED status) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/links"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/links/new"
          element={
            <ProtectedRoute>
              <CreateLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/links/:id/activity"
          element={
            <ProtectedRoute>
              <LinkDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitor-activity"
          element={
            <ProtectedRoute>
              <VisitorActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitor-activity/:id"
          element={
            <ProtectedRoute>
              <VisitorDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cell-converter"
          element={
            <ProtectedRoute>
              <CellConverter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/telecom"
          element={
            <ProtectedRoute>
              <TelecomGateway />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Super Admin & Admin Restricted Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global WhatsApp Contact Card (Requirement 2) */}
      <WhatsAppContactCard />
    </AuthProvider>
  );
}
