import React from 'react';
import { Camera, X, CheckCircle2, XCircle, Clock, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, visit }) {
  if (!isOpen || !visit) return null;

  const camStatus = visit.cameraConsentStatus || 'Not Requested';
  const camAvailable = visit.cameraStatus || (visit.cameraSnapshot ? 'Available' : 'Unavailable');
  const hasPhoto = Boolean(visit.cameraSnapshot);

  const formattedDate = (() => {
    try {
      return new Date(visit.timestamp || visit.visitTimestamp || Date.now()).toLocaleString();
    } catch (_) {
      return 'N/A';
    }
  })();

  const handleDownload = () => {
    if (!visit.cameraSnapshot) return;
    const a = document.createElement('a');
    a.href = visit.cameraSnapshot;
    a.download = `verification-photo-${visit.visitorReferenceId || 'visitor'}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[#0B192C] tracking-tight">Camera Access Status</h3>
              <p className="text-xs text-slate-500 font-medium">
                Voluntary device verification & media telemetry status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Permission Status
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 ${
                camStatus === 'Granted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : camStatus === 'Denied'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {camStatus}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Camera Availability
              </span>
              <span className="font-bold text-slate-800 text-xs mt-1 block">
                {camAvailable}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Permission Timestamp
              </span>
              <span className="font-medium text-slate-600 text-[11px] mt-1 block truncate">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Photograph Display Section */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Voluntary Verification Media
            </span>

            {hasPhoto ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-video flex items-center justify-center shadow-inner">
                  <img
                    src={visit.cameraSnapshot}
                    alt="Voluntary Verification"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>User explicitly confirmed preview before submission</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <h5 className="font-semibold text-slate-700 text-sm">No photo was submitted.</h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The visitor did not attach a voluntary camera snapshot during link interaction.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
