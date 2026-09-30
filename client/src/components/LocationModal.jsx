import React, { useState } from 'react';
import {
  MapPin,
  X,
  Copy,
  Check,
  ExternalLink,
  Target,
  Crosshair,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import GeoMap from './GeoMap';

export default function LocationModal({ isOpen, onClose, visit }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !visit) return null;

  const isGps = visit.voluntarilySharedLocation && visit.latitude && visit.longitude;
  const lat = visit.latitude
    ? Number(visit.latitude).toFixed(6)
    : (visit.ipIntelligence?.coordinates?.latitude ? Number(visit.ipIntelligence.coordinates.latitude).toFixed(6) : '23.700400');
  const lng = visit.longitude
    ? Number(visit.longitude).toFixed(6)
    : (visit.ipIntelligence?.coordinates?.longitude ? Number(visit.ipIntelligence.coordinates.longitude).toFixed(6) : '90.428700');

  const accuracy = isGps ? Math.round(visit.accuracy || 15) : 25000;
  const locationSource = isGps ? 'GPS (exact)' : (visit.locationSource || 'IP (approximate)');
  const permissionStatus = visit.locationConsentStatus || (isGps ? 'Granted' : 'Not Requested');

  const coordsString = `${lat}, ${lng}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = (() => {
    try {
      return new Date(visit.timestamp || visit.visitTimestamp || Date.now()).toLocaleString();
    } catch (_) {
      return 'N/A';
    }
  })();

  const mapPoint = {
    latitude: Number(lat),
    longitude: Number(lng),
    accuracy,
    visitorReferenceId: visit.visitorReferenceId || 'Visitor',
    timestamp: visit.timestamp,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[#0B192C] tracking-tight">Location Details</h3>
              <p className="text-xs text-slate-500 font-medium">
                Geographical coordinate telemetry & spatial mapping verification
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Warning / State notice if GPS was not shared */}
          {!isGps ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Precise location was not shared.</span>
                <p className="text-amber-700 mt-0.5 leading-relaxed text-[11px]">
                  The visitor did not grant browser GPS coordinates. Showing regional approximate coordinates derived from their ISP network routing registry.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Explicit GPS Consent Granted</span>
                <p className="text-emerald-700 mt-0.5 leading-relaxed text-[11px]">
                  The visitor voluntarily consented to share high-precision device coordinates via the standard HTML5 browser Geolocation API.
                </p>
              </div>
            </div>
          )}

          {/* Location Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Latitude
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-1 block">{lat}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Longitude
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-1 block">{lng}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Accuracy
              </span>
              <span className="font-bold text-slate-800 text-sm mt-1 block">
                {isGps ? `± ${accuracy} meters` : '± 25,000 meters (ISP Node)'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Location Source
              </span>
              <span className="font-bold text-slate-800 text-xs mt-1 block">{locationSource}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Permission Status
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                permissionStatus === 'Granted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {permissionStatus}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Timestamp
              </span>
              <span className="font-medium text-slate-600 text-[11px] mt-1 block truncate">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Interactive OpenStreetMap Visualization */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <GeoMap points={[mapPoint]} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleCopyCoords}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Coordinates Copied!' : 'Copy Coordinates'}</span>
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

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
