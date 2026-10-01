import React from 'react';
import { Shield } from 'lucide-react';

export default function LawEnforcementNotice() {
  return (
    <div className="w-full bg-[#0F172A] border-t border-b border-[#1E293B] py-2 px-4 text-center shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-white">
        <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <span className="text-xs font-bold tracking-wider uppercase text-slate-100">
          For Law Enforcement
        </span>
      </div>
    </div>
  );
}
