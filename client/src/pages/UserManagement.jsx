import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Layers,
  ArrowRight,
  UserCheck,
  Calendar,
  Smartphone,
  X,
  Laptop,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DURATION_PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '180 Days', days: 180 },
  { label: '365 Days', days: 365 },
];

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    suspendedUsers: 0,
    totalLinks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Action Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'REJECT' | 'SUSPEND' | 'ROLE' | 'DELETE' | 'EXPIRY' | 'SESSIONS'
  const [reasonInput, setReasonInput] = useState('');
  const [newRoleInput, setNewRoleInput] = useState('USER');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Expiry Form State
  const [expiryForm, setExpiryForm] = useState({
    activationDate: '',
    expiryDate: '',
    durationDays: 30,
    status: 'APPROVED',
  });

  // Device & Sessions Modal State
  const [userSessions, setUserSessions] = useState([]);
  const [deviceLimitInput, setDeviceLimitInput] = useState(1);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        search,
        status: statusFilter,
        role: roleFilter,
      });
      if (res.success) {
        setUsers(res.users || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Direct Approve
  const handleApprove = async (user) => {
    try {
      const res = await api.approveUser(user._id);
      showToast(`User ${user.name} approved. They can now create links.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error approving user');
    }
  };

  // Direct Restore
  const handleRestore = async (user) => {
    try {
      const res = await api.restoreUser(user._id);
      showToast(`User ${user.name} restored to APPROVED.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error restoring user');
    }
  };

  // Open Expiry Modal
  const openExpiryModal = (user) => {
    setSelectedUser(user);
    setActionType('EXPIRY');
    const actDate = user.activationDate
      ? new Date(user.activationDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const expDate = user.expiryDate
      ? new Date(user.expiryDate).toISOString().slice(0, 10)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    setExpiryForm({
      activationDate: actDate,
      expiryDate: expDate,
      durationDays: 30,
      status: user.status || 'APPROVED',
    });
  };

  // When Duration Preset is selected
  const handleDurationPreset = (days) => {
    const base = expiryForm.activationDate ? new Date(expiryForm.activationDate) : new Date();
    const newExp = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setExpiryForm({
      ...expiryForm,
      durationDays: days,
      expiryDate: newExp.toISOString().slice(0, 10),
    });
  };

  // Save Expiry & Duration
  const handleSaveExpiry = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.updateUserExpiry(selectedUser._id, {
        activationDate: expiryForm.activationDate,
        expiryDate: expiryForm.expiryDate,
        status: expiryForm.status,
      });
      showToast(`Account timeline and expiry updated for ${selectedUser.name}.`);
      setSelectedUser(null);
      setActionType(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error updating expiry');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Device & Sessions Modal
  const openSessionsModal = async (user) => {
    setSelectedUser(user);
    setActionType('SESSIONS');
    setDeviceLimitInput(user.allowedDeviceLimit || 1);
    setSessionsLoading(true);
    try {
      const res = await api.getUserSessions(user._id);
      if (res.success) {
        setUserSessions(res.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setUserSessions(user.activeSessions || []);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Save Device Limit
  const handleSaveDeviceLimit = async () => {
    if (!selectedUser) return;
    try {
      await api.updateDeviceLimit(selectedUser._id, deviceLimitInput);
      showToast(`Allowed device limit updated to ${deviceLimitInput}.`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update device limit');
    }
  };

  // Revoke Specific Session
  const handleRevokeSession = async (sessionId) => {
    if (!selectedUser) return;
    try {
      const res = await api.revokeUserSession(selectedUser._id, sessionId);
      if (res.success) {
        setUserSessions(res.sessions || []);
        showToast('Device session revoked.');
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Error revoking session');
    }
  };

  // Revoke All Sessions
  const handleRevokeAllSessions = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Revoke all active device sessions for ${selectedUser.name}?`)) return;
    try {
      const res = await api.revokeAllUserSessions(selectedUser._id);
      if (res.success) {
        setUserSessions(res.sessions || []);
        showToast('All device sessions revoked.');
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Error revoking sessions');
    }
  };

  // Confirm Modal Actions
  const handleActionConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'REJECT') {
        await api.rejectUser(selectedUser._id, reasonInput);
        showToast(`Registration for ${selectedUser.name} rejected.`);
      } else if (actionType === 'SUSPEND') {
        await api.suspendUser(selectedUser._id, reasonInput);
        showToast(`Account for ${selectedUser.name} suspended.`);
      } else if (actionType === 'ROLE') {
        await api.changeUserRole(selectedUser._id, newRoleInput);
        showToast(`Role for ${selectedUser.name} changed to ${newRoleInput}.`);
      } else if (actionType === 'DELETE') {
        await api.deleteUser(selectedUser._id);
        showToast(`User ${selectedUser.name} deleted.`);
      }
      setSelectedUser(null);
      setActionType(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate Remaining Days Helper
  const calcRemainingDays = (expiryDate) => {
    if (!expiryDate) {
      return { text: 'No Limit', isExpired: false, badgeClass: 'bg-stone-100 text-stone-600' };
    }
    const diffMs = new Date(expiryDate).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return { text: 'Expired', isExpired: true, badgeClass: 'bg-red-100 text-red-700 font-bold' };
    }
    if (days <= 7) {
      return { text: `${days}d left`, isExpired: false, badgeClass: 'bg-amber-100 text-amber-800 font-bold' };
    }
    return { text: `${days}d left`, isExpired: false, badgeClass: 'bg-emerald-50 text-emerald-700 font-semibold' };
  };

  return (
    <div className="min-h-screen flex bg-[#FBFBFA] text-[#0F172A]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title="Personnel Governance & Access"
          subtitle="Authorize accounts, assign rank & posting, configure validity timelines and device limits"
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold animate-fadeIn">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage('')} className="p-1 hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs font-semibold uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
              <div className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Pending Review</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingUsers}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
              <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">Active Officers</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedUsers}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
              <div className="text-red-500 text-xs font-semibold uppercase tracking-wider">Suspended</div>
              <div className="text-2xl font-black text-red-500 mt-1">{stats.suspendedUsers}</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, rank..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
              {/* Status Filter */}
              <div className="flex items-center space-x-1">
                {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      statusFilter === st
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchUsers}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 ml-auto transition-colors"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Management Table */}
          {/* Requirement 5 exact columns: Name | Rank | Posting | Status | Expiry Date | Remaining Days | Actions */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Personnel Roster & Access Controls</h3>
                <p className="text-xs text-stone-500">
                  Enforce expiration policies, monitor active device sessions, and vet applications
                </p>
              </div>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-xl font-bold">
                {users.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-5">Name</th>
                    <th className="py-3.5 px-5">Rank</th>
                    <th className="py-3.5 px-5">Posting</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Expiry Date</th>
                    <th className="py-3.5 px-5">Remaining Days</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading user directory...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSelf = currentUser?._id === u._id;
                      const remaining = calcRemainingDays(u.expiryDate);

                      return (
                        <tr key={u._id} className="hover:bg-stone-50/60 transition-colors">
                          {/* 1. Name */}
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-stone-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                  YOU
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  u.role === 'SUPER_ADMIN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : u.role === 'ADMIN'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-stone-100 text-stone-600'
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {u.email || u.phone || u._id}
                            </div>
                          </td>

                          {/* 2. Rank */}
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800">
                              {u.rank || '—'}
                            </span>
                          </td>

                          {/* 3. Posting */}
                          <td className="py-3.5 px-5">
                            <span className="text-stone-600">
                              {u.posting || u.currentPosting || '—'}
                            </span>
                          </td>

                          {/* 4. Status */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                u.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : u.status === 'SUSPENDED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          {/* 5. Expiry Date */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className="font-mono text-stone-700 text-xs">
                              {u.expiryDate
                                ? new Date(u.expiryDate).toLocaleDateString()
                                : 'No Expiry'}
                            </span>
                          </td>

                          {/* 6. Remaining Days */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${remaining.badgeClass}`}>
                              {remaining.text}
                            </span>
                          </td>

                          {/* 7. Actions */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5">
                              {/* Approve (For PENDING) */}
                              {u.status === 'PENDING' && isSuperAdmin && (
                                <button
                                  onClick={() => handleApprove(u)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                                  title="Approve User"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Reject (For PENDING) */}
                              {u.status === 'PENDING' && isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('REJECT');
                                    setReasonInput('Documentation verification unconfirmed.');
                                  }}
                                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                                  title="Reject Application"
                                >
                                  Reject
                                </button>
                              )}

                              {/* Expiry & Duration Management Button */}
                              <button
                                onClick={() => openExpiryModal(u)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                                title="Manage Account Validity & Expiry"
                              >
                                <Calendar className="w-3 h-3 text-sky-600" />
                                <span>Expiry</span>
                              </button>

                              {/* Device & Session Management Button */}
                              <button
                                onClick={() => openSessionsModal(u)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                                title="Manage Device Limits & Active Sessions"
                              >
                                <Smartphone className="w-3 h-3 text-indigo-600" />
                                <span>Devices</span>
                              </button>

                              {/* Suspend Button (For APPROVED, non-self) */}
                              {u.status === 'APPROVED' && !isSelf && isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('SUSPEND');
                                    setReasonInput('Administrative security review.');
                                  }}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                                  title="Suspend User"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Restore Button (For SUSPENDED / REJECTED) */}
                              {(u.status === 'SUSPENDED' || u.status === 'REJECTED') && isSuperAdmin && (
                                <button
                                  onClick={() => handleRestore(u)}
                                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                                  title="Restore Account"
                                >
                                  Restore
                                </button>
                              )}

                              {/* Role Button (SUPER_ADMIN only, non-self) */}
                              {isSuperAdmin && !isSelf && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('ROLE');
                                    setNewRoleInput(u.role);
                                  }}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                                  title="Change Role"
                                >
                                  Role
                                </button>
                              )}

                              {/* Delete Button (SUPER_ADMIN only, non-self) */}
                              {isSuperAdmin && !isSelf && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('DELETE');
                                  }}
                                  className="p-1 text-red-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* MODAL 1: Account Expiry & Duration Management */}
      {selectedUser && actionType === 'EXPIRY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Manage Account Expiry</h3>
                  <p className="text-xs text-stone-500">Officer: {selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Officer Snapshot */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 grid grid-cols-2 gap-2 text-stone-600">
                <div>Rank: <strong className="text-slate-800">{selectedUser.rank || 'N/A'}</strong></div>
                <div>Posting: <strong className="text-slate-800">{selectedUser.posting || selectedUser.currentPosting || 'N/A'}</strong></div>
                <div>Email/Phone: <span className="font-mono">{selectedUser.email || selectedUser.phone}</span></div>
                <div>Status: <strong className="text-sky-700">{selectedUser.status}</strong></div>
              </div>

              {/* Account Activation Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Activation Date
                </label>
                <input
                  type="date"
                  value={expiryForm.activationDate}
                  onChange={(e) => setExpiryForm({ ...expiryForm, activationDate: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Access Duration Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleDurationPreset(preset.days)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        expiryForm.durationDays === preset.days
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-slate-700 border-stone-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Expiry Date (Manual Date Picker) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Expiry Date (Calculated / Manual Selection)
                </label>
                <input
                  type="date"
                  value={expiryForm.expiryDate}
                  onChange={(e) => setExpiryForm({ ...expiryForm, expiryDate: e.target.value, durationDays: null })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Account Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Access Status
                </label>
                <select
                  value={expiryForm.status}
                  onChange={(e) => setExpiryForm({ ...expiryForm, status: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                >
                  <option value="APPROVED">APPROVED (Active Authorization)</option>
                  <option value="PENDING">PENDING (Awaiting Review)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily Blocked)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="px-4 py-2 border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExpiry}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-white font-bold text-xs bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors"
              >
                {actionLoading ? 'Saving...' : 'Save Expiry Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Device Limit & Active Sessions Management */}
      {selectedUser && actionType === 'SESSIONS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Device & Session Management</h3>
                  <p className="text-xs text-stone-500">Officer: {selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs">
              {/* Allowed Device Limit Configuration */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Admin-Configured Device Limit</h4>
                  <p className="text-[11px] text-stone-500">
                    Controls maximum simultaneous active login sessions for this account.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={deviceLimitInput}
                    onChange={(e) => setDeviceLimitInput(Number(e.target.value))}
                    className="p-2 bg-white border border-indigo-200 rounded-xl font-bold text-xs"
                  >
                    <option value={1}>1 Device</option>
                    <option value={2}>2 Devices</option>
                    <option value={3}>3 Devices</option>
                    <option value={5}>5 Devices</option>
                    <option value={10}>10 Devices</option>
                  </select>
                  <button
                    onClick={handleSaveDeviceLimit}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Sessions Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Tracked Server Sessions ({userSessions.length})
                  </h4>
                  {userSessions.some((s) => s.status === 'ACTIVE') && (
                    <button
                      onClick={handleRevokeAllSessions}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                    >
                      Revoke All Sessions
                    </button>
                  )}
                </div>

                {sessionsLoading ? (
                  <div className="py-8 text-center text-stone-400">Loading sessions...</div>
                ) : userSessions.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-2xl text-center text-stone-500 border border-stone-100">
                    No active login sessions recorded for this user.
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-2.5 px-3">Device Name</th>
                          <th className="py-2.5 px-3">Browser</th>
                          <th className="py-2.5 px-3">Operating System</th>
                          <th className="py-2.5 px-3">First Login</th>
                          <th className="py-2.5 px-3">Session Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {userSessions.map((sess, idx) => {
                          const isActive = sess.status === 'ACTIVE';
                          return (
                            <tr key={sess.sessionId || idx} className="hover:bg-stone-50/50">
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {sess.deviceName || 'Unknown Device'}
                              </td>
                              <td className="py-2.5 px-3 text-stone-600">{sess.browser || '—'}</td>
                              <td className="py-2.5 px-3 text-stone-600">{sess.operatingSystem || '—'}</td>
                              <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">
                                {sess.firstLogin
                                  ? new Date(sess.firstLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                  : '—'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    isActive
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {sess.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isActive && (
                                  <button
                                    onClick={() => handleRevokeSession(sess.sessionId)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 transition-colors"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: General Action Confirmation (Reject, Suspend, Role, Delete) */}
      {selectedUser && (actionType === 'REJECT' || actionType === 'SUSPEND' || actionType === 'ROLE' || actionType === 'DELETE') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-slate-900">
                {actionType === 'REJECT' && 'Reject Applicant Registration'}
                {actionType === 'SUSPEND' && 'Suspend Officer Account'}
                {actionType === 'ROLE' && 'Modify System Access Role'}
                {actionType === 'DELETE' && 'Confirm Account Deletion'}
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div><span className="text-stone-400">Target Officer:</span> <strong className="text-slate-800">{selectedUser.name}</strong></div>
                <div><span className="text-stone-400">Rank & Posting:</span> <span>{selectedUser.rank || 'N/A'}, {selectedUser.posting || selectedUser.currentPosting || 'N/A'}</span></div>
                <div><span className="text-stone-400">Account:</span> <span className="font-mono">{selectedUser.email || selectedUser.phone}</span></div>
              </div>

              {/* Input for Reject or Suspend Reason */}
              {(actionType === 'REJECT' || actionType === 'SUSPEND') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stated Administrative Reason
                  </label>
                  <textarea
                    rows={2}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              {/* Selector for Role change */}
              {actionType === 'ROLE' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assign New Authorization Role
                  </label>
                  <select
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="USER">USER (Case Officer - standard links)</option>
                    <option value="ADMIN">ADMIN (Departmental reviews & permitted analytics)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Root governance & user vetting)</option>
                  </select>
                </div>
              )}

              {/* Delete Warning */}
              {actionType === 'DELETE' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl leading-relaxed">
                  <strong>Warning:</strong> Deleting this account will permanently erase their profile and associated links. This action is recorded in the immutable audit log.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="px-4 py-2 border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-100 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActionConfirm}
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-md transition-colors ${
                  actionType === 'DELETE' || actionType === 'REJECT'
                    ? 'bg-red-600 hover:bg-red-500'
                    : actionType === 'SUSPEND'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
