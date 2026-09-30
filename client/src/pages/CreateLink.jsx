import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Link as LinkIcon,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  Shuffle,
  Shield,
  Calendar,
  Layers,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { api } from '../services/api';

export default function CreateLink() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    destinationUrl: '',
    domain: 'trackops.link',
    customShortCode: '',
    title: '',
    description: '',
    caseReference: 'CID-DHAKA-2026-',
    expirationDate: '',
    status: 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateRandomCode = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, customShortCode: code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.destinationUrl) {
      return setError('Destination URL is required');
    }

    if (!formData.destinationUrl.startsWith('http://') && !formData.destinationUrl.startsWith('https://')) {
      return setError('Destination URL must start with http:// or https://');
    }

    setLoading(true);
    try {
      const res = await api.createLink(formData);
      if (res.success && res.link) {
        setCreatedLink(res.link);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate link. Short code may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdLink) return;
    const url = `${window.location.origin}/l/${createdLink.shortCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Create New Link"
          subtitle="Generate transparent investigation and case inquiry links."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-blue-600 flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Links</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">New Link Generator</span>
          </div>

          {/* Success Screen if Created */}
          {createdLink ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B192C]">Link Created Successfully!</h3>
                  <p className="text-xs text-slate-500">
                    The short link has been registered and is now live for case inquiry.
                  </p>
                </div>
              </div>

              {/* Short Link Display Banner */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                  Generated Short URL
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-mono text-sm sm:text-base font-bold text-blue-300 truncate">
                    {window.location.origin}/l/{createdLink.shortCode}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={`/v/${createdLink.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Summary Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Title</span>
                  <span className="font-semibold text-slate-800">{createdLink.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Case Reference</span>
                  <span className="font-mono font-semibold text-blue-700">{createdLink.caseReference}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Destination URL</span>
                  <span className="font-mono text-slate-700 break-all">{createdLink.destinationUrl}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to={`/links/${createdLink._id}/activity`}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center text-xs sm:text-sm font-semibold shadow-md transition-colors"
                >
                  View Activity & Live Geolocation
                </Link>
                <button
                  onClick={() => {
                    setCreatedLink(null);
                    setFormData({
                      destinationUrl: '',
                      domain: 'trackops.link',
                      customShortCode: '',
                      title: '',
                      description: '',
                      caseReference: 'CID-DHAKA-2026-',
                      expirationDate: '',
                      status: 'ACTIVE',
                    });
                  }}
                  className="py-3 px-6 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  Create Another Link
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Destination URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={formData.destinationUrl}
                      onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                      placeholder="https://bangladesh.gov.bd/official-portal"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Where the visitor will land upon completing the transparent inquiry notice.
                  </span>
                </div>

                {/* Domain & Custom Short Code Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Domain */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Domain Alias
                    </label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="trackops.link">trackops.link (Primary Default)</option>
                      <option value="gov-verify.link">gov-verify.link (Official Inquiry)</option>
                      <option value="secure-notice.link">secure-notice.link (Notice Dispatch)</option>
                    </select>
                  </div>

                  {/* Custom Short Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Custom Short Code (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="text-[11px] text-orange-600 hover:text-orange-700 flex items-center space-x-1 font-bold"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>Generate Random</span>
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">
                        /l/
                      </span>
                      <input
                        type="text"
                        value={formData.customShortCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customShortCode: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''),
                          })
                        }
                        placeholder="e.g. case-941"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Link Title & Case Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Cyber Fraud Verification Notice"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Case Reference / GD Number
                    </label>
                    <input
                      type="text"
                      value={formData.caseReference}
                      onChange={(e) => setFormData({ ...formData, caseReference: e.target.value })}
                      placeholder="CID-DHAKA-2026-0941"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Case Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of inquiry purpose and designated target subject..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Expiration & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">ACTIVE (Accepting Visits)</option>
                      <option value="INACTIVE">INACTIVE (Disabled)</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white font-semibold text-xs sm:text-sm rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Generate Investigation Short Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
