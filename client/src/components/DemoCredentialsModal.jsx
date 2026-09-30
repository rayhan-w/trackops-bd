import React from 'react';
import { X, Copy, Check, Shield, User, UserCheck, AlertCircle, Ban } from 'lucide-react';

export default function DemoCredentialsModal({ isOpen, onClose, onSelectAccount }) {
  const [copiedId, setCopiedId] = React.useState(null);

  if (!isOpen) return null;

  const accounts = [
    {
      id: 'superadmin',
      role: 'SUPER ADMIN',
      roleColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Shield,
      email: 'superadmin@trackops.local',
      password: 'DemoSuperAdmin@2026',
      status: 'APPROVED',
      statusColor: 'bg-emerald-100 text-emerald-700',
      description: 'Full root access: User approvals, status suspensions, audit logs, and telecom gateway master configs.',
    },
    {
      id: 'admin',
      role: 'ADMIN',
      roleColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: UserCheck,
      email: 'admin@trackops.local',
      password: 'DemoAdmin@2026',
      status: 'APPROVED',
      statusColor: 'bg-emerald-100 text-emerald-700',
      description: 'Departmental administrator: Review assigned users, link analytics, and departmental records.',
    },
    {
      id: 'officer',
      role: 'OFFICER / USER',
      roleColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: User,
      email: 'officer@trackops.local',
      password: 'DemoOfficer@2026',
      status: 'APPROVED',
      statusColor: 'bg-emerald-100 text-emerald-700',
      description: 'Active case officer: Create investigation links, view voluntary location maps, and own analytics.',
    },
    {
      id: 'pending',
      role: 'PENDING APPLICANT',
      roleColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: AlertCircle,
      email: 'farhana.applicant@trackops.local',
      password: 'DemoPending@2026',
      status: 'PENDING',
      statusColor: 'bg-amber-100 text-amber-700',
      description: 'Awaiting Super Admin approval. Demonstrates the pending holding screen and block on link creation.',
    },
    {
      id: 'suspended',
      role: 'SUSPENDED USER',
      roleColor: 'bg-red-100 text-red-700 border-red-200',
      icon: Ban,
      email: 'hossain.suspended@trackops.local',
      password: 'DemoSuspended@2026',
      status: 'SUSPENDED',
      statusColor: 'bg-red-100 text-red-700',
      description: 'Account placed on administrative hold. Demonstrates suspension notice & appeal interface.',
    },
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Development Demo Accounts</h3>
              <p className="text-xs text-slate-400">Pre-seeded accounts to test all roles and approval flows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-100">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <div key={acc.id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.roleColor}`}>
                      {acc.role}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${acc.statusColor}`}>
                      {acc.status}
                    </span>
                  </div>
                  {onSelectAccount && (
                    <button
                      onClick={() => {
                        onSelectAccount(acc.email, acc.password);
                        onClose();
                      }}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                    >
                      Fill Credentials
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 mb-2.5">{acc.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 text-[11px] truncate">{acc.email}</span>
                    <button
                      onClick={() => handleCopy(acc.email, `${acc.id}-email`)}
                      className="text-slate-400 hover:text-blue-600 ml-2"
                      title="Copy email"
                    >
                      {copiedId === `${acc.id}-email` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-700 text-[11px]">{acc.password}</span>
                    <button
                      onClick={() => handleCopy(acc.password, `${acc.id}-pwd`)}
                      className="text-slate-400 hover:text-blue-600 ml-2"
                      title="Copy password"
                    >
                      {copiedId === `${acc.id}-pwd` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Passwords are bcrypt-hashed in MongoDB.</span>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
