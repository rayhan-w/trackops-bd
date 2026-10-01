import React, { useState, useEffect } from 'react';
import {
  Globe,
  X,
  Copy,
  Check,
  Search,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Server,
  Building,
  Hash,
  Layers,
  Clock,
  Coins,
  Smartphone,
  ShieldCheck,
  Network,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export default function IpAnalysisModal({ isOpen, onClose, initialIp = '103.199.109.91' }) {
  const [ipInput, setIpInput] = useState(initialIp);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = async (targetIp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeIp(targetIp);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      } else {
        setError('Unable to analyze target IP address.');
      }
    } catch (err) {
      setError(err.message || 'Error querying IP intelligence service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIpInput(initialIp || '103.199.109.91');
      fetchAnalysis(initialIp || '103.199.109.91');
    }
  }, [isOpen, initialIp]);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (ipInput.trim()) {
      fetchAnalysis(ipInput.trim());
    }
  };

  const coords = analysis?.coordinates || { latitude: 23.7004, longitude: 90.4287 };
  const googleMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=14/${coords.latitude}/${coords.longitude}`;

  const cards = [
    { key: 'ip', label: 'IP Address', value: analysis?.ipAddress || ipInput, icon: Globe },
    { key: 'isp', label: 'ISP', value: analysis?.isp || 'Carnival Internet', icon: Network },
    { key: 'org', label: 'Organization', value: analysis?.organization || 'Amber IT Limited', icon: Building },
    { key: 'asn', label: 'ASN', value: analysis?.asn || 'AS132602', icon: Hash, isMono: true },
    { key: 'asname', label: 'AS Name', value: analysis?.asName || 'CARNIVAL-INTERNET-BD', icon: Server },
    { key: 'revdns', label: 'Reverse DNS', value: analysis?.reverseDns || `${analysis?.ipAddress || ipInput}.reverse.net`, icon: Network },
    { key: 'continent', label: 'Continent', value: analysis?.continent || 'Asia', icon: Globe },
    { key: 'country', label: 'Country', value: analysis?.country || 'Bangladesh', icon: Globe },
    { key: 'countryCode', label: 'Country Code', value: analysis?.countryCode || 'BD', icon: Globe, isMono: true },
    { key: 'region', label: 'Region', value: analysis?.region || 'Dhaka Division', icon: MapPin },
    { key: 'city', label: 'City', value: analysis?.city || 'Dhaka', icon: MapPin },
    { key: 'postal', label: 'Postal Code', value: analysis?.postalCode || '1205', icon: MapPin, isMono: true },
    { key: 'timezone', label: 'Timezone', value: analysis?.timezone || 'Asia/Dhaka', icon: Clock },
    { key: 'offset', label: 'UTC Offset', value: analysis?.utcOffset || '+06:00', icon: Clock, isMono: true },
    { key: 'currency', label: 'Currency', value: analysis?.currency || 'BDT (৳)', icon: Coins },
    { key: 'mobile', label: 'Mobile Connection', value: analysis?.isMobile ? 'Yes (Cellular)' : 'No (Broadband / Fixed)', icon: Smartphone },
    { key: 'proxy', label: 'Proxy / VPN', value: analysis?.isProxy ? 'Detected (Proxy / VPN)' : 'Not Detected (Direct)', icon: ShieldCheck },
    { key: 'hosting', label: 'Hosting / Datacenter', value: analysis?.isHosting ? 'Yes (Datacenter)' : 'No (Residential / Commercial ISP)', icon: Server },
    {
      key: 'coords',
      label: 'Coordinates (Approximate)',
      value: `${Number(coords.latitude).toFixed(4)}, ${Number(coords.longitude).toFixed(4)}`,
      icon: MapPin,
      isMono: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3 sm:space-x-3.5">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#0B192C] tracking-tight">IP Address Analysis</h3>
              <p className="text-xs text-slate-500 font-medium">
                Authorized regional IP intelligence & carrier network routing data
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

        {/* Toolbar & Search */}
        <div className="p-4 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Enter IP address to analyze (e.g. 103.199.109.91)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Analyze IP'}</span>
            </button>
          </form>

          {/* Mandatory Legal & Technical Distinction Notice */}
          <div className="mt-3 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/90 rounded-xl p-2.5 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Technical Clarification:</strong> IP-derived coordinates represent regional ISP network routing nodes, not the device's precise physical GPS position. For precise physical location, refer strictly to browser-consented GPS coordinates.
            </p>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error ? (
            <div className="p-8 text-center text-red-600 text-xs font-semibold">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex items-center justify-between hover:bg-white hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:text-blue-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          {item.label}
                        </span>
                        <span
                          className={`text-xs font-bold text-slate-800 truncate block mt-0.5 ${
                            item.isMono ? 'font-mono' : ''
                          }`}
                        >
                          {item.value || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.value, item.key)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors ml-1 flex-shrink-0"
                      title={`Copy ${item.label}`}
                    >
                      {copiedKey === item.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>View Map (Google Maps)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 transition-colors"
            >
              <span>OpenStreetMap</span>
              <ExternalLink className="w-3 h-3 text-blue-500" />
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
