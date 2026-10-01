/**
 * Standards-based client-side device & model detection for TrackOps BD
 * Utilizes User-Agent Client Hints (Chromium standard) with rich UA fallback
 */

export async function detectCurrentDevice() {
  const ua = navigator.userAgent || '';
  let model = '';
  let manufacturer = 'N/A';
  let platform = navigator.platform || '';
  let platformVersion = '';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let isMobile = false;

  // 1. Detect OS
  if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 2. Detect Browser
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/SamsungBrowser\//i.test(ua)) browser = 'Samsung Internet';
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  // 3. User-Agent Client Hints (High Entropy for Android & Chromium)
  if (navigator.userAgentData) {
    if (navigator.userAgentData.platform) platform = navigator.userAgentData.platform;
    if (typeof navigator.userAgentData.mobile === 'boolean') {
      isMobile = navigator.userAgentData.mobile;
    }

    try {
      if (typeof navigator.userAgentData.getHighEntropyValues === 'function') {
        const hints = await navigator.userAgentData.getHighEntropyValues([
          'model',
          'platform',
          'platformVersion',
          'architecture',
        ]);
        if (hints.model) model = hints.model;
        if (hints.platform) platform = hints.platform;
        if (hints.platformVersion) platformVersion = hints.platformVersion;
      }
    } catch (_) {}
  }

  // 4. Fallback Model Detection from UA if Client Hints didn't provide
  if (!model || model.toLowerCase() === 'k') {
    if (/iPhone/i.test(ua)) {
      model = 'Apple iPhone';
      manufacturer = 'Apple';
      isMobile = true;
    } else if (/iPad/i.test(ua)) {
      model = 'Apple iPad';
      manufacturer = 'Apple';
      isMobile = true;
    } else if (/Macintosh/i.test(ua)) {
      model = 'Apple Mac';
      manufacturer = 'Apple';
    } else {
      const match =
        ua.match(/;\s*([A-Za-z0-9\s_-]+)\s*Build\//i) ||
        ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) ||
        ua.match(/\((?:Linux;\s*Android[^;]+;\s*)([^;)]+)\)/i);
      if (match && match[1] && !/K$/i.test(match[1].trim())) {
        model = match[1].trim();
      }
    }
  }

  // 5. Friendly formatting
  if (!isMobile) {
    isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  }

  let formattedModel = model;
  if (/SM-[A-Z0-9]+/i.test(model) || /Samsung/i.test(ua)) {
    manufacturer = 'Samsung';
    const code = (model.match(/(SM-[A-Z0-9]+)/i) || ua.match(/(SM-[A-Z0-9]+)/i))?.[1] || '';
    if (/SM-S92/i.test(code)) formattedModel = `Galaxy S24 series (${code})`;
    else if (/SM-S91/i.test(code)) formattedModel = `Galaxy S23 series (${code})`;
    else if (/SM-S90/i.test(code)) formattedModel = `Galaxy S22 series (${code})`;
    else if (/SM-A/i.test(code)) formattedModel = `Galaxy A-series (${code})`;
    else if (/SM-M/i.test(code)) formattedModel = `Galaxy M-series (${code})`;
    else formattedModel = code ? `Galaxy (${code})` : 'Samsung Galaxy';
  } else if (/Pixel/i.test(model) || /Pixel/i.test(ua)) {
    manufacturer = 'Google';
    formattedModel = model || 'Google Pixel';
  } else if (/Redmi|POCO|Xiaomi|2[0-9]{3}|M2[0-9]{3}/i.test(model) || /Redmi|Xiaomi/i.test(ua)) {
    manufacturer = 'Xiaomi';
    formattedModel = model || 'Xiaomi / Redmi';
  } else if (/vivo/i.test(model) || /vivo/i.test(ua)) {
    manufacturer = 'Vivo';
    formattedModel = model || 'Vivo smartphone';
  } else if (/OPPO|CPH/i.test(model) || /OPPO/i.test(ua)) {
    manufacturer = 'OPPO';
    formattedModel = model || 'OPPO smartphone';
  } else if (/Realme|RMX/i.test(model) || /Realme/i.test(ua)) {
    manufacturer = 'Realme';
    formattedModel = model || 'Realme smartphone';
  } else if (/Infinix|X[0-9]{3,4}/i.test(model) || /Infinix/i.test(ua)) {
    manufacturer = 'Infinix';
    formattedModel = model || 'Infinix smartphone';
  } else if (!isMobile) {
    if (os === 'Windows') formattedModel = 'Windows Desktop / Laptop';
    else if (os === 'macOS') formattedModel = 'Apple Mac';
    else formattedModel = `${os} Computer`;
  }

  if (!formattedModel || formattedModel.toLowerCase() === 'k') {
    formattedModel = isMobile ? 'Mobile Smartphone' : 'Desktop Workstation';
  }

  return {
    rawModel: model || '',
    model: formattedModel,
    manufacturer: manufacturer !== 'N/A' ? manufacturer : (os === 'iOS' || os === 'macOS' ? 'Apple' : 'N/A'),
    os,
    browser,
    isMobile,
    platform,
    platformVersion,
  };
}
