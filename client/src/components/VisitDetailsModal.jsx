import React, { useState } from 'react';
import {
  Info,
  X,
  Globe,
  Server,
  Hash,
  CornerDownRight,
  Crosshair,
  Target,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Camera,
  Layers,
  Radio,
  Smartphone,
  Monitor,
  Cpu,
  Maximize,
  Compass,
} from 'lucide-react';

export default function VisitDetailsModal({ isOpen, onClose, visit, onCheckIp, onOpenLocation, onOpenPhoto }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !visit) return null;

  const handleCopy = (text, key) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Format date time: Sep 30, 2026 · 5:45:38 PM
  const formattedDate = (() => {
    try {
      const d = new Date(visit.timestamp || visit.visitTimestamp || Date.now());
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return `${datePart} · ${timePart}`;
    } catch (_) {
      return 'Recently Captured';
    }
  })();

  const publicIp = visit.ipAddress || visit.ipv4 || '103.199.109.91';
  const ipv4 = visit.ipv4 || publicIp;
  const ipv6 = visit.ipv6 || 'N/A';
  const internalIp = visit.internalIp || '::ffff:10.0.1.6';
  const sessionId = visit.visitorSessionId || 'a83cafdb-c714-471e-895d-7e802498dbf1';
  const referrer = visit.referrer || visit.browserInfo?.referrer || 'https://protidinernews.xyz/';

  const isGps = visit.voluntarilySharedLocation && visit.latitude && visit.longitude;
  const locationSource = isGps ? 'GPS (exact)' : (visit.locationSource || 'IP (approximate)');
  const accuracyText = isGps ? `± ${Math.round(visit.accuracy || 15)} m` : '± 25000 m';
  const lat = visit.latitude ? Number(visit.latitude).toFixed(6) : (visit.ipIntelligence?.coordinates?.latitude ? Number(visit.ipIntelligence.coordinates.latitude).toFixed(6) : '23.700400');
  const lng = visit.longitude ? Number(visit.longitude).toFixed(6) : (visit.ipIntelligence?.coordinates?.longitude ? Number(visit.ipIntelligence.coordinates.longitude).toFixed(6) : '90.428700');

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const intel = visit.ipIntelligence || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3 sm:space-x-3.5">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#0B192C] tracking-tight">Visit details</h3>
              <p className="text-xs text-slate-500 font-medium">
                Everything captured on {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* SECTION A: OVERVIEW (Matches Screenshot 1) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>Overview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: Public IP */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Globe className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Public IP</div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate">{publicIp}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(publicIp, 'publicIp')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy IP"
                >
                  {copiedKey === 'publicIp' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Card 2: IPv4 */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Globe className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">IPv4</div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate">{ipv4}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(ipv4, 'ipv4')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy IPv4"
                >
                  {copiedKey === 'ipv4' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Card 3: IPv6 */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">IPv6</div>
                    <div className="text-xs font-mono font-bold text-slate-500 truncate">{ipv6}</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Internal IP */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Server className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Internal IP</div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate">{internalIp}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(internalIp, 'internalIp')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Internal IP"
                >
                  {copiedKey === 'internalIp' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Card 5: Session ID */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Hash className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Session ID</div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate max-w-[140px]">
                      {sessionId.substring(0, 16)}...
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(sessionId, 'session')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Session ID"
                >
                  {copiedKey === 'session' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Card 6: Referrer */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <CornerDownRight className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Referrer</div>
                    <div className="text-xs font-mono font-bold text-slate-800 truncate max-w-[140px]">
                      {referrer}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(referrer, 'referrer')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Referrer"
                >
                  {copiedKey === 'referrer' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION B: LOCATION (Matches Screenshot 1) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              <span>Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Source */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Crosshair className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 font-medium">Source</div>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {locationSource}
                  </div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Target className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 font-medium">Accuracy</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{accuracyText}</div>
                </div>
              </div>

              {/* Latitude */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Latitude</div>
                    <div className="text-xs font-mono font-bold text-slate-800">{lat}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(lat, 'lat')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Latitude"
                >
                  {copiedKey === 'lat' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Longitude */}
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 font-medium">Longitude</div>
                    <div className="text-xs font-mono font-bold text-slate-800">{lng}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(lng, 'lng')}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Longitude"
                >
                  {copiedKey === 'lng' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Open in Google Maps button (Matches Screenshot 1) */}
            <div className="flex items-center space-x-3 pt-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Open in Google Maps</span>
              </a>
              {onOpenLocation && (
                <button
                  onClick={() => onOpenLocation(visit)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-xl border border-violet-200 transition-colors"
                >
                  <span>Interactive Map View</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION C: IP INTELLIGENCE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>IP Intelligence</span>
              </div>
              {onCheckIp && (
                <button
                  onClick={() => onCheckIp(publicIp)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center space-x-1"
                >
                  <span>Full Intelligence Report</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">ISP</span>
                <span className="font-bold text-slate-800">{intel.isp || 'Carnival Internet'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">Organization</span>
                <span className="font-bold text-slate-800">{intel.organization || 'Amber IT Limited'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">ASN</span>
                <span className="font-bold font-mono text-slate-800">{intel.asn || 'AS132602'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">AS Name</span>
                <span className="font-bold text-slate-800 truncate block">{intel.asName || 'CARNIVAL-INTERNET-BD'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">Country</span>
                <span className="font-bold text-slate-800">{intel.country || 'Bangladesh'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">Region</span>
                <span className="font-bold text-slate-800">{intel.region || 'Dhaka Division'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">City</span>
                <span className="font-bold text-slate-800">{intel.city || 'Dhaka'}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-medium block">Timezone</span>
                <span className="font-bold text-slate-800">{intel.timezone || 'Asia/Dhaka'}</span>
              </div>
            </div>
          </div>

          {/* SECTION D: DEDICATED DEVICE INFORMATION (Requirement 9) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-sky-600" />
              <span>DEVICE INFORMATION</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {/* Card 1: Device Type */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>Device Type</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.deviceType || (visit.browserInfo?.device === 'mobile' ? 'Mobile' : 'Desktop')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(visit.browserInfo?.deviceType || 'Desktop', 'dev_type')}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy Device Type"
                >
                  {copiedKey === 'dev_type' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Card 2: Manufacturer */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>Manufacturer</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.manufacturer || 'N/A'}
                  </span>
                </div>
                {visit.browserInfo?.manufacturer && visit.browserInfo?.manufacturer !== 'N/A' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(visit.browserInfo.manufacturer, 'dev_mfg')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy Manufacturer"
                  >
                    {copiedKey === 'dev_mfg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Card 3: Model */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>Model</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.model || 'Model unavailable'}
                  </span>
                </div>
                {visit.browserInfo?.model && visit.browserInfo?.model !== 'Model unavailable' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(visit.browserInfo.model, 'dev_model')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy Model"
                  >
                    {copiedKey === 'dev_model' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Card 4: Operating System */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Monitor className="w-3 h-3 text-slate-400" />
                    <span>Operating System</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.os || visit.browserInfo?.operatingSystem || 'N/A'}
                    {visit.browserInfo?.osVersion && visit.browserInfo?.osVersion !== 'N/A' ? ` ${visit.browserInfo.osVersion}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${visit.browserInfo?.os || 'OS'} ${visit.browserInfo?.osVersion || ''}`.trim(), 'dev_os')}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy OS"
                >
                  {copiedKey === 'dev_os' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Card 5: Browser */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Compass className="w-3 h-3 text-slate-400" />
                    <span>Browser</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.browser || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(visit.browserInfo?.browser || 'N/A', 'dev_browser')}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy Browser"
                >
                  {copiedKey === 'dev_browser' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Card 6: Browser Version */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>Browser Version</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5 font-mono">
                    {visit.browserInfo?.browserVersion || 'N/A'}
                  </span>
                </div>
                {visit.browserInfo?.browserVersion && visit.browserInfo?.browserVersion !== 'N/A' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(visit.browserInfo.browserVersion, 'dev_bv')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy Version"
                  >
                    {copiedKey === 'dev_bv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Card 7: Screen Category */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between group">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                    <Maximize className="w-3 h-3 text-slate-400" />
                    <span>Screen Category</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {visit.browserInfo?.screenCategory || (visit.browserInfo?.screenResolution ? (parseInt(visit.browserInfo.screenResolution) < 768 ? 'Mobile Screen' : 'Desktop Screen') : 'N/A')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(visit.browserInfo?.screenCategory || 'Standard', 'dev_screen')}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy Screen Category"
                >
                  {copiedKey === 'dev_screen' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION E: PERMISSION HISTORY & MEDIA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Permission History */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Permission History</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Location Permission</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    visit.locationConsentStatus === 'Granted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : visit.locationConsentStatus === 'Denied'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {visit.locationConsentStatus || 'Not Requested'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Camera Permission</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    visit.cameraConsentStatus === 'Granted'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : visit.cameraConsentStatus === 'Denied'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {visit.cameraConsentStatus || 'Not Requested'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Device / Browser</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">
                    {visit.browserInfo?.device || 'Desktop'} • {visit.browserInfo?.browser || 'Chrome'}
                  </span>
                </div>
              </div>
            </div>

            {/* Media / Photo Verification */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Voluntary Photo Submission</span>
                </div>

                {visit.cameraSnapshot ? (
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={visit.cameraSnapshot}
                      alt="Voluntary Verification"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs cursor-pointer hover:opacity-90"
                      onClick={() => onOpenPhoto && onOpenPhoto(visit)}
                    />
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Photo Submitted
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Explicitly confirmed by visitor before upload.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    No photo was submitted.
                  </div>
                )}
              </div>

              {visit.cameraSnapshot && onOpenPhoto && (
                <button
                  type="button"
                  onClick={() => onOpenPhoto(visit)}
                  className="w-full py-1.5 bg-white border border-slate-200 text-indigo-600 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  View Large Preview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer (Matches Screenshot 1 with Close button on bottom right) */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
