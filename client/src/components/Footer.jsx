import React from 'react';
import { Sparkles, Shield, Send } from 'lucide-react';
import LawEnforcementNotice from './LawEnforcementNotice';
import ExploreToolsSection from './ExploreToolsSection';

// Social platform SVG icons
function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

function TwitterIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook page' },
    { name: 'X / Twitter', icon: TwitterIcon, href: 'https://x.com', label: 'X / Twitter profile' },
    { name: 'LinkedIn', icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn profile' },
    { name: 'Telegram', icon: TelegramIcon, href: 'https://t.me', label: 'Telegram channel' },
  ];

  return (
    <footer className="mt-auto w-full">
      {/* 1. Global Law Enforcement Notice immediately above footer */}
      <LawEnforcementNotice />

      {/* 2. Simplified, Minimal Footer */}
      <div className="bg-[#0B1120] text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          {/* Top Row: Brand & Small Explore Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-800/80">
            {/* Logo and brief identity */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-white tracking-tight">
                    TrackOps BD
                  </span>
                  <div className="text-[11px] text-slate-400">
                    Lawful Link & Consent Intelligence Hub
                  </div>
                </div>
              </div>
            </div>

            {/* Small Explore Tools in Footer */}
            <div className="lg:col-span-6">
              <ExploreToolsSection variant="footer" />
            </div>
          </div>

          {/* Bottom Row: Social Icons & Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            {/* Copyright */}
            <div className="text-center sm:text-left">
              © {currentYear} <span className="font-semibold text-slate-300">TrackOps BD</span>. All rights reserved.
            </div>

            {/* Recognizable Social Platform Icons */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-sky-500 hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 border border-slate-700/60 hover:border-sky-400 shadow-2xs"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
