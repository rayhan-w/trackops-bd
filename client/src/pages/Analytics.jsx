import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Link as LinkIcon,
  Eye,
  Users,
  Compass,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Globe,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Download,
  Crosshair,
  Info,
  Camera,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import VisitDetailsModal from '../components/VisitDetailsModal';
import IpAnalysisModal from '../components/IpAnalysisModal';
import LocationModal from '../components/LocationModal';
import CameraModal from '../components/CameraModal';
import { api } from '../services/api';

const COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#10B981', '#F59E0B'];

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Visit Logs & Filters
  const [activities, setActivities] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedLinkId, setSelectedLinkId] = useState('ALL');
  const [logsLoading, setLogsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  // Modals
  const [selectedVisitForDetails, setSelectedVisitForDetails] = useState(null);
  const [selectedIpForAnalysis, setSelectedIpForAnalysis] = useState(null);
  const [ipModalOpen, setIpModalOpen] = useState(false);
  const [selectedVisitForLocation, setSelectedVisitForLocation] = useState(null);
  const [selectedVisitForCamera, setSelectedVisitForCamera] = useState(null);

  const updateTimestamp = () => {
    const now = new Date();
    setLastRefreshed(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    );
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsDashboard();
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitLogs = async () => {
    setLogsLoading(true);
    try {
      const params = { limit: 10 };
      if (selectedLinkId !== 'ALL') {
        params.linkId = selectedLinkId;
      }
      const res = await api.getVisitorActivities(params);
      if (res.success) {
        setActivities(res.activities || []);
        updateTimestamp();
      }
    } catch (err) {
      console.error('Error fetching visit logs in analytics:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await api.getMyLinks();
      if (res.success) {
        setLinks(res.links || []);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchLinks();
    fetchVisitLogs();
  }, []);

  useEffect(() => {
    fetchVisitLogs();
  }, [selectedLinkId]);

  const handleExportCsv = async () => {
    try {
      await api.exportVisitorCsv({
        linkId: selectedLinkId !== 'ALL' ? selectedLinkId : undefined,
      });
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  const handleOpenIpModal = (ip) => {
    setSelectedIpForAnalysis(ip || '103.199.109.91');
    setIpModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Investigation Analytics"
          subtitle="Real-time traffic performance, visitor engagement, and voluntary consent telemetry."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TOP STATISTICS (Requirement 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Links */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Total Links</span>
                <div className="text-3xl font-extrabold text-[#0B192C] font-mono mt-1">
                  {analytics?.stats?.totalLinks || links.length || 0}
                </div>
                <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                  {analytics?.stats?.activeLinks || 0} Currently Active
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <LinkIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Total Clicks</span>
                <div className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">
                  {analytics?.stats?.totalVisits || 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Inquiry page triggers</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
            </div>

            {/* Unique Visitors */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Unique Visitors</span>
                <div className="text-3xl font-extrabold text-violet-600 font-mono mt-1">
                  {analytics?.stats?.totalUniqueVisits || 0}
                </div>
                <span className="text-[11px] text-violet-700 font-medium mt-1 block">
                  Distinct sessions verified
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS TOOLBAR (Requirement 3: IP Request, CSV File, Refresh) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Telemetry Actions:
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Action 1: IP Request */}
              <button
                type="button"
                onClick={() => handleOpenIpModal('103.199.109.91')}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors flex items-center space-x-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>IP Request</span>
              </button>

              {/* Action 2: CSV File */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV File</span>
              </button>

              {/* Action 3: Refresh */}
              <button
                type="button"
                onClick={() => {
                  fetchAnalytics();
                  fetchVisitLogs();
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1.5"
                title="Refresh Metrics & Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading || logsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loading || !analytics ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-semibold mt-3">Aggregating Database Analytics...</p>
            </div>
          ) : (
            <>
              {/* Chart 1: Daily Visits & Locations Shared */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-[#0B192C]">Daily Inquiries & Voluntary Locations</h3>
                    <p className="text-xs text-slate-500">
                      14-day chronological distribution of visits vs consent-based coordinate shares
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      <span className="text-slate-600">Visits</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-600">Locations Shared</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyVisits} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLocs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          color: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        stroke="#2563EB"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                        name="Total Visits"
                      />
                      <Area
                        type="monotone"
                        dataKey="locationsShared"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLocs)"
                        name="Locations Shared"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid: Link Performance & Device Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Link Performance (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-[#0B192C]">Top Link Performance</h3>
                      <p className="text-xs text-slate-500">Most active investigation links ranked by visitor clicks</p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topLinks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="shortCode" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            color: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="clicks" fill="#2563EB" radius={[6, 6, 0, 0]} name="Total Clicks" />
                        <Bar dataKey="uniqueVisits" fill="#6366F1" radius={[6, 6, 0, 0]} name="Unique Sessions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Device Breakdown (1 col) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#0B192C]">Device & OS Profile</h3>
                    <p className="text-xs text-slate-500">Operating systems identified via standard browser user-agents</p>
                  </div>

                  <div className="h-52 w-full flex items-center justify-center">
                    {analytics.deviceBreakdown.length === 0 ? (
                      <div className="text-xs text-slate-400">No device data yet</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.deviceBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analytics.deviceBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              color: '#fff',
                              borderRadius: '12px',
                              border: 'none',
                              fontSize: '11px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    {analytics.deviceBreakdown.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-slate-600">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></span>
                          <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{item.value} visits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DETAILED VISIT LOGS SECTION (Requirement 3) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Header matching Screenshot 2 with link selector */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#0B192C]">Detailed Visit Logs</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing recent visitor records with carrier IP analysis and media telemetry
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Link Selection Dropdown */}
                    <select
                      value={selectedLinkId}
                      onChange={(e) => setSelectedLinkId(e.target.value)}
                      className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">All Investigation Links</option>
                      {links.map((lnk) => (
                        <option key={lnk._id} value={lnk._id}>
                          {lnk.title} ({lnk.shortCode})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lastRefreshed || '17:46:18'}</span>
                    </div>
                  </div>
                </div>

                {/* Visit Records table matching Screenshot 2 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">TIME</th>
                        <th className="py-3.5 px-6">IP ADDRESS</th>
                        <th className="py-3.5 px-6">DEVICE</th>
                        <th className="py-3.5 px-6">MEDIA</th>
                        <th className="py-3.5 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {logsLoading ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <span>Loading visit records...</span>
                          </td>
                        </tr>
                      ) : activities.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">
                            No visit records found for selected link.
                          </td>
                        </tr>
                      ) : (
                        activities.map((act) => {
                          const d = new Date(act.timestamp || act.visitTimestamp || Date.now());
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

                          const ip = act.ipAddress || act.ipv4 || '103.199.109.91';
                          const deviceType = act.browserInfo?.device || 'Desktop';
                          const os = act.browserInfo?.os || 'Windows';
                          const browser = act.browserInfo?.browser || 'Chrome';
                          const hasPhoto = Boolean(act.cameraSnapshot || act.voluntarilySharedCamera);

                          const DeviceIcon =
                            deviceType === 'Mobile' ? Smartphone : deviceType === 'Tablet' ? Tablet : Laptop;

                          return (
                            <tr key={act._id} className="hover:bg-slate-50/70 transition-colors">
                              {/* 1. TIME: 2-line stacked timestamp */}
                              <td className="py-4 px-6 whitespace-nowrap">
                                <div className="font-bold text-slate-800">{datePart}</div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{timePart}</div>
                              </td>

                              {/* 2. IP ADDRESS: pill container */}
                              <td className="py-4 px-6 whitespace-nowrap">
                                <span className="inline-block px-3 py-1 bg-white border border-slate-200/90 rounded-xl font-mono text-xs text-slate-700 shadow-2xs font-semibold">
                                  {ip}
                                </span>
                              </td>

                              {/* 3. DEVICE: Icon + Desktop [Windows] + subtext */}
                              <td className="py-4 px-6 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                                    <DeviceIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-slate-800 text-xs">{deviceType}</span>
                                      <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200/60">
                                        {os}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                      {os} • {browser}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 4. MEDIA: Green Photo pill */}
                              <td className="py-4 px-6 whitespace-nowrap">
                                {hasPhoto ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVisitForCamera(act)}
                                    className="px-2.5 py-0.5 bg-[#ecfdf5] hover:bg-emerald-100 text-[#059669] text-[11px] font-bold rounded-lg border border-emerald-200/60 transition-colors cursor-pointer"
                                  >
                                    Photo
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">None</span>
                                )}
                              </td>

                              {/* 5. ACTIONS: Check IP, Details, Camera, Location */}
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Blue Check IP Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenIpModal(ip)}
                                    className="px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                                  >
                                    <span className="text-[10px]">•</span>
                                    <span>Check IP</span>
                                  </button>

                                  {/* White Details Button with circle (i) icon */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVisitForDetails(act)}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/90 shadow-2xs transition-colors flex items-center space-x-1"
                                  >
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Details</span>
                                  </button>

                                  {/* Green Camera Icon Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVisitForCamera(act)}
                                    className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/80 transition-colors"
                                    title="Camera Access Status"
                                  >
                                    <Camera className="w-4 h-4" />
                                  </button>

                                  {/* Purple Location Icon Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVisitForLocation(act)}
                                    className="p-1.5 bg-white hover:bg-purple-50 text-purple-600 rounded-xl border border-purple-200/80 transition-colors"
                                    title="Location Details & Map"
                                  >
                                    <MapPin className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Looking for full audit trail?</span>
                  <Link
                    to="/visitor-activity"
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center space-x-1"
                  >
                    <span>View All Activity Logs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL 1: VISIT DETAILS MODAL */}
      {selectedVisitForDetails && (
        <VisitDetailsModal
          isOpen={Boolean(selectedVisitForDetails)}
          onClose={() => setSelectedVisitForDetails(null)}
          visit={selectedVisitForDetails}
          onCheckIp={(ip) => handleOpenIpModal(ip)}
          onOpenLocation={(v) => setSelectedVisitForLocation(v)}
          onOpenPhoto={(v) => setSelectedVisitForCamera(v)}
        />
      )}

      {/* MODAL 2: IP ANALYSIS MODAL */}
      {ipModalOpen && (
        <IpAnalysisModal
          isOpen={ipModalOpen}
          onClose={() => setIpModalOpen(false)}
          initialIp={selectedIpForAnalysis || '103.199.109.91'}
        />
      )}

      {/* MODAL 3: LOCATION MODAL */}
      {selectedVisitForLocation && (
        <LocationModal
          isOpen={Boolean(selectedVisitForLocation)}
          onClose={() => setSelectedVisitForLocation(null)}
          visit={selectedVisitForLocation}
        />
      )}

      {/* MODAL 4: CAMERA MODAL */}
      {selectedVisitForCamera && (
        <CameraModal
          isOpen={Boolean(selectedVisitForCamera)}
          onClose={() => setSelectedVisitForCamera(null)}
          visit={selectedVisitForCamera}
        />
      )}
    </div>
  );
}
