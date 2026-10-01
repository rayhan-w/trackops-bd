import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trackops_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (_) {
      try { localStorage.removeItem('trackops_user'); } catch (__) {}
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem('trackops_token');
      return saved && saved !== 'undefined' && saved !== 'null' ? saved : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            try { localStorage.setItem('trackops_user', JSON.stringify(res.user)); } catch (_) {}
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (identifier, password, clientDevice = null) => {
    const res = await api.login(identifier, password, clientDevice);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      try {
        localStorage.setItem('trackops_token', res.token);
        localStorage.setItem('trackops_user', JSON.stringify(res.user));
        if (res.sessionId) localStorage.setItem('trackops_session_id', res.sessionId);
      } catch (_) {}
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('trackops_token');
      localStorage.removeItem('trackops_user');
    } catch (_) {}
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('trackops_user', JSON.stringify(res.user));
        } catch (_) {}
      }
    } catch (e) {
      console.error(e);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
