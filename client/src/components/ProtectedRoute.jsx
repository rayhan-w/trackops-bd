import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = null, allowPending = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-x-2">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Authenticating Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Intercept account statuses unless explicitly allowing status viewing routes
  if (!allowPending) {
    if (user.status === 'PENDING') {
      return <Navigate to="/approval-pending" replace />;
    }
    if (user.status === 'SUSPENDED') {
      return <Navigate to="/account-suspended" replace />;
    }
    if (user.status === 'REJECTED') {
      return <Navigate to="/account-rejected" replace />;
    }
    if (user.status === 'EXPIRED') {
      return <Navigate to="/account-expired" replace />;
    }
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your current role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have authorization to view this administrative resource.
          </p>
          <div className="flex justify-center space-x-3">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-md shadow-blue-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
