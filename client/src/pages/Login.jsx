import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Smartphone, Laptop, Tablet, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { detectCurrentDevice } from '../utils/deviceHelper';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedDev, setDetectedDev] = useState(null);
  const [deviceLimitInfo, setDeviceLimitInfo] = useState(null);

  useEffect(() => {
    detectCurrentDevice().then((dev) => setDetectedDev(dev));
  }, []);

  const handleForceLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login(identifier.trim(), password, detectedDev, true);
      if (res.success && res.user) {
        if (res.user.status === 'PENDING') return navigate('/approval-pending');
        if (res.user.status === 'EXPIRED') return navigate('/account-expired');
        if (res.user.status === 'SUSPENDED') return navigate('/account-suspended');
        if (res.user.status === 'REJECTED') return navigate('/account-rejected');

        if (res.user.role === 'SUPER_ADMIN') {
          navigate('/admin/users');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDeviceLimitInfo(null);

    if (!identifier.trim() || !password) {
      return setError('Please enter your email or phone number and password');
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password, detectedDev, false);
      if (res.success && res.user) {
        // Status checks
        if (res.user.status === 'PENDING') {
          return navigate('/approval-pending');
        }
        if (res.user.status === 'EXPIRED') {
          return navigate('/account-expired');
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
      if (err.data?.status === 'EXPIRED') {
        return navigate('/account-expired');
      }
      if (err.data?.status === 'DEVICE_LIMIT_REACHED') {
        setDeviceLimitInfo({
          allowedLimit: err.data?.allowedLimit || 1,
          activeSessions: err.data?.activeSessions || [],
        });
        return;
      }
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Portal Sign In
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Authorized access to TrackOps BD Link & Consent Hub
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {deviceLimitInfo && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 text-xs p-4 rounded-2xl space-y-3 animate-fadeIn shadow-xs">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-sm">
                      ডিভাইস লিমিট পূর্ণ হয়েছে ({deviceLimitInfo.allowedLimit}টি ডিভাইস)
                    </h4>
                    <p className="text-amber-800 mt-1 leading-relaxed text-xs">
                      আপনার অ্যাকাউন্টে একসাথে সর্বোচ্চ <strong>{deviceLimitInfo.allowedLimit}টি ডিভাইসে</strong> লগইন থাকার অনুমতি রয়েছে। অন্য কোনো ব্রাউজারে বা ডিভাইসে আপনার অ্যাকাউন্ট বর্তমানে সক্রিয় আছে।
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleForceLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>পূর্ববর্তী ডিভাইস লগআউট করে এখানে সাইন-ইন করুন</span>
                  </button>
                  <p className="text-[11px] text-amber-800/80 text-center mt-2 font-medium">
                    অথবা অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করে ডিভাইস লিমিট বাড়িয়ে নিন।
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. officer@trackops.local or +88017..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Detected Device Preview */}
            {detectedDev && (
              <div className="bg-gradient-to-r from-stone-50 to-orange-50/40 border border-stone-200/90 rounded-2xl p-3 flex items-center space-x-3 text-left shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  {detectedDev.isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {detectedDev.model}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                      Login Device
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {detectedDev.os} • {detectedDev.browser}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white font-semibold text-xs sm:text-sm rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-stone-200/80 text-center text-xs text-stone-500">
            <span>New officer needing portal credentials? </span>
            <Link to="/register" className="text-orange-600 font-bold hover:underline">
              Submit Registration Request
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
