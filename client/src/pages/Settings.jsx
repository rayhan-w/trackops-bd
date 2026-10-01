import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  CheckCircle,
  AlertCircle,
  LogOut,
  Save,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import ActiveDeviceCard from '../components/ActiveDeviceCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Settings() {
  const { user, setUser, refreshUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState('');
  const [sessionError, setSessionError] = useState('');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.notificationPreferences?.emailAlerts ?? true);
  const [linkClicksAlert, setLinkClicksAlert] = useState(user?.notificationPreferences?.linkClicks ?? true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setUpdatingProfile(true);
    try {
      const res = await api.updateProfile({
        name,
        email,
        phone,
        notificationPreferences: {
          emailAlerts,
          linkClicks: linkClicksAlert,
        },
      });
      if (res.success && res.user) {
        setUser(res.user);
        setProfileSuccess('Profile credentials and preferences updated successfully.');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters');
    }

    if (newPassword !== confirmNewPassword) {
      return setPasswordError('New passwords do not match');
    }

    setUpdatingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.success) {
        setPasswordSuccess('Password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Error changing password. Ensure current password is correct.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRevokeOthers = async () => {
    if (!window.confirm('Are you sure you want to log out all other active devices?')) return;
    setRevokingOthers(true);
    setSessionSuccess('');
    setSessionError('');
    try {
      const res = await api.revokeOtherSessions();
      await refreshUser();
      setSessionSuccess(res.message || 'All other active devices have been logged out.');
      setTimeout(() => setSessionSuccess(''), 5000);
    } catch (err) {
      setSessionError(err.message || 'Failed to revoke other sessions.');
    } finally {
      setRevokingOthers(false);
    }
  };

  const currentSession =
    user?.activeSessions?.find((s) => s.isCurrent) ||
    user?.activeSessions?.find((s) => s.status === 'ACTIVE') ||
    user?.activeSessions?.[0] ||
    null;

  const otherSessions = Array.isArray(user?.activeSessions)
    ? user.activeSessions.filter((s) => s !== currentSession && s.status === 'ACTIVE')
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Account Settings"
          subtitle="Manage credentials, password security, notification preferences, and officer profile."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Officer Profile & Identification</h3>
                <p className="text-xs text-slate-500">Update contact and departmental dispatch information</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / Mobile Dispatch</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-2">Notification Preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Receive urgent account vetting & approval updates</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={linkClicksAlert}
                      onChange={(e) => setLinkClicksAlert(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Receive real-time notifications on case link visitor actions</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{updatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B192C]">Password & Session Security</h3>
                <p className="text-xs text-slate-500">Update your access password (hashed via salted bcrypt)</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{updatingPassword ? 'Updating...' : 'Change Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Devices & Security Sessions Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B192C]">Active Devices &amp; Login Sessions</h3>
                  <p className="text-xs text-slate-500">
                    Review and manage authorized hardware models connected to your officer account.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Device Limit:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-200">
                  {user?.allowedDeviceLimit || 1} allowed
                </span>
              </div>
            </div>

            {sessionSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{sessionSuccess}</span>
              </div>
            )}

            {sessionError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center space-x-2 border border-red-200 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{sessionError}</span>
              </div>
            )}

            {/* Current Device Highlight Card */}
            {currentSession && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Session
                </span>
                <ActiveDeviceCard
                  session={currentSession}
                  isCurrent={true}
                  onRevokeOthers={otherSessions.length > 0 ? handleRevokeOthers : null}
                  revoking={revokingOthers}
                />
              </div>
            )}

            {/* Other Active Devices list */}
            {otherSessions.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Other Active Devices ({otherSessions.length})
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {otherSessions.map((sess) => (
                    <ActiveDeviceCard
                      key={sess.sessionId}
                      session={sess}
                      isCurrent={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
