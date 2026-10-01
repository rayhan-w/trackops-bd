import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  Camera,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Download,
  Filter,
  Info,
  ChevronLeft,
  ChevronRight,
  Globe,
  Crosshair,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import VisitDetailsModal from '../components/VisitDetailsModal';
import IpAnalysisModal from '../components/IpAnalysisModal';
import LocationModal from '../components/LocationModal';
import CameraModal from '../components/CameraModal';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function VisitorActivity() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedLinkId, setSelectedLinkId] = useState('ALL');
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState('');

  // Modals state
  const [selectedVisitForDetails, setSelectedVisitForDetails] = useState(null);
  const [selectedIpForAnalysis, setSelectedIpForAnalysis] = useState(null);
  const [ipModalOpen, setIpModalOpen] = useState(false);
  const [selectedVisitForLocation, setSelectedVisitForLocation] = useState(null);
  const [selectedVisitForCamera, setSelectedVisitForCamera] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');

  // Update last refreshed time
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

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        search,
        page,
        limit: 15,
      };
      if (selectedLinkId !== 'ALL') {
        params.linkId = selectedLinkId;
      }

      const res = await api.getVisitorActivities(params);

      if (res.success) {
        setActivities(res.activities || []);
        if (res.pagination) setPagination(res.pagination);
        updateTimestamp();
      }
    } catch (err) {
      console.error('Error fetching visitor activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary stats & user's links for dropdown
  const fetchSummary = async () => {
    try {
      const [linksRes, analyticsRes] = await Promise.all([
        api.getMyLinks(),
        api.getAnalyticsDashboard().catch(() => null),
      ]);

      if (linksRes.success) {
        setLinks(linksRes.links || []);
      }

      if (analyticsRes && analyticsRes.stats) {
        setStats({
          totalLinks: analyticsRes.stats.totalLinks || 0,
          totalVisits: analyticsRes.stats.totalVisits || 0,
          uniqueVisitors: analyticsRes.stats.totalUniqueVisits || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching summary stats:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchActivities(1);
  }, [selectedLinkId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities(1);
  };

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
          title="Visit Records & Telemetry"
          subtitle="Real-time log of visitor inquiries, IP intelligence, and voluntary consent disclosures."
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
                  {stats.totalLinks || links.length}
                </div>
                <span className="text-[11px] text-blue-600 font-medium mt-1 block">Active investigation links</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Total Clicks</span>
                <div className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">
                  {stats.totalVisits || pagination.total}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Total inquiries generated</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Unique Visitors */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Unique Visitors</span>
                <div className="text-3xl font-extrabold text-violet-600 font-mono mt-1">
                  {stats.uniqueVisitors || pagination.total}
                </div>
                <span className="text-[11px] text-violet-700 font-medium mt-1 block">Distinct visitor sessions</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & FILTER TOOLBAR (Requirement 3) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search and Link Selector */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search IP, Visitor ID, Link..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>

              {/* Link selection dropdown */}
              <select
                value={selectedLinkId}
                onChange={(e) => setSelectedLinkId(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none w-full sm:w-auto"
              >
                <option value="ALL">All Investigation Links</option>
                {links.map((lnk) => (
                  <option key={lnk._id} value={lnk._id}>
                    {lnk.title} ({lnk.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons: IP Request, CSV File, Refresh */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start sm:justify-end">
              {/* Action 1: IP Request */}
              <button
                type="button"
                onClick={() => handleOpenIpModal('103.199.109.91')}
                className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs rounded-xl border border-orange-200 transition-colors flex items-center space-x-1.5"
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
                onClick={() => fetchActivities(pagination.page)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* VISIT RECORDS CARD & TABLE (Matching Screenshot 2: media_1790768806273.png) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header matching Screenshot 2 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-[#0B192C]">Visit Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {activities.length} recent visit{activities.length === 1 ? '' : 's'}
                </p>
              </div>

              {/* Right side: Last refreshed timestamp */}
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last refreshed: {lastRefreshed || '17:46:18'}</span>
              </div>
            </div>

            {/* Table matching Screenshot 2 */}
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading visit records...</span>
                      </td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No visit records found.
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
                      const deviceType = act.browserInfo?.deviceType || act.browserInfo?.device || 'Desktop';
                      const os = act.browserInfo?.os || 'Windows';
                      const browser = act.browserInfo?.browser || 'Chrome';
                      const model = act.browserInfo?.model || act.browserInfo?.deviceName || (deviceType === 'Mobile' ? 'Smartphone' : 'Workstation');
                      const manufacturer = act.browserInfo?.manufacturer && act.browserInfo?.manufacturer !== 'N/A' && act.browserInfo?.manufacturer !== 'Unknown' ? act.browserInfo.manufacturer : null;
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

                          {/* 3. DEVICE: Icon + Model Name [Brand Badge] + OS • Browser */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                                <DeviceIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  {manufacturer && (
                                    <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded border border-blue-200/60 uppercase tracking-wider">
                                      {manufacturer}
                                    </span>
                                  )}
                                  <span className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={model}>
                                    {model}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                  {os} {act.browserInfo?.osVersion && act.browserInfo?.osVersion !== 'N/A' ? act.browserInfo.osVersion : ''} • {browser}
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

                          {/* 5. ACTIONS: Check IP, Details, Camera, Location (Matches Screenshot 2) */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Orange Check IP Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenIpModal(ip)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-full shadow-2xs transition-all flex items-center space-x-1"
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

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.pages} ({pagination.total} visits)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => fetchActivities(pagination.page - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchActivities(pagination.page + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* MODAL 1: VISIT DETAILS MODAL (Screenshot 1) */}
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

      {/* MODAL 2: IP ANALYSIS MODAL (Requirement 4) */}
      {ipModalOpen && (
        <IpAnalysisModal
          isOpen={ipModalOpen}
          onClose={() => setIpModalOpen(false)}
          initialIp={selectedIpForAnalysis || '103.199.109.91'}
        />
      )}

      {/* MODAL 3: LOCATION MODAL (Requirement 6) */}
      {selectedVisitForLocation && (
        <LocationModal
          isOpen={Boolean(selectedVisitForLocation)}
          onClose={() => setSelectedVisitForLocation(null)}
          visit={selectedVisitForLocation}
        />
      )}

      {/* MODAL 4: CAMERA MODAL (Requirement 7) */}
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
