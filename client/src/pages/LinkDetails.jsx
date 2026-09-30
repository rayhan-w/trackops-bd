import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Camera,
  Compass,
  Calendar,
  Eye,
  ShieldCheck,
  Clock,
  Layers,
  Smartphone,
  Globe,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import GeoMap from '../components/GeoMap';
import { api } from '../services/api';

export default function LinkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await api.getLinkActivity(id);
      if (res.success) {
        setActivityData(res);
      }
    } catch (err) {
      console.error('Error fetching link activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold mt-3">Loading Link Activity & Geolocation...</p>
        </div>
      </div>
    );
  }

  if (!activityData || !activityData.link) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Link Not Found</h2>
        <Link to="/dashboard" className="text-blue-600 text-sm mt-3 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { link, totalVisits, uniqueVisits, geoPoints, visits } = activityData;
  const shortUrl = `${window.location.origin}/l/${link.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Link Activity & Geolocation"
          subtitle={`Case: ${link.caseReference} | Code: [${link.shortCode}]`}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Breadcrumb & Refresh */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Links</span>
            </Link>
            <button
              onClick={fetchActivity}
              className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Activity</span>
            </button>
          </div>

          {/* Link Information Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-[#0B192C]">{link.title}</h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      link.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {link.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>Case: <strong className="text-blue-600 font-mono">{link.caseReference}</strong></span>
                  <span>•</span>
                  <span>Link ID: <strong className="font-mono">{link._id}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(link.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Short URL Banner with Copy & Preview */}
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 font-mono text-xs">
                <span className="text-blue-700 font-bold px-2 truncate max-w-xs">{shortUrl}</span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm font-sans"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`/v/${link.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl"
                  title="Open Visitor Screen"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Target Destination & Description */}
            <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-slate-400 font-medium">Forwarding Destination: </span>
                <span className="font-mono text-slate-700 truncate">{link.destinationUrl}</span>
              </div>
              {link.description && (
                <div className="text-slate-500 italic max-w-md truncate">
                  "{link.description}"
                </div>
              )}
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-center">
                <span className="text-[10px] text-blue-700 font-semibold uppercase">Total Visits</span>
                <div className="text-2xl font-extrabold text-[#0B192C] font-mono mt-0.5">{totalVisits}</div>
              </div>
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 text-center">
                <span className="text-[10px] text-indigo-700 font-semibold uppercase">Unique Visitors</span>
                <div className="text-2xl font-extrabold text-indigo-700 font-mono mt-0.5">{uniqueVisits}</div>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase">Shared Coordinates</span>
                <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">{geoPoints.length}</div>
              </div>
              <div className="bg-violet-50/60 p-3 rounded-2xl border border-violet-100 text-center">
                <span className="text-[10px] text-violet-700 font-semibold uppercase">Consent Compliance</span>
                <div className="text-2xl font-extrabold text-violet-700 font-mono mt-0.5">100%</div>
              </div>
            </div>
          </div>

          {/* Interactive Geolocation Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0B192C] flex items-center space-x-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Voluntary Coordinate Telemetry</span>
              </h3>
              <span className="text-xs text-slate-500">
                {geoPoints.length} Geocoded Location{geoPoints.length === 1 ? '' : 's'}
              </span>
            </div>

            <GeoMap points={geoPoints} />
          </div>

          {/* Detailed Visit Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Inquiry Activity Ledger</h3>
                <p className="text-xs text-slate-500">Individual visitor interactions, consent states and voluntary disclosures</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                {visits.length} Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Consent Status</th>
                    <th className="py-3 px-4">Location Permission</th>
                    <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Camera</th>
                    <th className="py-3 px-4">Device & OS</th>
                    <th className="py-3 px-4">Session Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {visits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                        No visits recorded for this link yet.
                      </td>
                    </tr>
                  ) : (
                    visits.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(v.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              v.consentStatus === 'GRANTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : v.consentStatus === 'DENIED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {v.consentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {v.voluntarilySharedLocation ? (
                            <span className="text-emerald-600 font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Granted</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Declined / None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold whitespace-nowrap">
                          {v.voluntarilySharedLocation && v.latitude && v.longitude ? (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {Number(v.latitude).toFixed(5)}, {Number(v.longitude).toFixed(5)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Not Disclosed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {v.accuracy ? `±${Math.round(v.accuracy)}m` : '—'}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {v.voluntarilySharedCamera ? (
                            <span className="text-violet-600 font-bold text-[10px] bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                              Snapshot Confirmed
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-700 whitespace-nowrap">
                          {v.browserInfo?.os || 'Standard Browser'}{' '}
                          <span className="text-slate-400 text-[10px]">
                            ({v.browserInfo?.browser || 'Web'})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[100px]">
                          {v.ipHash || v.visitorSessionId?.slice(0, 10) || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
