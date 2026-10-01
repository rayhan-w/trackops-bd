import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, Phone, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AccountExpired() {
  const contactNumber = '01797838961';
  const whatsappUrl = 'https://wa.me/8801797838961';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>ACCESS DURATION EXPIRED</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            Account Expired
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
            Your authorization period for TrackOps BD has expired. To renew your active access duration, please contact your administrator.
          </p>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 mb-6 text-left">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Administrator Contact
            </div>
            <div className="flex items-center justify-between">
              <div>
                <a
                  href={`tel:${contactNumber}`}
                  className="text-base font-extrabold text-sky-600 hover:text-sky-700 font-mono tracking-wide"
                >
                  {contactNumber}
                </a>
                <div className="text-[11px] text-stone-500">
                  Officer Account Activation & Renewals
                </div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
