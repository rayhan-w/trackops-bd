import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Server,
  FileCheck2,
  Send,
  CheckCircle,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TelecomGateway() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [telecomStatus, setTelecomStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inquiry Form
  const [caseReference, setCaseReference] = useState('');
  const [warrantNumber, setWarrantNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  // Master config (Super Admin)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getTelecomStatus();
      if (res.success && res.config) {
        setTelecomStatus(res.config);
        setIsEnabled(res.config.isEnabled);
        setProviderName(res.config.providerName);
      }
    } catch (err) {
      console.error('Error fetching telecom status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setDispatchResult(null);
    try {
      const res = await api.requestTelecomDispatch({
        caseReference,
        warrantNumber,
        notes,
      });
      setDispatchResult(res);
      fetchStatus();
    } catch (err) {
      alert(err.message || 'Error processing request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await api.updateTelecomConfig({
        isEnabled,
        providerName,
        apiEndpoint,
        apiKey: apiKey || undefined,
      });
      alert('Telecom integration configuration updated.');
      setIsConfigOpen(false);
      fetchStatus();
    } catch (err) {
      alert(err.message || 'Error updating configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Authorized Telecom Gateway"
          subtitle="Statutory lawful intercept interface and regulatory operator dispatch gateway."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* MANDATORY TECHNICAL LIMITATION WARNING BANNER */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 text-xs text-amber-900 leading-relaxed">
                <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                  Critical Technical Limitation & Ethical Disclosure
                </h3>
                <p>
                  <strong>Cell tower information is not available through standard browser access.</strong> Normal web browsers cannot directly retrieve SIM cards, IMEI numbers, cellular tower IDs, or subscriber identities without legitimate authorized telecom operator APIs and formal statutory judicial warrants.
                </p>
                <p className="text-[11px] text-amber-800 font-medium">
                  TrackOps BD strictly prohibits simulating fake coordinates or fabricating fictitious Cell IDs. All cellular subscriber data requests require authenticated ministry and BTRC lawful dispatch clearance.
                </p>
              </div>
            </div>
          </div>

          {/* Integration Status Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                telecomStatus?.isEnabled
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-[#0B192C]">Gateway Integration Status:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      telecomStatus?.isEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {telecomStatus?.isEnabled ? 'CONNECTED & AUTHORIZED' : 'OFFLINE (DISABLED BY DEFAULT)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provider: <strong className="text-slate-700">{telecomStatus?.providerName}</strong>
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition-colors"
              >
                {isConfigOpen ? 'Close Settings' : 'Configure Gateway'}
              </button>
            )}
          </div>

          {/* Super Admin Configuration Drawer */}
          {isConfigOpen && isSuperAdmin && (
            <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-xl space-y-4 animate-fadeIn">
              <h4 className="font-bold text-sm text-[#0B192C] flex items-center space-x-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Super Admin Gateway Credentials Configuration</span>
              </h4>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="enableGateway"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="enableGateway" className="font-semibold text-slate-800 cursor-pointer">
                    Enable Authorized Telecom Gateway Interface (Requires Certified Government Contract)
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Provider Gateway Name</label>
                    <input
                      type="text"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Statutory API Endpoint</label>
                    <input
                      type="url"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://telecom-gateway.btrc.gov.bd/v1"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mutual Gateway API Key / Bearer</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter new API key..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md"
                  >
                    {savingConfig ? 'Saving...' : 'Update Gateway Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Statutory Inquiry Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B192C]">Statutory Telecom Inquiry Dispatch</h3>
              <p className="text-xs text-slate-500">
                Authorized officers may submit formal inquiry dispatch requests accompanied by valid court orders.
              </p>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Formal Case Reference / GD Docket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={caseReference}
                    onChange={(e) => setCaseReference(e.target.value)}
                    placeholder="CID-DHAKA-2026-XXXX"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judicial Warrant / Magistrate Clearance ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={warrantNumber}
                    onChange={(e) => setWarrantNumber(e.target.value)}
                    placeholder="WRT-CMM-2026-88192"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inquiry Justification & Legal Basis
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail statutory justification pursuant to section 97 of the CrPC..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Transmitting...' : 'Transmit Inquiry Dispatch'}</span>
                </button>
              </div>
            </form>

            {/* Dispatch Response Notice */}
            {dispatchResult && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white space-y-2 font-mono text-xs animate-fadeIn border border-slate-800">
                <div className="flex items-center space-x-2 text-amber-400 font-bold font-sans">
                  <Info className="w-4 h-4" />
                  <span>Statutory Gateway Dispatch Status: [{dispatchResult.status}]</span>
                </div>
                <div className="text-slate-300">{dispatchResult.message}</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  {dispatchResult.technicalNotice}
                </div>
              </div>
            )}
          </div>

          {/* Access Audit Log Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Telecom Statutory Access Audit Logs</h3>
                <p className="text-xs text-slate-500">Every transmission attempt is permanently cataloged for oversight</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Case Reference</th>
                    <th className="py-3 px-5">Warrant ID</th>
                    <th className="py-3 px-5">Officer</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!telecomStatus?.accessAuditLogs || telecomStatus.accessAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        No telecom dispatch logs recorded.
                      </td>
                    </tr>
                  ) : (
                    telecomStatus.accessAuditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                          {new Date(log.requestedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-5 font-bold text-blue-700">{log.caseReference}</td>
                        <td className="py-3 px-5 text-slate-700">{log.warrantNumber}</td>
                        <td className="py-3 px-5 font-sans text-slate-800">{log.officerName || 'Officer'}</td>
                        <td className="py-3 px-5 font-sans">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-600 truncate max-w-xs">{log.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
