import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AccountRejected() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
            REGISTRATION REJECTED
          </span>

          <h2 className="text-2xl font-extrabold text-[#0B192C] tracking-tight mt-4">
            Application Rejected
          </h2>

          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Your application for officer credentials on TrackOps BD was not approved by administration.
          </p>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
            <div><span className="text-slate-500">Applicant:</span> <span className="font-semibold text-slate-800">{user?.name}</span></div>
            <div>
              <span className="text-slate-500">Stated Reason:</span>{' '}
              <span className="text-slate-700 italic">
                {user?.rejectionReason || 'Documentation or departmental validation could not be authenticated.'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                logout();
                navigate('/register');
              }}
              className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all"
            >
              Submit New Application with Corrections
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
