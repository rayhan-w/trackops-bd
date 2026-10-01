import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Compass,
  Camera,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Download,
  Printer,
  FileText,
  User,
  Globe,
  Radio,
  Share2,
  Lock,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import GeoMap from '../components/GeoMap';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function VisitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getVisitorActivityById(id);
        if (res.success && res.activity) {
          setActivity(res.activity);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve visitor activity record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleCopyCoordinates = () => {
    if (!activity || !activity.latitude || !activity.longitude) return;
    const text = `${activity.latitude}, ${activity.longitude} (Accuracy: ±${Math.round(activity.accuracy || 0)}m)`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleExportJSON = () => {
    if (!activity) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activity, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visitor-record-${activity.visitorReferenceId || activity._id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold mt-3">Loading Visitor Telemetry Record...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 text-center flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-lg text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Record Access Restricted</h3>
          <p className="text-xs text-slate-500">{error || 'Record could not be found or you do not have permission to view it.'}</p>
          <div className="pt-2">
            <Link
              to="/visitor-activity"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Visitor Activity</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasLocation = Boolean(
    (activity.locationConsentStatus === 'Granted' || activity.voluntarilySharedLocation) &&
    activity.latitude &&
    activity.longitude
  );

  const latFormatted = hasLocation ? Number(activity.latitude).toFixed(6) : null;
  const lngFormatted = hasLocation ? Number(activity.longitude).toFixed(6) : null;
  const accuracyFormatted = hasLocation ? `${Math.round(activity.accuracy || 15)} meters` : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Visitor Record Details"
          subtitle={`Reference: ${activity.visitorReferenceId || activity._id} | Case: ${activity.linkId?.caseReference || 'CASE-GENERAL'}`}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Navigation & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Link
              to="/visitor-activity"
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Visitor Activity Ledger</span>
            </Link>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {hasLocation && (
                <button
                  onClick={handleCopyCoordinates}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedCoords ? 'Coordinates Copied' : 'Copy Coordinates'}</span>
                </button>
              )}

              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Record</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>

          {/* VISITOR REFERENCE HEADER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                  OFFICIAL INQUIRY VISITOR LOG
                </span>
                <h2 className="text-2xl font-extrabold text-[#0B192C] tracking-tight mt-1">
                  Visitor Reference: {activity.visitorReferenceId || activity._id}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>Case Docket: <strong className="text-blue-700 font-mono">{activity.linkId?.caseReference || 'UNASSIGNED'}</strong></span>
                  <span>•</span>
                  <span>Link Name: <strong className="text-slate-800">{activity.linkId?.title}</strong></span>
                  <span>•</span>
                  <span>Logged: {new Date(activity.timestamp || activity.visitTimestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                    activity.consentStatus === 'GRANTED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activity.consentStatus === 'DENIED'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Consent: {activity.consentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT (DESKTOP) / SINGLE-COLUMN (MOBILE) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: LOCATION DETAILS & MAP */}
            <div className="space-y-6">
              {/* SECTION A: LOCATION INFORMATION (LARGE READABLE CARDS) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0B192C]">LOCATION DETAILS</h3>
                    <p className="text-xs text-slate-400">Voluntarily shared geographical coordinates</p>
                  </div>
                </div>

                {hasLocation ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Latitude */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Latitude:
                      </span>
                      <div className="text-2xl font-extrabold text-[#0B192C] font-mono mt-0.5">
                        {latFormatted}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">WGS84 Coordinates</span>
                    </div>

                    {/* Longitude */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Longitude:
                      </span>
                      <div className="text-2xl font-extrabold text-[#0B192C] font-mono mt-0.5">
                        {lngFormatted}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">WGS84 Coordinates</span>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Accuracy:
                      </span>
                      <div className="text-xl font-bold text-blue-700 font-mono mt-0.5">
                        {accuracyFormatted}
                      </div>
                      <span className="text-[10px] text-slate-500">Horizontal GPS radius</span>
                    </div>

                    {/* Status */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Status:
                      </span>
                      <div className="text-base font-bold text-emerald-700 mt-1 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Permission Granted</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Explicit consent recorded</span>
                    </div>

                    {/* Timestamp */}
                    <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Consent Timestamp:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {new Date(activity.consentTimestamp || activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    <Compass className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-semibold text-slate-700 text-sm">Location information was not shared.</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Status: <strong className="text-slate-700">{activity.locationConsentStatus || 'Not Requested / Declined'}</strong>.
                      The visitor chose not to disclose geographical coordinates.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION B: MAP (LEAFLET WITH OPENSTREETMAP) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#0B192C] flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Cartographic Plotting</span>
                  </h3>
                  {hasLocation && (
                    <span className="text-xs text-slate-500 font-mono">
                      {latFormatted}, {lngFormatted}
                    </span>
                  )}
                </div>

                {hasLocation ? (
                  <GeoMap
                    points={[
                      {
                        id: activity._id,
                        latitude: activity.latitude,
                        longitude: activity.longitude,
                        accuracy: activity.accuracy,
                        timestamp: activity.timestamp,
                      },
                    ]}
                  />
                ) : (
                  <div className="h-64 bg-slate-100 rounded-3xl border border-dashed border-slate-300 flex items-center justify-center p-6 text-center">
                    <div className="space-y-1 text-slate-500">
                      <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-semibold">Location information was not shared.</p>
                      <p className="text-xs text-slate-400">No fabricated or synthetic map pins are displayed.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: CAMERA INFORMATION & CONSENT HISTORY */}
            <div className="space-y-6">
              {/* SECTION 6: CAMERA INFORMATION DISPLAY CARD */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0B192C]">CAMERA INFORMATION</h3>
                    <p className="text-xs text-slate-400">Optical sensor verification & confirmation state</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Camera Permission:
                    </span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {activity.cameraConsentStatus || (activity.voluntarilySharedCamera ? 'Granted' : 'Not Requested')}
                    </div>
                    <span className="text-[10px] text-slate-500">Browser sensor authorization</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Camera Status:
                    </span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {activity.cameraStatus || (activity.voluntarilySharedCamera ? 'Available' : 'Unavailable')}
                    </div>
                    <span className="text-[10px] text-slate-500">Physical optical interface</span>
                  </div>

                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Consent Timestamp:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {new Date(activity.consentTimestamp || activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Photo Snapshot Display if voluntarily confirmed */}
                {activity.cameraSnapshot ? (
                  <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-violet-900">Voluntarily Confirmed Verification Photo</span>
                      <span className="text-[10px] text-violet-700 font-semibold bg-violet-100 px-2 py-0.5 rounded">
                        CONFIRMED BY VISITOR
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-violet-200 max-w-sm mx-auto">
                      <img src={activity.cameraSnapshot} alt="Visitor snapshot" className="w-full h-auto object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
                    Note: Camera permission granted does not mean an unauthorized photo was captured. No photograph was submitted by the visitor.
                  </div>
                )}
              </div>

              {/* LINK & TECHNICAL CONTEXT */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0B192C]">Link & Investigation Context</h3>
                    <p className="text-xs text-slate-400">Target case details and destination mapping</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Destination URL:</span>
                    <span className="font-mono text-blue-700 font-semibold truncate max-w-xs">
                      {activity.linkId?.destinationUrl}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Short Link Code:</span>
                    <span className="font-mono font-bold text-slate-800">
                      /l/{activity.linkId?.shortCode}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Authorized Account:</span>
                    <span className="font-semibold text-slate-800">
                      {activity.ownerId?.name} ({activity.ownerId?.email || activity.ownerId?.phone})
                    </span>
                  </div>

                  {/* Device Information & Browser Telemetry (Requirement 8) */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-sans font-bold text-slate-800 pb-1.5 border-b border-slate-200 flex items-center justify-between">
                      <span>DEVICE INFORMATION</span>
                      <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-semibold">
                        Standards-Based
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Device Type:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.deviceType || (activity.browserInfo?.device === 'mobile' ? 'Mobile' : 'Desktop')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Manufacturer:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.manufacturer && activity.browserInfo?.manufacturer !== 'Unknown' ? activity.browserInfo.manufacturer : 'N/A'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Model:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.model || 'Model unavailable'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Operating System:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.os || 'N/A'}
                          {activity.browserInfo?.osVersion && activity.browserInfo?.osVersion !== 'N/A' ? ` ${activity.browserInfo.osVersion}` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Browser:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.browser || 'N/A'}
                          {activity.browserInfo?.browserVersion && activity.browserInfo?.browserVersion !== 'N/A' ? ` ${activity.browserInfo.browserVersion}` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Screen Category:</span>
                        <strong className="text-slate-800">
                          {activity.browserInfo?.screenCategory || (activity.browserInfo?.screenResolution ? (parseInt(activity.browserInfo.screenResolution) < 768 ? 'Mobile Screen' : 'Desktop Screen') : 'Standard')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
