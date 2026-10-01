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
  // 4. Fallback Model Detection from UA if Client Hints didn't provide
  if (!model || model.toLowerCase() === 'k') {
    if (/iPhone/i.test(ua)) {
      manufacturer = 'Apple';
      isMobile = true;
      // Screen resolution heuristic for iPhone models
      const w = window.screen.width;
      const h = window.screen.height;
      const r = window.devicePixelRatio || 1;
      const maxDim = Math.max(w, h);
      const minDim = Math.min(w, h);

      if (maxDim === 932 && minDim === 430) {
        model = 'Apple iPhone 15/16 Pro Max / Plus';
      } else if (maxDim === 852 && minDim === 393) {
        model = 'Apple iPhone 14/15/16 Pro';
      } else if (maxDim === 926 && minDim === 428) {
        model = 'Apple iPhone 12/13/14 Pro Max';
      } else if (maxDim === 844 && minDim === 390) {
        model = 'Apple iPhone 12/13/14 / 13 Pro';
      } else if (maxDim === 896 && minDim === 414) {
        model = r === 2 ? 'Apple iPhone 11 / XR' : 'Apple iPhone 11 Pro Max / XS Max';
      } else if (maxDim === 812 && minDim === 375) {
        model = 'Apple iPhone X / XS / 11 Pro';
      } else if (maxDim === 667 && minDim === 375) {
        model = 'Apple iPhone SE / 8 / 7';
      } else {
        model = 'Apple iPhone';
      }
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
    else if (/SM-G99/i.test(code)) formattedModel = `Galaxy S21 series (${code})`;
    else if (/SM-G98/i.test(code)) formattedModel = `Galaxy S20 series (${code})`;
    else if (/SM-A/i.test(code)) formattedModel = `Galaxy A-series (${code})`;
    else if (/SM-M/i.test(code)) formattedModel = `Galaxy M-series (${code})`;
    else if (/SM-F/i.test(code)) formattedModel = `Galaxy Z Fold/Flip (${code})`;
    else formattedModel = code ? `Galaxy (${code})` : 'Samsung Galaxy';
  } else if (/Pixel/i.test(model) || /Pixel/i.test(ua)) {
    manufacturer = 'Google';
    formattedModel = model || 'Google Pixel';
  } else if (/Redmi|POCO|Xiaomi|2[0-9]{3}|M2[0-9]{3}/i.test(model) || /Redmi|Xiaomi/i.test(ua)) {
    manufacturer = 'Xiaomi';
    formattedModel = model || 'Xiaomi / Redmi';
  } else if (/vivo|V2[0-9]{3}/i.test(model) || /vivo/i.test(ua)) {
    manufacturer = 'Vivo';
    const m = model.match(/V2[0-9]{3}/i);
    formattedModel = m ? `Vivo smartphone (${m[0]})` : (model || 'Vivo smartphone');
  } else if (/OPPO|CPH[0-9]+/i.test(model) || /OPPO/i.test(ua)) {
    manufacturer = 'OPPO';
    const m = model.match(/CPH[0-9]+/i);
    formattedModel = m ? `OPPO smartphone (${m[0]})` : (model || 'OPPO smartphone');
  } else if (/Realme|RMX[0-9]+/i.test(model) || /Realme/i.test(ua)) {
    manufacturer = 'Realme';
    const m = model.match(/RMX[0-9]+/i);
    formattedModel = m ? `Realme (${m[0]})` : (model || 'Realme smartphone');
  } else if (/Infinix|X[0-9]{3,4}/i.test(model) || /Infinix/i.test(ua)) {
    manufacturer = 'Infinix';
    const m = model.match(/X[0-9]{3,4}/i);
    formattedModel = m ? `Infinix (${m[0]})` : (model || 'Infinix smartphone');
  } else if (/Tecno/i.test(model) || /Tecno/i.test(ua)) {
    manufacturer = 'Tecno';
    formattedModel = model || 'Tecno smartphone';
  } else if (/Walton|Primo/i.test(model) || /Walton/i.test(ua)) {
    manufacturer = 'Walton';
    formattedModel = model || 'Walton Primo';
  } else if (/Symphony/i.test(model) || /Symphony/i.test(ua)) {
    manufacturer = 'Symphony';
    formattedModel = model || 'Symphony smartphone';
  } else if (/OnePlus/i.test(model) || /OnePlus/i.test(ua)) {
    manufacturer = 'OnePlus';
    formattedModel = model || 'OnePlus smartphone';
  } else if (/Moto|Motorola/i.test(model) || /Moto/i.test(ua)) {
    manufacturer = 'Motorola';
    formattedModel = model || 'Motorola smartphone';
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
