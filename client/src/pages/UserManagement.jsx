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
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [actionType, setActionType] = useState(null); // 'REJECT' | 'SUSPEND' | 'ROLE' | 'DELETE'
  const [reasonInput, setReasonInput] = useState('');
  const [newRoleInput, setNewRoleInput] = useState('USER');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
        showToast(`Account ${selectedUser.name} permanently deleted.`);
      }
      setSelectedUser(null);
      setActionType(null);
      setReasonInput('');
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error performing action');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="User Management & Approvals"
          subtitle="Super Administrator Control Desk: Vetting, access controls, role assignments, and account status."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage('')} className="text-white hover:text-emerald-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Users */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Total Users</span>
              <div className="text-2xl font-extrabold text-[#0B192C] font-mono mt-1">{stats.totalUsers}</div>
              <span className="text-[10px] text-slate-500">Registered platform accounts</span>
            </div>

            {/* Pending Users */}
            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm bg-amber-50/20">
              <span className="text-[10px] font-semibold uppercase text-amber-600">Pending Vetting</span>
              <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">{stats.pendingUsers}</div>
              <span className="text-[10px] text-amber-700">Requires administrative sign-off</span>
            </div>

            {/* Approved Users */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm bg-emerald-50/20">
              <span className="text-[10px] font-semibold uppercase text-emerald-600">Approved Officers</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{stats.approvedUsers}</div>
              <span className="text-[10px] text-emerald-700">Eligible to create links</span>
            </div>

            {/* Suspended Users */}
            <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm bg-red-50/20">
              <span className="text-[10px] font-semibold uppercase text-red-600">Suspended Users</span>
              <div className="text-2xl font-extrabold text-red-600 font-mono mt-1">{stats.suspendedUsers}</div>
              <span className="text-[10px] text-red-700">Administrative hold</span>
            </div>

            {/* Total System Links */}
            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm bg-blue-50/20">
              <span className="text-[10px] font-semibold uppercase text-blue-600">Total System Links</span>
              <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">{stats.totalLinks}</div>
              <span className="text-[10px] text-blue-700">Across all officer records</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
              {/* Status Filter */}
              <div className="flex items-center space-x-1">
                {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchUsers}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 ml-auto"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Management Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Platform Personnel Roster</h3>
                <p className="text-xs text-slate-500">
                  Manage approvals, enforce administrative sanctions, and audit user permissions
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                {users.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Officer / Personnel</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-5">System Role</th>
                    <th className="py-3.5 px-5">Account Status</th>
                    <th className="py-3.5 px-5">Registered Date</th>
                    <th className="py-3.5 px-5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Loading user directory...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSelf = currentUser?._id === u._id;

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Name & ID */}
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{u._id}</div>
                          </td>

                          {/* Email & Phone */}
                          <td className="py-3.5 px-5">
                            <div className="text-slate-800 font-medium truncate max-w-xs">{u.email || '—'}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{u.phone || '—'}</div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                u.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : u.role === 'ADMIN'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                u.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : u.status === 'SUSPENDED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          {/* Registered */}
                          <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5">
                              {/* Approve Button (For PENDING) */}
                              {u.status === 'PENDING' && isSuperAdmin && (
                                <button
                                  onClick={() => handleApprove(u)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                                  title="Approve User"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Reject Button (For PENDING) */}
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

                              {/* Suspend Button (For APPROVED, non-self) */}
                              {u.status === 'APPROVED' && !isSelf && isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('SUSPEND');
                                    setReasonInput('Administrative security hold.');
                                  }}
                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold transition-colors"
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

                              {/* Change Role Button (SUPER_ADMIN only, non-self) */}
                              {isSuperAdmin && !isSelf && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActionType('ROLE');
                                    setNewRoleInput(u.role);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
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
      </div>

      {/* Action Confirmation Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0B192C]">
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
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><span className="text-slate-400">Target Officer:</span> <strong className="text-slate-800">{selectedUser.name}</strong></div>
                <div><span className="text-slate-400">Account:</span> <span className="font-mono">{selectedUser.email || selectedUser.phone}</span></div>
                <div><span className="text-slate-400">Current Role:</span> <span className="font-mono">{selectedUser.role}</span></div>
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
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
                  <strong>Warning:</strong> Deleting this account will permanently erase their profile and all associated links, visit ledgers, and voluntary coordinates from the database. This action is recorded in the immutable audit log.
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
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-xs"
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
                    : 'bg-blue-600 hover:bg-blue-500'
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
