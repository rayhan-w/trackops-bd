import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Inline WhatsApp SVG Icon
function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
    </svg>
  );
}

export default function ApprovalPending() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  const contactPhone = '01797838961';
  const whatsappUrl = 'https://wa.me/8801797838961';

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
        setCheckMessage('Status is still PENDING. Please contact the administrator.');
      }
    } catch (e) {
      setCheckMessage('Error refreshing account status.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl text-center">
          
          {/* Pending Clock Icon */}
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-200/80 animate-pulse shadow-sm">
            <Clock className="w-8 h-8" />
          </div>

          {/* Soft yellow/blue status indicator */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-sky-50 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-2xs mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>REVIEW IN PROGRESS</span>
          </div>

          {/* Required Exact Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Waiting for Administration Approval
          </h2>

          {/* Required Exact Description */}
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
            Your account has been registered successfully. Please wait while the administrator reviews your application.
          </p>

          {/* Contact Information Prominently in Bold */}
          <div className="mt-6 bg-gradient-to-br from-stone-50 to-sky-50/40 border border-sky-200/80 rounded-2xl p-5 text-center shadow-xs">
            <p className="text-xs text-stone-600 mb-2">
              Please contact this number to activate your account:
            </p>
            <div className="my-2">
              <a
                href={`tel:${contactPhone}`}
                className="text-2xl sm:text-3xl font-black text-sky-700 hover:text-sky-800 tracking-wider font-mono transition-colors block"
              >
                {contactPhone}
              </a>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${contactPhone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {contactPhone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* User Details Snapshot */}
          {user && (
            <div className="mt-5 bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="font-semibold text-slate-700 flex items-center space-x-1.5 pb-1 border-b border-stone-200">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Submitted Registration Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div><span className="text-stone-500">Applicant:</span> <span className="font-semibold">{user.name}</span></div>
                <div><span className="text-stone-500">Rank:</span> <span className="font-semibold">{user.rank || 'N/A'}</span></div>
                <div><span className="text-stone-500">Posting:</span> <span className="font-semibold">{user.posting || 'N/A'}</span></div>
                <div><span className="text-stone-500">Contact:</span> <span className="font-mono">{user.phone || user.email}</span></div>
              </div>
            </div>
          )}

          {checkMessage && (
            <div className="mt-4 text-xs font-semibold text-amber-800 bg-amber-50 py-2.5 px-3 rounded-xl border border-amber-200 animate-fadeIn">
              {checkMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="flex-1 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>Check Approval Status</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-3 px-5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
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
