const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('trackops_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 403 && data.status === 'EXPIRED') {
      if (!window.location.pathname.includes('/account-expired') && !window.location.pathname.includes('/login')) {
        window.location.href = '/account-expired';
      }
    }
    if (response.status === 401) {
      // Don't auto-redirect on login failure itself
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && !window.location.pathname.includes('/account-expired')) {
        localStorage.removeItem('trackops_token');
        localStorage.removeItem('trackops_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  changePassword: async (passwords) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwords),
    });
    return handleResponse(res);
  },

  // Links
  getLinks: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/links?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMyLinks: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/links?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getLinkById: async (id) => {
    const res = await fetch(`${API_BASE}/links/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createLink: async (linkData) => {
    const res = await fetch(`${API_BASE}/links`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(linkData),
    });
    return handleResponse(res);
  },

  updateLink: async (id, linkData) => {
    const res = await fetch(`${API_BASE}/links/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(linkData),
    });
    return handleResponse(res);
  },

  deleteLink: async (id) => {
    const res = await fetch(`${API_BASE}/links/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getLinkActivity: async (id) => {
    const res = await fetch(`${API_BASE}/links/${id}/activity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Users (Super Admin & Admin)
  getUsers: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getUserById: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  approveUser: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  rejectUser: async (id, reason) => {
    const res = await fetch(`${API_BASE}/users/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  suspendUser: async (id, reason) => {
    const res = await fetch(`${API_BASE}/users/${id}/suspend`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  restoreUser: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/restore`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  changeUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateUserExpiry: async (id, data) => {
    const res = await fetch(`${API_BASE}/users/${id}/expiry`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateDeviceLimit: async (id, allowedDeviceLimit) => {
    const res = await fetch(`${API_BASE}/users/${id}/device-limit`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ allowedDeviceLimit }),
    });
    return handleResponse(res);
  },

  getUserSessions: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/sessions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  revokeUserSession: async (id, sessionId) => {
    const res = await fetch(`${API_BASE}/users/${id}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  revokeAllUserSessions: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/sessions`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/users/audit-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Visitor (Public)
  resolveVisitorLink: async (shortCode) => {
    const res = await fetch(`${API_BASE}/visitor/resolve/${shortCode}`);
    return handleResponse(res);
  },

  submitVisitorConsent: async (shortCode, consentPayload) => {
    const res = await fetch(`${API_BASE}/visitor/consent/${shortCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentPayload),
    });
    return handleResponse(res);
  },

  skipVisitorConsent: async (shortCode, payload = {}) => {
    const res = await fetch(`${API_BASE}/visitor/skip/${shortCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Analytics
  getAnalyticsDashboard: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Telecom Integration
  getTelecomStatus: async () => {
    const res = await fetch(`${API_BASE}/telecom/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateTelecomConfig: async (config) => {
    const res = await fetch(`${API_BASE}/telecom/configure`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  requestTelecomDispatch: async (data) => {
    const res = await fetch(`${API_BASE}/telecom/request-dispatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Visitor Activity (Link Owner Dashboard)
  getVisitorActivities: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/visitor-activity?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getVisitorActivityById: async (id) => {
    const res = await fetch(`${API_BASE}/visitor-activity/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // IP Intelligence Analysis
  analyzeIp: async (ip) => {
    const res = await fetch(`${API_BASE}/visitor-activity/ip-analysis?ip=${encodeURIComponent(ip || '')}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Export CSV
  exportVisitorCsv: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const token = localStorage.getItem('trackops_token');
    const res = await fetch(`${API_BASE}/visitor-activity/export-csv?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackops-visit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

