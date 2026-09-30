import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Link as LinkIcon,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  Key,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  Code2,
  Globe2,
  Layers,
  Clock,
  Compass,
  Check,
  Bell,
  Mail,
  Share2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A] selection:bg-orange-100 selection:text-orange-900 font-sans">
      <Navbar />

      {/* HERO SECTION (Matches CogniAI reference) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Subtle warm backdrop glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-gradient-to-tr from-amber-100/40 to-orange-100/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading, Subtext, CTA, Social Proof */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-orange-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Next-Gen Lawful Link Intelligence Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
                Turn Raw Data into{' '}
                <span className="text-[#0F172A]">Actionable Insights — </span>
                <span className="bg-gradient-to-r from-[#FF7A50] to-[#FF5216] bg-clip-text text-transparent">
                  Instantly
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-normal">
                Harness AI-driven analytics to transform complex data into clear, actionable insights. No coding required, just results.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#features"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm border border-stone-200 shadow-2xs flex items-center justify-center space-x-2 transition-all hover:border-orange-300"
                >
                  <span>Explore Platform</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>
              </div>

              {/* Partner Logos / Trust row */}
              <div className="pt-6 border-t border-stone-200/60">
                <p className="text-xs font-medium text-stone-400 mb-3">
                  More than 100+ companies & investigative agencies partner
                </p>
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-stone-500 font-bold text-sm">
                  <div className="flex items-center space-x-1.5 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-600"></span>
                    <span>vision</span>
                  </div>
                  <div className="flex items-center space-x-1.5 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="w-3.5 h-3.5 rounded-full bg-stone-600"></span>
                    <span>Tracea</span>
                  </div>
                  <div className="flex items-center space-x-1.5 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-base font-mono">©</span>
                    <span>Cactusc</span>
                  </div>
                  <div className="flex items-center space-x-1.5 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="w-3.5 h-3.5 rounded-sm border-2 border-stone-600"></span>
                    <span>LawGuard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: TrackOps BD Real-Time Telemetry & Verification Preview */}
            <div className="lg:col-span-5 relative">
              {/* Warm Peach/Orange Card Backdrop Container */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-orange-100/80 via-amber-50/70 to-orange-200/60 border border-orange-200/50 shadow-2xl shadow-orange-500/10 space-y-4 relative">
                
                {/* CARD 1: Live Link Telemetry Stream */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-bold text-xs text-stone-800 tracking-tight">Active Link Telemetry</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      LIVE STREAM
                    </span>
                  </div>

                  {/* Active Link Box */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400 font-medium">Tracking Route</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">200 OK</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-xs font-semibold text-stone-800">
                      <LinkIcon className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span className="truncate">/l/case-dhaka-2026</span>
                    </div>
                    <div className="text-[10px] text-stone-400 truncate flex items-center space-x-1">
                      <span>Dest:</span>
                      <span className="text-stone-600 truncate">https://bdnews24.com/special-report</span>
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-orange-50/60 rounded-xl border border-orange-100">
                      <div className="text-base font-extrabold text-orange-600">1,428</div>
                      <div className="text-[9px] font-medium text-stone-500">Total Visits</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="text-base font-extrabold text-stone-800">94.2%</div>
                      <div className="text-[9px] font-medium text-stone-500">GPS Precision</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="text-base font-extrabold text-emerald-600">100%</div>
                      <div className="text-[9px] font-medium text-stone-500">Lawful Log</div>
                    </div>
                  </div>

                  {/* Recent Activity Log Snippet */}
                  <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
                      <span>Verified Target Events</span>
                      <span>Just now</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50/70 border border-stone-100 text-[11px]">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-stone-800 truncate">Gulshan-2, Dhaka</span>
                          <span className="text-[9px] text-stone-400 font-mono">(Grameenphone 4G)</span>
                        </div>
                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">±12m</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50/70 border border-stone-100 text-[11px]">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className="font-semibold text-stone-800 truncate">Agrabad, Chittagong</span>
                          <span className="text-[9px] text-stone-400 font-mono">(WiFi / ISP)</span>
                        </div>
                        <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">±28m</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Consent & Lawful Standards */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-md flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-800">W3C Voluntary Consent Engine</div>
                      <div className="text-[10px] text-stone-500">Cryptographically signed audit logs</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-full border border-emerald-200/60">
                    Compliant
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: STATEMENT BANNER WITH CONNECTOR NODES */}
      <section className="py-20 bg-white border-y border-stone-200/60 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
            TrackOps BD is an advanced AI-powered data analysis platform designed to{' '}
            <span className="text-orange-600">
              transform raw data into actionable insights.
            </span>
          </h2>

          {/* Process Timeline Connector Nodes */}
          <div className="flex items-center justify-center max-w-xl mx-auto relative pt-4">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 -z-0"></div>

            <div className="relative z-10 flex items-center justify-between w-full">
              {/* Node 1 */}
              <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shadow-xs">
                <LinkIcon className="w-4 h-4" />
              </div>

              {/* Node 2 */}
              <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shadow-xs">
                <Globe2 className="w-4 h-4" />
              </div>

              {/* Center Glow Node 3 (Orange) */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/40 ring-4 ring-orange-100">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              {/* Node 4 */}
              <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>

              {/* Node 5 */}
              <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PERFORMANCE METRICS (Exact 5-card CogniAI layout) */}
      <section id="metrics" className="py-24 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Performance <span className="text-orange-500">Metrics</span>
            </h3>
            <p className="text-sm text-stone-500">
              Track, analyze, and optimize data to improve performance and drive success.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Left Column (2 cards) */}
            <div className="space-y-6 flex flex-col justify-between">
              {/* Card 1: Predictive Analytics */}
              <div className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">Predictive Analytics</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Forecast trends and visitor inquiry patterns with AI-driven intelligence.
                </p>
              </div>

              {/* Card 2: Real-Time Reporting */}
              <div className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">Real-Time Reporting</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Interactive dashboards for faster decision-making and verifiable case audit records.
                </p>
              </div>
            </div>

            {/* Center Column: Tall Card - Automated Data Processing */}
            <div className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Mock Notification Pill */}
                <div className="flex items-center space-x-2 text-[10px] font-bold mb-4">
                  <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full">News Upload</span>
                  <span className="text-stone-400">Trending</span>
                </div>

                {/* Micro preview notifications inside card */}
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-800 text-[11px]">Content Refresh Alert</div>
                        <div className="text-[9px] text-stone-400">Past feed content, share insights</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">28 MB</span>
                  </div>

                  <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-800 text-[11px]">Engagement Boost Reminder</div>
                        <div className="text-[9px] text-stone-400">Keep authorized audience verified</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">24 MB</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">Automated Data Processing</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  AI intelligently cleans, structures, and analyzes vast amounts of raw data, transforming it into meaningful insights for informed decision-making.
                </p>
              </div>
            </div>

            {/* Right Column (2 cards) */}
            <div className="space-y-6 flex flex-col justify-between">
              {/* Card 4: No-Code Simplicity */}
              <div className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">No-Code Simplicity</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Designed for business users, case officers, and analysts — not just data scientists.
                </p>
              </div>

              {/* Card 5: Seamless Integrations */}
              <div className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-2">Seamless Integrations</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Connect with your CRM, PostgreSQL database, and modern verification pipelines.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: USE CASE (Smart Automation Tools with Chart) */}
      <section id="features" className="py-20 bg-white border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Right Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
                USE CASE
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Optimize Workflows with{' '}
                <span className="text-orange-500">Smart Automation Tools</span>
              </h3>
              <p className="text-sm text-stone-500">
                Organize tasks, track progress, and achieve more — effortlessly.
              </p>
            </div>

            <Link
              to="/register"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF7A50] to-[#FF5216] text-white text-xs font-semibold shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all flex-shrink-0"
            >
              See All in Action
            </Link>
          </div>

          {/* 3 Use Case Cards with Bar Chart preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: For Business Leaders */}
            <div className="bg-[#FBFBFA] p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-[#0F172A]">For Business Leaders</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Streamline operations and make faster decisions with automated, organized workflows.
              </p>
              <div className="pt-2 text-xs font-semibold text-orange-600 flex items-center space-x-1">
                <span>Explore Executive Desk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: For Marketing & Security Teams */}
            <div className="bg-[#FBFBFA] p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-[#0F172A]">For Marketing & Case Officers</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Automate campaign tasks, audit verification, and keep every lawful inquiry on schedule.
              </p>
              <div className="pt-2 text-xs font-semibold text-orange-600 flex items-center space-x-1">
                <span>View Compliance Standard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: User Trends (Visual Orange Bar Chart) */}
            <div className="bg-[#FBFBFA] p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Age-Based User Trends</h4>
                  <span className="text-[10px] text-stone-400">Demographic distribution</span>
                </div>
                <span className="text-[10px] font-mono text-orange-600 font-bold">1948–2026</span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-stone-400">11.6%</span>
                  <div className="w-full bg-orange-200 rounded-t-lg h-12"></div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-orange-600 font-bold">32.2%</span>
                  <div className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg h-24"></div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-stone-400">25.9%</span>
                  <div className="w-full bg-orange-300 rounded-t-lg h-16"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* COMPLIANCE & ETHICAL ETHOS BANNER */}
      <section id="compliance" className="py-16 bg-[#FBFBFA] border-t border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#181E29] to-[#0F172A] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-300 border border-orange-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  <span>Ethical Consent & Technical Standards</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Transparent Visitor Consent & Lawful Data Protection
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  TrackOps BD strictly implements transparent consent workflows under W3C standard compliance.
                  Visitors always retain control over voluntary permissions, ensuring trusted operations.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to="/cell-converter"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs px-6 py-3 rounded-full shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2"
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
    </div>
  );
}
