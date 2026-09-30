import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Link as LinkIcon,
  PlusCircle,
  BarChart3,
  Bell,
  Radio,
  Settings,
  ShieldAlert,
  Users,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  Compass,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0E1C36] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  TrackOps <span className="text-blue-400">BD</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Lawful Portal v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Quick Create Link CTA */}
          <NavLink
            to="/links/new"
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Link</span>
          </NavLink>

          {/* Primary Investigation Nav */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Investigation Desk
            </div>

            <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <LinkIcon className="w-4 h-4" />
                <span>My Links</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>

            <NavLink to="/visitor-activity" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Visitor Activity</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>

            <NavLink to="/analytics" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>

            <NavLink to="/notifications" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 ? (
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              )}
            </NavLink>
          </div>

          {/* Telecom & Technical Utilities */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Technical Modules
            </div>

            <NavLink to="/cell-converter" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <Layers className="w-4 h-4" />
                <span>Cell Converter</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>

            <NavLink to="/telecom" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <Radio className="w-4 h-4" />
                <span>Telecom Gateway</span>
              </div>
              <span className="text-[9px] bg-slate-800 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                WARRANT
              </span>
            </NavLink>

            <NavLink to="/settings" onClick={onClose} className={navItemClass}>
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </div>

          {/* Admin & Super Admin Controls */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <div className="px-3 pb-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>{isSuperAdmin ? 'Super Admin' : 'Admin'} Center</span>
                <ShieldAlert className="w-3 h-3 text-amber-400" />
              </div>

              <NavLink to="/admin/users" onClick={onClose} className={navItemClass}>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </NavLink>

              <NavLink to="/admin/audit-logs" onClick={onClose} className={navItemClass}>
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4" />
                  <span>Audit Logs</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            </div>
          )}
        </div>

        {/* User Mini Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-[#091426]">
          <div className="flex items-center justify-between mb-2.5 px-2">
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Officer'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email || user?.phone}</div>
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                user?.role === 'SUPER_ADMIN'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                  : user?.role === 'ADMIN'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-500/30'
                  : 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user?.role || 'OFFICER'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
