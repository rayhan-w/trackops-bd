/**
 * Standards-based User-Agent & Device Parser for TrackOps BD
 * Extracts device type, manufacturer, model, OS, and browser reliably
 * without invasive fingerprinting or invented models.
 */

function resolveDeviceDetails(rawModel = '', ua = '', detectedOs = 'Unknown OS') {
  let mfg = 'N/A';
  let modelName = rawModel ? rawModel.replace(/["']/g, '').trim() : '';

  // Extract from UA if not in rawModel
  if (!modelName || modelName.toLowerCase() === 'k' || modelName.toLowerCase() === 'model unavailable') {
    const uaModelMatch =
      ua.match(/;\s*([A-Za-z0-9\s_-]+)\s*Build\//i) ||
      ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) ||
      ua.match(/\((?:Linux;\s*Android[^;]+;\s*)([^;)]+)\)/i);
    if (uaModelMatch && uaModelMatch[1] && !/K$/i.test(uaModelMatch[1].trim())) {
      modelName = uaModelMatch[1].trim();
    }
  }

  // Samsung Detection
  if (/SM-[A-Z0-9]+|GT-[A-Z0-9]+|Samsung/i.test(modelName) || /SM-[A-Z0-9]+|GT-[A-Z0-9]+|Samsung/i.test(ua)) {
    mfg = 'Samsung';
    const code = (modelName.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i) || ua.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i))?.[1] || '';
    if (code) {
      if (/SM-S92/i.test(code)) modelName = `Galaxy S24 series (${code})`;
      else if (/SM-S91/i.test(code)) modelName = `Galaxy S23 series (${code})`;
      else if (/SM-S90/i.test(code)) modelName = `Galaxy S22 series (${code})`;
      else if (/SM-G99/i.test(code)) modelName = `Galaxy S21 series (${code})`;
      else if (/SM-G98/i.test(code)) modelName = `Galaxy S20 series (${code})`;
      else if (/SM-A/i.test(code)) modelName = `Galaxy A-series (${code})`;
      else if (/SM-M/i.test(code)) modelName = `Galaxy M-series (${code})`;
      else if (/SM-F/i.test(code)) modelName = `Galaxy Z Fold/Flip (${code})`;
      else if (/SM-E/i.test(code)) modelName = `Galaxy F-series (${code})`;
      else modelName = `Galaxy (${code})`;
    } else {
      modelName = modelName.includes('Galaxy') ? modelName : `Samsung Galaxy series`;
    }
  }
  // Apple
  else if (/iPhone/i.test(modelName) || /iPhone/i.test(ua)) {
    mfg = 'Apple';
    modelName = 'Apple iPhone';
  } else if (/iPad/i.test(modelName) || /iPad/i.test(ua)) {
    mfg = 'Apple';
    modelName = 'Apple iPad';
  } else if (/Macintosh/i.test(ua) || detectedOs === 'macOS') {
    mfg = 'Apple';
    modelName = 'Apple Mac';
  }
  // Xiaomi / Redmi / POCO
  else if (/Redmi|POCO|Mi\s|Xiaomi|2[0-9]{3}[A-Z0-9]+|M2[0-9]{3}[A-Z0-9]+/i.test(modelName) || /Redmi|POCO|Xiaomi/i.test(ua)) {
    mfg = 'Xiaomi';
    if (/POCO/i.test(modelName) || /POCO/i.test(ua)) {
      modelName = modelName || 'POCO smartphone';
    } else if (/Redmi/i.test(modelName) || /Redmi/i.test(ua)) {
      modelName = modelName || 'Redmi smartphone';
    } else {
      modelName = `Xiaomi (${modelName || 'device'})`;
    }
  }
  // Google Pixel
  else if (/Pixel/i.test(modelName) || /Pixel/i.test(ua)) {
    mfg = 'Google';
    const m = modelName.match(/Pixel\s*[\d\w]*/i) || ua.match(/Pixel\s*[\d\w]*/i);
    modelName = m ? m[0] : 'Google Pixel';
  }
  // Realme
  else if (/Realme|RMX[0-9]+/i.test(modelName) || /Realme|RMX[0-9]+/i.test(ua)) {
    mfg = 'Realme';
    const m = modelName.match(/RMX[0-9]+/i) || ua.match(/RMX[0-9]+/i);
    modelName = m ? `Realme (${m[0]})` : (modelName || 'Realme smartphone');
  }
  // Vivo
  else if (/vivo|V2[0-9]{3}/i.test(modelName) || /vivo|V2[0-9]{3}/i.test(ua)) {
    mfg = 'Vivo';
    const m = modelName.match(/V2[0-9]{3}/i) || ua.match(/V2[0-9]{3}/i);
    modelName = m ? `Vivo (${m[0]})` : (modelName || 'Vivo smartphone');
  }
  // OPPO
  else if (/OPPO|CPH[0-9]+/i.test(modelName) || /OPPO|CPH[0-9]+/i.test(ua)) {
    mfg = 'OPPO';
    const m = modelName.match(/CPH[0-9]+/i) || ua.match(/CPH[0-9]+/i);
    modelName = m ? `OPPO (${m[0]})` : (modelName || 'OPPO smartphone');
  }
  // OnePlus
  else if (/OnePlus|NE2[0-9]{3}|GM19[0-9]{2}|IN20[0-9]{2}/i.test(modelName) || /OnePlus/i.test(ua)) {
    mfg = 'OnePlus';
    modelName = modelName || 'OnePlus smartphone';
  }
  // Infinix
  else if (/Infinix|X[0-9]{3,4}/i.test(modelName) || /Infinix/i.test(ua)) {
    mfg = 'Infinix';
    const m = modelName.match(/X[0-9]{3,4}/i) || ua.match(/X[0-9]{3,4}/i);
    modelName = m ? `Infinix (${m[0]})` : (modelName || 'Infinix smartphone');
  }
  // Tecno
  else if (/Tecno|CK[0-9]|KF[0-9]|LG[0-9]/i.test(modelName) || /Tecno/i.test(ua)) {
    mfg = 'Tecno';
    modelName = modelName || 'Tecno smartphone';
  }
  // Walton (Bangladesh)
  else if (/Walton|Primo/i.test(modelName) || /Walton/i.test(ua)) {
    mfg = 'Walton';
    modelName = modelName || 'Walton Primo';
  }
  // Symphony (Bangladesh)
  else if (/Symphony/i.test(modelName) || /Symphony/i.test(ua)) {
    mfg = 'Symphony';
    modelName = modelName || 'Symphony smartphone';
  }
  // Desktop
  else if (detectedOs === 'Windows') {
    mfg = 'Microsoft / PC';
    modelName = 'Windows Desktop / Laptop';
  } else if (detectedOs === 'macOS') {
    mfg = 'Apple';
    modelName = 'Apple Mac';
  } else if (detectedOs === 'Linux') {
    mfg = 'Linux PC';
    modelName = 'Linux Workstation';
  }

  if (!modelName || modelName.toLowerCase() === 'k') {
    modelName = detectedOs === 'Android' ? 'Android Device' : 'Model unavailable';
  }

  return { manufacturer: mfg, model: modelName };
}

