import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/70 text-[#0F172A] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
                  TrackOps<span className="text-orange-500">BD</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100/70 text-orange-700 border border-orange-200/50 uppercase">
                  AI CORE
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium leading-none mt-0.5">
                Link Intelligence & Consent Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-orange-600 transition-colors">
              Features
            </a>
            <a href="#metrics" className="hover:text-orange-600 transition-colors">
              Performance
            </a>
            <a href="#compliance" className="hover:text-orange-600 transition-colors">
              Consent & Privacy
            </a>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user?.role === 'SUPER_ADMIN' ? '/admin/users' : '/dashboard'}
                  className="bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md shadow-orange-500/25 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                >
                  <Activity className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-900 px-3 py-2 rounded-full hover:bg-stone-100 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-stone-700 hover:text-orange-600 px-4 py-2 rounded-full hover:bg-stone-100/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md shadow-orange-500/25 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                >
                  <span>Get Started for Free</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBFBFA] border-b border-stone-200 px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-800 hover:text-orange-600 font-semibold py-1.5"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-700 hover:text-orange-600 font-medium py-1.5"
          >
            Features
          </a>
          <a
            href="#metrics"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-700 hover:text-orange-600 font-medium py-1.5"
          >
            Performance Metrics
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-700 hover:text-orange-600 font-medium py-1.5"
          >
            Consent & Privacy
          </a>
          <div className="pt-3 border-t border-stone-200 flex flex-col space-y-2">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'SUPER_ADMIN' ? '/admin/users' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-full font-semibold shadow-md shadow-orange-500/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-stone-300 text-stone-800 py-2.5 rounded-full font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-full font-semibold shadow-md shadow-orange-500/20"
                >
                  Get Started for Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
