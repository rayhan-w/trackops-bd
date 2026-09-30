import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Clock,
  User,
  Search,
  RefreshCw,
  Layers,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { api } from '../services/api';

export default function AuditLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.performedByName?.toLowerCase().includes(s) ||
      log.targetType?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="System Audit Logs"
          subtitle="Immutable chronological ledger of administrative operations, authorizations, and security events."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by action, user, or target..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <button
              onClick={fetchLogs}
              className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center space-x-1.5 font-medium shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Administrative Event Stream</h3>
                <p className="text-xs text-slate-500">Recorded with actor ID, target entity, and timestamp</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                {filteredLogs.length} Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Performed By</th>
                    <th className="py-3 px-5">Action</th>
                    <th className="py-3 px-5">Target Entity</th>
                    <th className="py-3 px-5">Event Details</th>
                    <th className="py-3 px-5">IP Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-5 font-sans font-semibold text-slate-800">
                          {log.performedByName || 'SYSTEM'}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.action.includes('DELETE')
                                ? 'bg-red-100 text-red-800'
                                : log.action.includes('SUSPEND')
                                ? 'bg-amber-100 text-amber-800'
                                : log.action.includes('APPROVE')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-5 font-sans text-slate-600">
                          <span className="font-semibold text-slate-700">{log.targetType}</span>{' '}
                          {log.targetId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({log.targetId.slice(0, 8)}...)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-slate-600 max-w-xs truncate">
                          {typeof log.details === 'object'
                            ? JSON.stringify(log.details)
                            : log.details || '—'}
                        </td>
                        <td className="py-3 px-5 text-slate-400 text-[11px]">
                          {log.ipAddress || '127.0.0.1'}
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