function parseUserAgent(uaString = '', clientHints = {}) {
  const ua = uaString || '';

  let deviceType = 'Desktop';
  let os = 'Unknown OS';
  let osVersion = '';
  let browser = 'Unknown Browser';
  let browserVersion = '';

  // 1. Detect Operating System & OS Version
  if (/Windows NT 10\.0/i.test(ua)) {
    os = 'Windows';
    osVersion = '10 / 11';
  } else if (/Windows NT 6\.3/i.test(ua)) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6\.1/i.test(ua)) {
    os = 'Windows';
    osVersion = '7';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    const m = ua.match(/Windows NT ([\d.]+)/i);
    if (m) osVersion = m[1];
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    const m = ua.match(/Android\s+([\d.]+)/i);
    if (m) osVersion = m[1];
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    const m = ua.match(/OS\s+([\d_]+)/i);
    if (m) osVersion = m[1].replace(/_/g, '.');
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    const m = ua.match(/Mac OS X\s+([\d_]+)/i);
    if (m) osVersion = m[1].replace(/_/g, '.');
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Override or refine OS with client hints if available
  if (clientHints?.platform) {
    if (/Android/i.test(clientHints.platform)) os = 'Android';
    else if (/Windows/i.test(clientHints.platform)) os = 'Windows';
    else if (/macOS/i.test(clientHints.platform)) os = 'macOS';
    else if (/iOS/i.test(clientHints.platform)) os = 'iOS';
  }

  // 2. Detect Browser & Version
  if (/Edg\/([\d.]+)/i.test(ua)) {
    browser = 'Microsoft Edge';
    const m = ua.match(/Edg\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    browser = 'Samsung Internet';
    const m = ua.match(/SamsungBrowser\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  } else if (/Chrome\/([\d.]+)/i.test(ua)) {
    browser = 'Google Chrome';
    const m = ua.match(/Chrome\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    browser = 'Mozilla Firefox';
    const m = ua.match(/Firefox\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
    const m = ua.match(/Version\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  } else if (/Opera|OPR\/([\d.]+)/i.test(ua)) {
    browser = 'Opera';
    const m = ua.match(/(?:Opera|OPR)\/([\d.]+)/i);
    if (m) browserVersion = m[1];
  }

  // 3. Detect Device Type
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = 'Tablet';
  } else if (/Mobile|iPhone|Android/i.test(ua) || os === 'Android' || os === 'iOS') {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // 4. Resolve Device Manufacturer and Model
  const rawHintModel = clientHints?.model || clientHints?.['sec-ch-ua-model'] || '';
  const { manufacturer, model } = resolveDeviceDetails(rawHintModel, ua, os);

  return {
    deviceType,
    manufacturer,
    model,
    os,
    osVersion: osVersion || 'N/A',
    browser,
    browserVersion: browserVersion || 'N/A',
  };
}

module.exports = { parseUserAgent, resolveDeviceDetails };
