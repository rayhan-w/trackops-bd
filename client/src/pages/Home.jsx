import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Link as LinkIcon,
  BarChart3,
  Lock,
  FileSpreadsheet,
  Users,
  Compass,
  ArrowRight,
  CheckCircle,
  Key,
  Layers,
  ChevronRight,
  AlertTriangle,
  Server,
  Fingerprint,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DemoCredentialsModal from '../components/DemoCredentialsModal';

export default function Home() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenDemoModal={() => setDemoModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B192C] via-[#0E1C36] to-[#12264C] text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 mb-6 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Case Inquiry & Transparent Consent Infrastructure</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Smart Link Management <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Create, organize, and monitor links through a secure centralized dashboard. Engineered for lawful case inquiries, voluntary visitor consent, and accountable audit logs.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <span>Login</span>
            </Link>
          </div>

          {/* Demo Credentials Fast-Access Bar */}
          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 text-xs px-4 py-2 rounded-xl transition-all shadow-md group"
            >
              <Key className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Explore Pre-Seeded Demo Accounts (Super Admin, Admin, Officer)</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>

          {/* Live Platform Highlights HUD */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-left text-xs">
            <div className="p-3 border-r border-slate-800 last:border-r-0">
              <span className="text-slate-400 block text-[11px]">Security Architecture</span>
              <span className="font-bold text-white text-sm">Role-Based (RBAC)</span>
            </div>
            <div className="p-3 border-r border-slate-800 last:border-r-0">
              <span className="text-slate-400 block text-[11px]">Consent Model</span>
              <span className="font-bold text-emerald-400 text-sm">100% Explicit W3C</span>
            </div>
            <div className="p-3 border-r border-slate-800 last:border-r-0">
              <span className="text-slate-400 block text-[11px]">Account Vetting</span>
              <span className="font-bold text-amber-300 text-sm">Super Admin Approval</span>
            </div>
            <div className="p-3">
              <span className="text-slate-400 block text-[11px]">Database Core</span>
              <span className="font-bold text-blue-400 text-sm">MongoDB Connected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Enterprise Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Six Core Pillars of TrackOps BD
            </h3>
            <p className="mt-3 text-slate-600 text-sm">
              Engineered with strict governance standards to maintain chain-of-custody, ethical data practices, and high-performance link routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Link Management */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">Link Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Generate custom short codes or automated hashes, configure domain aliases, manage expiration timetables, and monitor real-time link states.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Custom Short Codes & Random Generators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configurable Expiration & Deactivation</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Analytics */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">Real-Time Analytics</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Track clicks, unique visitor sessions, geographical distribution, device profiles, and voluntary consent conversion ratios via Recharts.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Daily & Monthly Traffic Volume</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Device & Operating System Breakdown</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Account Security */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">Account Security</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                State-of-the-art bcrypt password salting, stateless JWT tokens, strict HTTP rate-limiting, and comprehensive IDOR object ownership checks.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bcrypt Salting & JWT Authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Protection Against IDOR Vulnerabilities</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Case Reference Management */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">Case Reference Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Attach every link to formal incident IDs, police station diary entries, or inquiry docket numbers for immutable chain-of-custody tracking.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
                  <span>Docket ID & Incident Indexing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
                  <span>Cross-Reference Multiple Links to One Case</span>
                </li>
              </ul>
            </div>

            {/* Card 5: User Management */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">User & Role Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Three distinct access levels: Super Admin, Admin, and Officer. Mandatory manual account vetting ensures zero unauthorized link dissemination.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Approval, Rejection & Suspension Lifecycle</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Centralized Administrative Audit Logs</span>
                </li>
              </ul>
            </div>

            {/* Card 6: Consent-Based Location Sharing */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0B192C] mb-2">Consent-Based Location</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Complies with strict privacy standards. Only captures coordinates when the visitor explicitly clicks "Share My Location". Never hidden or coerced.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>W3C Geolocation API Verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Visual Coordinate Mapping & Accuracy Radius</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Ethical Standard Callout */}
      <section id="compliance" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-[#0E1C36] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ethical Architecture Standards</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Transparent Visitor Consent & Technical Limitations
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  TrackOps BD rejects deceptive tracking. Web browsers cannot directly intercept IMEI, SIM numbers, or cellular tower records without formal telecommunication statutory warrants.
                  Our platform explicitly informs visitors of any requested data and ensures the destination remains accessible even when optional permissions are declined.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to="/cell-converter"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-colors flex items-center space-x-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Cell Converter Utility</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <DemoCredentialsModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}
