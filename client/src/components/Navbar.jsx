import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, UserCheck, Key, Menu, X, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenDemoModal }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B192C]/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  TrackOps <span className="text-blue-400">BD</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">
                Link Management & Consent Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#compliance" className="hover:text-blue-400 transition-colors">
              Consent & Privacy
            </a>
            <a href="#about" className="hover:text-blue-400 transition-colors">
              About
            </a>
            <button
              onClick={onOpenDemoModal}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demo Credentials</span>
            </button>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user?.role === 'SUPER_ADMIN' ? '/admin/users' : '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-200 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-blue-600/25 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenDemoModal}
              className="text-xs bg-slate-800 text-indigo-300 p-2 rounded-lg"
              title="Demo Accounts"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white font-medium py-1.5"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white font-medium py-1.5"
          >
            Features
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white font-medium py-1.5"
          >
            Consent & Privacy
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDemoModal();
            }}
            className="w-full text-left text-indigo-300 font-medium py-1.5 flex items-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>View Demo Credentials</span>
          </button>
          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'SUPER_ADMIN' ? '/admin/users' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-slate-700 text-white py-2 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
