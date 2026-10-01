import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Shield } from 'lucide-react';

// Official WhatsApp inline SVG
function WhatsAppIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
    </svg>
  );
}

export default function WhatsAppContactCard() {
  const location = useLocation();

  // Hide WhatsApp contact card completely on generated tracking links
  if (location.pathname.startsWith('/v/') || location.pathname.startsWith('/l/')) {
    return null;
  }

  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem('trackops_wa_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMinimize = (newState) => {
    setMinimized(newState);
    try {
      localStorage.setItem('trackops_wa_minimized', newState ? 'true' : 'false');
    } catch {}
  };

  const whatsappUrl = 'https://wa.me/8801752008041';
  const whatsappNumber = '01752008041';

  // Minimized Circular Floating Icon
  if (minimized) {
    return (
      <aside aria-label="WhatsApp quick contact widget" className="fixed bottom-5 right-5 z-[9999]">
        <button
          type="button"
          onClick={() => toggleMinimize(false)}
          aria-label="Open WhatsApp chat"
          className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400/60"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border border-white"></span>
          </span>
          <WhatsAppIcon className="w-7 h-7 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="sr-only">Open WhatsApp chat</span>
        </button>
      </aside>
    );
  }

  // Expanded Card
  return (
    <aside aria-label="WhatsApp support contact" className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-[calc(100vw-40px)] max-w-[280px] sm:max-w-[320px] bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-100 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-xl p-4 sm:p-5 relative transition-all">
        {/* Close Button to Minimize */}
        <button
          type="button"
          onClick={() => toggleMinimize(true)}
          aria-label="Minimize contact card"
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge: FOR LAW ENFORCEMENT */}
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          <Shield className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          <span>FOR LAW ENFORCEMENT</span>
        </div>

        {/* Content Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0">
            <WhatsAppIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Contact Us
            </h4>
            <p className="text-xs font-semibold text-[#25D366] flex items-center space-x-1 mt-0.5">
              <span>WhatsApp</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block animate-ping"></span>
            </p>
          </div>
        </div>

        {/* Phone number display */}
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
            {whatsappNumber}
          </span>
        </div>

        {/* Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open WhatsApp chat"
          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <WhatsAppIcon className="w-4 h-4" />
          <span>Open</span>
        </a>
      </div>
    </aside>
  );
}
