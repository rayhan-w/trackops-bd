import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Check,
  ShieldCheck,
  AlertCircle,
  Link as LinkIcon,
  RefreshCw,
  MailCheck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unreadCount} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Notifications & Alerts"
          subtitle="System security notices, account approvals, and link visitor activity."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-[#0B192C]">Notification Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <MailCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mark All as Read</span>
                </button>
              )}
              <button
                onClick={fetchNotifications}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-600">No notifications in your inbox</h4>
                <p className="text-xs text-slate-400">You will receive notifications here when visits or account actions occur.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !item.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.type?.includes('APPROVE') ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      ) : item.type?.includes('VISIT') ? (
                        <LinkIcon className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkRead(item._id)}
                      className="text-xs text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
