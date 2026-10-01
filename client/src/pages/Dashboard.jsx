import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Link as LinkIcon,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  Edit,
  Trash2,
  BarChart2,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  MapPin,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import ExploreToolsSection from '../components/ExploreToolsSection';
import ActiveDeviceCard from '../components/ActiveDeviceCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, uniqueVisits: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { user, refreshUser } = useAuth();
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [revokeMessage, setRevokeMessage] = useState('');

  const currentSession =
    user?.activeSessions?.find((s) => s.isCurrent) ||
    user?.activeSessions?.find((s) => s.status === 'ACTIVE') ||
    user?.activeSessions?.[0] ||
    null;

  const handleRevokeOthers = async () => {
    if (!window.confirm('Are you sure you want to log out all other active devices?')) return;
    setRevokingOthers(true);
    setRevokeMessage('');
    try {
      await api.revokeOtherSessions();
      await refreshUser();
      setRevokeMessage('All other active devices have been logged out.');
      setTimeout(() => setRevokeMessage(''), 4000);
    } catch (e) {
      alert(e.message || 'Failed to revoke other sessions');
    } finally {
      setRevokingOthers(false);
    }
  };

  // Edit Modal State
  const [editingLink, setEditingLink] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    destinationUrl: '',
    caseReference: '',
    description: '',
    status: 'ACTIVE',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingLink, setDeletingLink] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [linksRes, notifRes] = await Promise.all([
        api.getLinks({ search, status: statusFilter }),
        api.getNotifications().catch(() => ({ unreadCount: 0 })),
      ]);

      if (linksRes.success) {
        setLinks(linksRes.links || []);
        if (linksRes.stats) {
          setStats(linksRes.stats);
        }
      }
      if (notifRes.success) {
        setUnreadNotifications(notifRes.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setEditForm({
      title: link.title || '',
      destinationUrl: link.destinationUrl || '',
      caseReference: link.caseReference || '',
      description: link.description || '',
      status: link.status || 'ACTIVE',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLink) return;
    setSavingEdit(true);
    try {
      await api.updateLink(editingLink._id, editForm);
      setEditingLink(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update link');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      await api.deleteLink(deletingLink._id);
      setDeletingLink(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete link');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadNotifications}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="My Links"
          subtitle="Manage and create your short links."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadNotifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Statistics Cards (Exactly like screenshots) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {/* Total Links */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Links
                </span>
                <div className="text-3xl font-extrabold text-[#0B192C] mt-1 font-mono">
                  {stats.totalLinks}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Active investigation URLs</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <LinkIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Clicks
                </span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1 font-mono">
                  {stats.totalClicks}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Total visitor redirects</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
            </div>

            {/* Unique Visits */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Unique Visits
                </span>
                <div className="text-3xl font-extrabold text-violet-600 mt-1 font-mono">
                  {stats.uniqueVisits}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Distinct visitor sessions</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Login Device Card (Beautiful Model & Identity) */}
          {currentSession && (
            <div className="space-y-2">
              <ActiveDeviceCard
                session={currentSession}
                isCurrent={true}
                onRevokeOthers={
                  user?.activeSessions?.filter((s) => s.status === 'ACTIVE').length > 1
                    ? handleRevokeOthers
                    : null
                }
                revoking={revokingOthers}
              />
              {revokeMessage && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl animate-fadeIn">
                  {revokeMessage}
                </div>
              )}
            </div>
          )}

          {/* Section Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-2xl font-bold text-[#0B192C] tracking-tight">My Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, monitor and inspect your case verification short links.
              </p>
            </div>
            <Link
              to="/links/new"
              className="bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md shadow-orange-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Link</span>
            </Link>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search short code, case ref, title..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
              <span className="text-slate-400 font-semibold mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              {['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Links Listing Cards / Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 mt-3 font-semibold">Loading Links...</p>
            </div>
          ) : links.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No short links found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                You haven't created any links matching this criteria yet. Create your first case link to begin transparent consent routing.
              </p>
              <Link
                to="/links/new"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Link</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => {
                const fullUrl = `${window.location.origin}/l/${link.shortCode}`;
                const isCopied = copiedId === link._id;

                return (
                  <div
                    key={link._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    {/* Link Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-[#0F172A] group-hover:text-orange-600 transition-colors">
                          {link.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            link.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : link.status === 'EXPIRED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {link.status}
                        </span>
                        <span className="text-[10px] font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-semibold">
                          CASE: {link.caseReference || 'UNASSIGNED'}
                        </span>
                      </div>

                      {/* URLs */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono">
                        <div className="flex items-center space-x-1.5 text-orange-600 font-bold bg-orange-50/80 px-2.5 py-1 rounded-lg border border-orange-100 w-fit">
                          <LinkIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-xs">{fullUrl}</span>
                        </div>
                        <div className="text-stone-400 truncate flex items-center space-x-1">
                          <span>Target:</span>
                          <span className="text-stone-600 truncate max-w-xs">{link.destinationUrl}</span>
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1 font-semibold text-slate-600">
                          <Eye className="w-3 h-3 text-indigo-500" />
                          <span>{link.clicks || 0} Clicks</span>
                        </span>
                        <span className="flex items-center space-x-1 font-semibold text-slate-600">
                          <BarChart2 className="w-3 h-3 text-violet-500" />
                          <span>{link.uniqueVisits || 0} Unique Visits</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start sm:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Copy Short Link */}
                      <button
                        onClick={() => handleCopy(fullUrl, link._id)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Copy Short URL"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Open Visitor Page */}
                      <a
                        href={`/v/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Open Visitor Consent Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Activity & Geolocation Map */}
                      <Link
                        to={`/links/${link._id}/activity`}
                        className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                        title="View Geolocation & Activity"
                      >
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="hidden sm:inline">Activity</span>
                      </Link>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(link)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Edit Link"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeletingLink(link)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Useful Tools Section (Requirement 1) */}
          <ExploreToolsSection variant="compact" />
        </main>
        <Footer />
      </div>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0B192C]">Edit Short Link</h3>
              <button
                onClick={() => setEditingLink(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination URL</label>
                <input
                  type="url"
                  value={editForm.destinationUrl}
                  onChange={(e) => setEditForm({ ...editForm, destinationUrl: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Case Reference ID</label>
                <input
                  type="text"
                  value={editForm.caseReference}
                  onChange={(e) => setEditForm({ ...editForm, caseReference: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-red-200 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Delete Link Record</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete link <span className="font-mono font-bold text-slate-800">[{deletingLink.shortCode}]</span>?
              All associated visits and voluntary coordinates will be permanently purged.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setDeletingLink(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
