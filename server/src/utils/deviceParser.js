/**
 * Standards-based User-Agent & Device Parser for TrackOps BD
 * Extracts device type, manufacturer, model, OS, and browser reliably
 * without invasive fingerprinting or invented models.
 */

function parseUserAgent(uaString = '') {
  const ua = uaString || '';

  let deviceType = 'Desktop';
  let manufacturer = 'N/A';
  let model = 'Model unavailable';
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

  // 3. Detect Device Type, Manufacturer & Model
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = 'Tablet';
  } else if (/Mobile|iPhone|Android/i.test(ua)) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // Manufacturer and Model detection
  if (/iPhone/i.test(ua)) {
    manufacturer = 'Apple';
    model = 'iPhone';
    deviceType = 'Mobile';
  } else if (/iPad/i.test(ua)) {
    manufacturer = 'Apple';
    model = 'iPad';
    deviceType = 'Tablet';
  } else if (/Macintosh/i.test(ua)) {
    manufacturer = 'Apple';
    model = 'Macintosh';
    deviceType = 'Desktop';
  } else if (/SM-[A-Z0-9]+|GT-[A-Z0-9]+|Samsung/i.test(ua)) {
    manufacturer = 'Samsung';
    const m = ua.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i);
    model = m ? `Galaxy (${m[1]})` : 'Galaxy series';
  } else if (/Pixel\s*[\d\w]*/i.test(ua)) {
    manufacturer = 'Google';
    const m = ua.match(/(Pixel\s*[\d\w]*)/i);
    model = m ? m[1] : 'Pixel';
  } else if (/Redmi|POCO|Mi\s|Xiaomi/i.test(ua)) {
    manufacturer = 'Xiaomi';
    const m = ua.match(/(Redmi[^\s;]+|POCO[^\s;]+|Mi\s+[^\s;]+)/i);
    model = m ? m[1] : 'Redmi / Mi series';
  } else if (/Huawei|HONOR/i.test(ua)) {
    manufacturer = 'Huawei';
    const m = ua.match(/(HUAWEI[^\s;]+|HONOR[^\s;]+)/i);
    model = m ? m[1] : 'Huawei / Honor';
  } else if (/OnePlus/i.test(ua)) {
    manufacturer = 'OnePlus';
    const m = ua.match(/(OnePlus[^\s;]+)/i);
    model = m ? m[1] : 'OnePlus device';
  } else if (/Vivo/i.test(ua)) {
    manufacturer = 'Vivo';
    const m = ua.match(/(vivo\s*[A-Z0-9]+)/i);
    model = m ? m[1] : 'Vivo smartphone';
  } else if (/OPPO/i.test(ua)) {
    manufacturer = 'OPPO';
    const m = ua.match(/(CPH[0-9]+|OPPO[^\s;]+)/i);
    model = m ? m[1] : 'OPPO smartphone';
  } else if (/Realme/i.test(ua)) {
    manufacturer = 'Realme';
    const m = ua.match(/(RMX[0-9]+|Realme[^\s;]+)/i);
    model = m ? m[1] : 'Realme smartphone';
  } else if (deviceType === 'Desktop') {
    manufacturer = os === 'macOS' ? 'Apple' : 'N/A';
    model = os === 'macOS' ? 'Mac' : 'Desktop PC';
  } else {
    // Mobile / Tablet with generic or withheld model
    model = 'Model unavailable';
  }

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

module.exports = { parseUserAgent };
