import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Briefcase,
  MapPin,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const COMMON_RANKS = [
  'Inspector General of Police (IGP)',
  'Additional Inspector General of Police (Addl. IGP)',
  'Deputy Inspector General (DIG)',
  'Additional Deputy Inspector General (Addl. DIG)',
  'Superintendent of Police (SP)',
  'Additional Superintendent of Police (Addl. SP)',
  'Senior Assistant Superintendent of Police (Sr. ASP)',
  'Assistant Superintendent of Police (ASP)',
  'Inspector',
  'Sub-Inspector (SI)',
  'Sergeant',
  'Assistant Sub-Inspector (ASI)',
  'Nayek',
  'Constable',
  'Other',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    rank: '',
    customRank: '',
    currentPosting: '',
  });

  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);
  const [rankSearch, setRankSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRankSelect = (selectedRank) => {
    setFormData({ ...formData, rank: selectedRank });
    setRankDropdownOpen(false);
    setRankSearch('');
    setError('');
  };

  const filteredRanks = COMMON_RANKS.filter((r) =>
    r.toLowerCase().includes(rankSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      return setError('Please provide your full legal name');
    }

    const selectedRank = formData.rank === 'Other' ? formData.customRank.trim() : formData.rank.trim();
    if (!selectedRank) {
      return setError('Please select or specify your Rank');
    }

    if (!formData.currentPosting.trim()) {
      return setError('Please enter your current posting or unit');
    }

    if (!formData.email && !formData.phone) {
      return setError('Please provide either an Email address or a Phone number');
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return setError('Please provide a valid email address');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email ? formData.email.trim() : undefined,
        phone: formData.phone ? formData.phone.trim() : undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        rank: selectedRank,
        currentPosting: formData.currentPosting.trim(),
      });
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Officer Registration
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Apply for an authorized case inquiry account on TrackOps BD
            </p>
          </div>

          {/* Success State Screen */}
          {successData ? (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Waiting for Administration Approval
                </h3>
                <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left leading-relaxed">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Application Submitted Successfully</span>
                  </div>
                  Your account has been registered with status{' '}
                  <strong className="font-mono">PENDING</strong>. Please wait while the administrator reviews your application.
                  <div className="mt-2 pt-2 border-t border-amber-200/60 font-semibold">
                    Please contact <a href="tel:01797838961" className="font-bold underline text-amber-900">01797838961</a> to activate your account.
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/approval-pending"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Go to Approval Status Page</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sub-Inspector Tanvir Ahmed"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Rank (Searchable Dropdown) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rank <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRankDropdownOpen(!rankDropdownOpen)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <span className={formData.rank ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                        {formData.rank || 'Select your official rank...'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {rankDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-stone-100 flex items-center space-x-2">
                        <Search className="w-4 h-4 text-slate-400 ml-1" />
                        <input
                          type="text"
                          value={rankSearch}
                          onChange={(e) => setRankSearch(e.target.value)}
                          placeholder="Search rank..."
                          autoFocus
                          className="w-full text-xs py-1 px-1 bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="overflow-y-auto py-1">
                        {filteredRanks.length > 0 ? (
                          filteredRanks.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleRankSelect(r)}
                              className={`w-full text-left px-3.5 py-2 text-xs hover:bg-sky-50 transition-colors flex items-center justify-between ${
                                formData.rank === r ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'
                              }`}
                            >
                              <span>{r}</span>
                              {formData.rank === r && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-stone-400 text-center">
                            No matching ranks found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Rank Input if 'Other' is selected */}
                {formData.rank === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customRank"
                      value={formData.customRank}
                      onChange={handleChange}
                      placeholder="Specify your official rank / designation"
                      required
                      className="w-full px-3.5 py-2 bg-stone-50 border border-sky-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Current Posting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Posting <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="currentPosting"
                    value={formData.currentPosting}
                    onChange={handleChange}
                    placeholder="Enter your current posting or unit"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="officer.name@police.gov.bd"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Required if phone is not provided</span>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01700000000"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an authorized account?{' '}
              <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
