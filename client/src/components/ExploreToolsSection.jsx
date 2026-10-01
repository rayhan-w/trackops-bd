import React from 'react';
import { ExternalLink, Radio, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function ExploreToolsSection({ variant = 'default', className = '' }) {
  const tools = [
    {
      title: 'LAC Cell Decoder',
      subtitle: 'Telecom tower & cell site decoding utility',
      url: 'https://www.laccelldecoder.com/',
      icon: Radio,
      accent: 'blue',
      badge: 'Cell ID / LAC',
      description: 'Decode LAC and Cell ID values into geographic coordinates and cell site information.',
    },
    {
      title: 'CDR Analyzer',
      subtitle: 'Call detail record analysis & pattern discovery',
      url: 'https://cdr-analyzer.com/',
      icon: FileSpreadsheet,
      accent: 'violet',
      badge: 'CDR Forensics',
      description: 'Perform advanced call detail record investigation, frequency clustering, and timeline correlation.',
    },
  ];

  if (variant === 'footer') {
    return (
      <div className={`pt-4 pb-2 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Explore Tools
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tools.map((t) => {
            const Icon = t.icon;
            const isBlue = t.accent === 'blue';
            return (
              <a
                key={t.title}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 transition-all text-left shadow-2xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isBlue ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {t.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-2 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Explore Related Tools
            </h3>
            <p className="text-xs text-stone-500">
              Explore additional tools and resources for investigation and intelligence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {tools.map((t) => {
            const Icon = t.icon;
            const isBlue = t.accent === 'blue';
            return (
              <div
                key={t.title}
                className="rounded-xl p-4 bg-gradient-to-br from-white to-stone-50/60 border border-stone-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isBlue
                          ? 'bg-sky-50 text-sky-600 border border-sky-200/60'
                          : 'bg-violet-50 text-violet-600 border border-violet-200/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                      <span className="text-[10px] text-stone-400 font-mono truncate block">
                        {t.url}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      isBlue ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 mb-3 leading-relaxed">
                  {t.description}
                </p>

                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs hover:shadow-sm ${
                    isBlue
                      ? 'bg-sky-600 hover:bg-sky-700'
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  <span>Explore Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default Full Section (Homepage)
  return (
    <section className={`py-14 bg-gradient-to-b from-[#FBFBFA] to-white border-t border-stone-200/70 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full text-xs font-semibold text-indigo-700 shadow-2xs mb-3">
            <Radio className="w-3.5 h-3.5 text-indigo-500" />
            <span>Integrated Telecom & Forensics Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Related Tools
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Explore additional tools and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map((t) => {
            const Icon = t.icon;
            const isBlue = t.accent === 'blue';
            return (
              <div
                key={t.title}
                className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isBlue
                          ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-xs shadow-sky-500/10'
                          : 'bg-violet-50 text-violet-600 border border-violet-100 shadow-xs shadow-violet-500/10'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        isBlue
                          ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                          : 'bg-violet-50 text-violet-700 border-violet-200/80'
                      }`}
                    >
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-950">
                    {t.title}
                  </h3>
                  <div className="text-xs font-mono text-stone-400 mb-3 truncate">
                    {t.url}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                    {t.description}
                  </p>
                </div>

                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 shadow-sm ${
                    isBlue
                      ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20 hover:shadow-sky-600/30'
                      : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20 hover:shadow-violet-600/30'
                  }`}
                >
                  <span>Explore Tool</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
