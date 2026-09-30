import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, ShieldAlert, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AccountSuspended() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
            ACCOUNT ACCESS SUSPENDED
          </span>

          <h2 className="text-2xl font-extrabold text-[#0B192C] tracking-tight mt-4">
            Account Suspended
          </h2>

          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Your TrackOps BD officer credentials have been temporarily suspended pursuant to administrative policy review.
          </p>

          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="font-semibold text-red-900 flex items-center space-x-1.5 pb-1 border-b border-red-200">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>Suspension Information</span>
            </div>
            <div><span className="text-slate-500">Account:</span> <span className="font-semibold text-slate-800">{user?.name}</span></div>
            <div>
              <span className="text-slate-500">Reason:</span>{' '}
              <span className="font-semibold text-red-700">
                {user?.suspensionReason || 'Administrative policy audit suspension.'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href="mailto:superadmin@trackops.local?subject=Account%20Suspension%20Inquiry"
              className="py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Senior Administration</span>
            </a>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
