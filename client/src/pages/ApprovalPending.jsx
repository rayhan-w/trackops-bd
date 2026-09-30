import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, RefreshCw, LogOut, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ApprovalPending() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  const handleRefresh = async () => {
    setChecking(true);
    setCheckMessage('');
    try {
      await refreshUser();
      let stored = {};
      try {
        const raw = localStorage.getItem('trackops_user');
        if (raw && raw !== 'undefined') stored = JSON.parse(raw);
      } catch (_) {}
      if (stored.status === 'APPROVED') {
        navigate('/dashboard');
      } else {
        setCheckMessage('Status is still PENDING. Please contact a Super Administrator.');
      }
    } catch (e) {
      setCheckMessage('Error refreshing account status.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
            STATUS: PENDING ADMINISTRATOR APPROVAL
          </span>

          <h2 className="text-2xl font-extrabold text-[#0B192C] tracking-tight mt-4">
            Approval Pending
          </h2>

          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Your registration has been submitted and is currently undergoing administrative verification by a Super Administrator.
          </p>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="font-semibold text-slate-700 flex items-center space-x-1.5 pb-1 border-b border-slate-200">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Registered Account Details</span>
            </div>
            <div><span className="text-slate-500">Applicant:</span> <span className="font-semibold">{user?.name}</span></div>
            <div><span className="text-slate-500">Identifier:</span> <span className="font-mono">{user?.email || user?.phone}</span></div>
            <div><span className="text-slate-500">Requested Role:</span> <span className="font-mono">{user?.role}</span></div>
            <div className="pt-1 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <strong>Notice:</strong> Pending accounts cannot create, view, or manage investigation links until vetted.
            </div>
          </div>

          {checkMessage && (
            <div className="mt-4 text-xs font-medium text-amber-700 bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
              {checkMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>Check Approval Status</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-3 px-5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
