import React from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  Cpu,
  Monitor,
} from 'lucide-react';

export default function ActiveDeviceCard({
  session,
  isCurrent = true,
  onRevokeOthers = null,
  revoking = false,
  className = '',
}) {
  const isMobile =
    session?.deviceType === 'Mobile' ||
    /Mobile|Android|iPhone/i.test(session?.operatingSystem || session?.deviceName || '');
  const isTablet =
    session?.deviceType === 'Tablet' || /iPad|Tablet/i.test(session?.deviceName || '');

  const DeviceIcon = isTablet ? Tablet : isMobile ? Smartphone : Laptop;

  const modelName =
    session?.model && session.model !== 'Model unavailable'
      ? session.model
      : session?.deviceName || 'Authorized Device';

  const brand =
    session?.manufacturer && session.manufacturer !== 'N/A'
      ? session.manufacturer
      : isMobile
      ? 'Mobile Device'
      : 'Workstation';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-white via-stone-50/70 to-sky-50/30 rounded-2xl border border-stone-200/90 shadow-sm p-5 transition-all ${className}`}
    >
      {/* Top Banner / Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-200/70">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            {isCurrent ? 'Current Login Device' : 'Active Session Device'}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              THIS DEVICE
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-stone-500 bg-white px-2.5 py-1 rounded-lg border border-stone-200/60 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-sky-600" />
          <span>{session?.ipAddress || '127.0.0.1'}</span>
        </div>
      </div>

      {/* Main Device Identity Grid */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Device Icon & Main Details */}
        <div className="flex items-start sm:items-center space-x-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
            <DeviceIcon className="w-7 h-7" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                {modelName}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/70">
                {brand}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-1">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-stone-400" />
                <span>{session?.operatingSystem || 'Operating System'}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center space-x-1">
                <Monitor className="w-3.5 h-3.5 text-stone-400" />
                <span>{session?.browser || 'Browser'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Verification & Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Secure Session</span>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              Logged in:{' '}
              {session?.firstLogin
                ? new Date(session.firstLogin).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Active Now'}
            </span>
          </div>
        </div>
      </div>

      {/* Revoke Others Action if available */}
      {onRevokeOthers && (
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
          <span className="text-stone-500 text-[11px]">
            Keep your account secure by signing out unrecognized devices.
          </span>
          <button
            onClick={onRevokeOthers}
            disabled={revoking}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{revoking ? 'Logging out...' : 'Log out other devices'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
