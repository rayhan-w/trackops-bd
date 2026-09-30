import React from 'react';
import { Shield, Lock, Scale, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0B192C] text-slate-400 border-t border-slate-800 text-sm">
      {/* Disclaimer Banner */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center space-x-2 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> TrackOps BD is a technical demonstration & lawful case inquiry workflow prototype.
            It does not claim official Bangladesh Police or Law Enforcement affiliation unless explicitly accredited under formal government mandate.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">TrackOps BD</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized link management and voluntary consent platform engineered for accountable record keeping, audit verification, and transparent case references.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Platform Core Online • Node v25</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Officer Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Registration & Approval</Link>
              </li>
              <li>
                <Link to="/cell-converter" className="hover:text-white transition-colors">Cell Format Converter</Link>
              </li>
              <li>
                <Link to="/telecom" className="hover:text-white transition-colors">Telecom Regulatory Gateway</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Consent & Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero Hidden Access Guarantee</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explicit Browser Consent Only</span>
              </li>
              <li className="text-slate-400">
                W3C Geolocation Standard Compliant
              </li>
              <li className="text-slate-400">
                No Simulated Cell Tower Coordinates
              </li>
            </ul>
          </div>

          {/* Demo Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Auditor & Dev Notice
            </h4>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              Environment active with development database seeder and multi-role audit logging.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300">
              <div className="text-indigo-300 font-semibold mb-1">Standard Security Controls:</div>
              <div>• bcrypt salted hashing</div>
              <div>• JWT signed stateless auth</div>
              <div>• Strict IDOR ownership validation</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} TrackOps BD. All rights reserved. Built for lawful investigation workflows.
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400">Statutory Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
