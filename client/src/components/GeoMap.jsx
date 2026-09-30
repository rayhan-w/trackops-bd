import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, ShieldCheck, Layers } from 'lucide-react';

export default function GeoMap({ points = [], selectedPoint = null }) {
  const [activePoint, setActivePoint] = useState(selectedPoint || (points.length > 0 ? points[0] : null));

  if (!points || points.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-slate-200/80 rounded-2xl flex items-center justify-center text-slate-500 mb-3">
          <Navigation className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-slate-700 text-sm">No Voluntary Coordinates Shared Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Coordinates are only recorded when a visitor explicitly grants the browser location consent dialog.
        </p>
      </div>
    );
  }

  const current = activePoint || points[0];
  const lat = Number(current.latitude).toFixed(6);
  const lng = Number(current.longitude).toFixed(6);
  const accuracy = Math.round(current.accuracy || 15);

  // OpenStreetMap embed URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(current.longitude) - 0.01}%2C${Number(current.latitude) - 0.01}%2C${Number(current.longitude) + 0.01}%2C${Number(current.latitude) + 0.01}&layer=mapnik&marker=${current.latitude}%2C${current.longitude}`;

  const googleMapsUrl = `https://www.google.com/maps?q=${current.latitude},${current.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${current.latitude}&mlon=${current.longitude}#map=16/${current.latitude}/${current.longitude}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Map Header Toolbar */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Voluntary Geolocation Visualization</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                Explicit Consent Recorded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Coordinates derived strictly via browser Geolocation API callback
            </p>
          </div>
        </div>

        {/* External Mapping shortcuts */}
        <div className="flex items-center space-x-2 text-xs">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="relative w-full h-[380px] bg-slate-100">
        <iframe
          title="OpenStreetMap Geolocation"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmEmbedUrl}
          className="w-full h-full filter saturate-[1.1]"
        />

        {/* Floating Telemetry HUD */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/90 shadow-lg text-xs max-w-xs space-y-1.5 font-mono">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold font-sans">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Target Coordinates</span>
          </div>
          <div className="text-slate-700">
            <span className="text-slate-400 text-[10px]">LAT:</span> {lat}° N
          </div>
          <div className="text-slate-700">
            <span className="text-slate-400 text-[10px]">LNG:</span> {lng}° E
          </div>
          <div className="text-slate-700 flex items-center space-x-1">
            <span className="text-slate-400 text-[10px]">ACCURACY:</span>
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              ±{accuracy} meters
            </span>
          </div>
          {current.timestamp && (
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              Captured: {new Date(current.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Point Selector if multiple coordinates exist */}
      {points.length > 1 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold text-xs whitespace-nowrap">
            All Shared Points ({points.length}):
          </span>
          {points.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setActivePoint(p)}
              className={`px-3 py-1 rounded-lg font-mono whitespace-nowrap transition-colors border ${
                activePoint?.id === p.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              #{idx + 1} ({Number(p.latitude).toFixed(3)}, {Number(p.longitude).toFixed(3)})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
