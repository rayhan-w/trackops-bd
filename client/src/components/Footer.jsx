import React from 'react';
import { Shield, Lock, Scale, AlertTriangle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#F5F4F0] text-stone-600 border-t border-stone-200/80 text-sm">
      {/* Disclaimer Banner */}
      <div className="bg-orange-100/60 border-b border-orange-200/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center space-x-2 text-xs text-orange-950 font-medium">
          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> TrackOps BD is a technical demonstration & lawful case inquiry workflow prototype.
            It does not claim official law enforcement affiliation unless explicitly accredited under formal government mandate.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#0F172A] tracking-tight">TrackOps BD</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Centralized link management and voluntary consent platform engineered for accountable record keeping, audit verification, and transparent case references.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Platform Core Online • AI Powered</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/login" className="hover:text-orange-600 transition-colors">Officer Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-orange-600 transition-colors">Registration & Approval</Link>
              </li>
              <li>
                <Link to="/cell-converter" className="hover:text-orange-600 transition-colors">Cell Format Converter</Link>
              </li>
              <li>
                <Link to="/telecom" className="hover:text-orange-600 transition-colors">Telecom Regulatory Gateway</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
              Consent & Privacy
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Zero Hidden Access Guarantee</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-orange-600" />
                <span>Explicit Browser Consent Only</span>
              </li>
              <li className="text-stone-500">
                W3C Geolocation Standard Compliant
              </li>
              <li className="text-stone-500">
                Immutable PostgreSQL Audit Log
              </li>
            </ul>
          </div>

          {/* Demo Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
              Security Standard
            </h4>
            <p className="text-xs text-stone-500 mb-2 leading-relaxed">
              Active with role-based access control, cryptographic verification, and audit logging.
            </p>
            <div className="bg-white border border-stone-200/80 rounded-xl p-3 text-[11px] font-mono text-stone-700 shadow-2xs">
              <div className="text-orange-600 font-bold mb-1">Standard Security Controls:</div>
              <div>• bcrypt salted hashing</div>
              <div>• JWT signed stateless auth</div>
              <div>• Strict IDOR ownership validation</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} TrackOps BD. All rights reserved.
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4 font-medium">
            <span className="hover:text-stone-800 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-stone-800 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-stone-800 cursor-pointer">Statutory Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
