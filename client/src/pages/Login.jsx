import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Key, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DemoCredentialsModal from '../components/DemoCredentialsModal';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      return setError('Please enter your email or phone number and password');
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success && res.user) {
        // Status checks
        if (res.user.status === 'PENDING') {
          return navigate('/approval-pending');
        }
        if (res.user.status === 'SUSPENDED') {
          return navigate('/account-suspended');
        }
        if (res.user.status === 'REJECTED') {
          return navigate('/account-rejected');
        }

        // Redirect based on role
        if (res.user.role === 'SUPER_ADMIN') {
          navigate('/admin/users');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (email, pwd) => {
    setIdentifier(email);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenDemoModal={() => setDemoModalOpen(true)} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0B192C] tracking-tight">
              Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized access to TrackOps BD Link & Consent Hub
            </p>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="mb-6 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold mb-2">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick-Select Demo Account:</span>
              </span>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleFillCredentials('superadmin@trackops.local', 'DemoSuperAdmin@2026')}
                className="py-1 px-2 rounded-lg bg-white border border-indigo-200 text-purple-700 hover:bg-purple-50 font-bold text-center truncate shadow-sm"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin@trackops.local', 'DemoAdmin@2026')}
                className="py-1 px-2 rounded-lg bg-white border border-indigo-200 text-blue-700 hover:bg-blue-50 font-bold text-center truncate shadow-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('officer@trackops.local', 'DemoOfficer@2026')}
                className="py-1 px-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-center truncate shadow-sm"
              >
                Officer
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. officer@trackops.local or +88017..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-3 text-xs text-slate-500">
              Need an officer account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <DemoCredentialsModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectAccount={handleFillCredentials}
      />
    </div>
  );
}
