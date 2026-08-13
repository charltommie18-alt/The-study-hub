import React, { useState } from 'react';
import { SubscriberRecord, DailyAnalyticsRecord, CurrencyCode, GradeLevel } from '../../types';
import { INITIAL_SUBSCRIBERS, INITIAL_DAILY_ANALYTICS, GRADE_CONFIGS } from '../../data/initialData';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Sparkles, 
  CreditCard, 
  UserPlus, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Settings, 
  Activity, 
  BarChart3, 
  Layers, 
  X,
  Plus
} from 'lucide-react';

interface AdminDashboardTabProps {
  onOpenStoreModal?: () => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onOpenStoreModal }) => {
  // PIN lock state
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Admin Data State
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(INITIAL_SUBSCRIBERS);
  const [analytics, setAnalytics] = useState<DailyAnalyticsRecord[]>(INITIAL_DAILY_ANALYTICS);

  // Filters & Modals
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | 'ALL'>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [showAddSubModal, setShowAddSubModal] = useState(false);

  // New Subscriber Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubGrade, setNewSubGrade] = useState<GradeLevel>('grade-12');
  const [newSubTier, setNewSubTier] = useState<'Free' | 'Pro' | 'Institutional'>('Pro');
  const [newSubCurrency, setNewSubCurrency] = useState<CurrencyCode>('USD');
  const [newSubAmount, setNewSubAmount] = useState('4.99');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '12021') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 5) {
      setPinInput((prev) => prev + val);
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError(false);
  };

  // Add Subscriber
  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubEmail.trim()) return;

    const newSub: SubscriberRecord = {
      id: `sub-${Date.now()}`,
      fullName: newSubName.trim(),
      email: newSubEmail.trim(),
      gradeLevel: newSubGrade,
      tier: newSubTier,
      currency: newSubCurrency,
      amount: parseFloat(newSubAmount) || 0,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActiveDate: new Date().toISOString().split('T')[0],
      docsUploaded: 0,
    };

    setSubscribers((prev) => [newSub, ...prev]);
    setShowAddSubModal(false);
    setNewSubName('');
    setNewSubEmail('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Subscriber ID', 'Full Name', 'Email', 'Grade Level', 'Tier', 'Currency', 'Amount', 'Status', 'Joined Date', 'Docs Uploaded'];
    const rows = subscribers.map((s) => [
      s.id,
      `"${s.fullName}"`,
      s.email,
      s.gradeLevel,
      s.tier,
      s.currency,
      s.amount,
      s.status,
      s.joinedDate,
      s.docsUploaded,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StudyHub_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial Metrics Calculation
  const totalSubscribersCount = subscribers.length;
  const activeProCount = subscribers.filter((s) => s.tier === 'Pro' && s.status === 'Active').length;
  const activeInstCount = subscribers.filter((s) => s.tier === 'Institutional' && s.status === 'Active').length;

  const latestDaily = analytics[analytics.length - 1];

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter((s) => {
    const matchesCurrency = selectedCurrency === 'ALL' || s.currency === selectedCurrency;
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    return matchesCurrency && matchesTier;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#FBF9F5] border border-[#E3DDD3] rounded-3xl shadow-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E2EFE3] text-[#5A6D5B] flex items-center justify-center mx-auto border border-[#C5DCC6]">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#2D362E]">Admin Control Portal</h2>
          <p className="text-xs text-[#736B5E] mt-1">
            Restricted access. Enter your 5-digit PIN to access executive analytics & subscription metrics.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`w-10 h-12 rounded-xl border flex items-center justify-center text-lg font-bold font-mono transition-all ${
                  pinInput[idx]
                    ? 'border-[#5A6D5B] bg-[#E8F0E9] text-[#2D362E]'
                    : 'border-[#D9D1C7] bg-white text-transparent'
                }`}
              >
                {pinInput[idx] ? '●' : ''}
              </div>
            ))}
          </div>

          {pinError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Incorrect PIN. Please try again.</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClearPin();
                  else if (key === '✓') {
                    if (pinInput.length === 5) handlePinSubmit({ preventDefault: () => {} } as any);
                  } else handleKeypadPress(key);
                }}
                className="h-11 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#D9D1C7] text-sm font-bold text-[#2D362E] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={pinInput.length !== 5}
            className="w-full py-3 bg-[#5A6D5B] hover:bg-[#4A5D4B] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Workspace</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#2D362E] via-[#384639] to-[#2D362E] text-white rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E2EFE3]/20 text-[#C8E0C9] rounded-xl border border-white/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#F2EFE9]">Executive Admin Portal</h2>
              <span className="px-2 py-0.5 bg-[#E2EFE3] text-[#2D362E] text-[10px] font-bold rounded-full uppercase tracking-wider">
                PIN 12021 Verified
              </span>
            </div>
            <p className="text-xs text-[#D1DACF] mt-0.5">
              Real-time daily usage analytics, subscriber management, global currency conversion, and store deployment logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStoreModal && (
            <button
              onClick={onOpenStoreModal}
              className="px-4 py-2 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#2D362E] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>Store Readiness (Play / Amazon)</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border border-white/20"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#736B5E]">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Active Users (DAU)</span>
            <Users className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#2D362E]">{latestDaily.activeUsers}</div>
          <p className="text-[11px] text-[#5A6D5B] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% vs last week</span>
          </p>
        </div>

        <div className="p-5 bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#736B5E]">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Docs Uploaded</span>
            <FileText className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#2D362E]">{latestDaily.docUploads}</div>
          <p className="text-[11px] text-[#736B5E]">PDF, DOCX & Syllabus parsing</p>
        </div>

        <div className="p-5 bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#736B5E]">
            <span className="text-xs font-bold uppercase tracking-wider">Daily AI Prompts</span>
            <Sparkles className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#2D362E]">{latestDaily.aiPromptsCount}</div>
          <p className="text-[11px] text-[#736B5E]">Summaries, cards & AI tutor chat</p>
        </div>

        <div className="p-5 bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#736B5E]">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Revenue (USD)</span>
            <DollarSign className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#2D362E]">${latestDaily.revenueUsd.toFixed(2)}</div>
          <p className="text-[11px] text-[#5A6D5B] font-medium">36 New Pro Subscriptions today</p>
        </div>
      </div>

      {/* Section 1: Daily Analytics Chart & Metrics */}
      <div className="bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D8] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#5A6D5B]" />
              <span>Daily Platform Performance Analytics</span>
            </h3>
            <p className="text-xs text-[#736B5E]">7-Day trend for active sessions, document uploads, and AI queries</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#E2EFE3] text-[#5A6D5B] text-xs font-semibold rounded-full border border-[#C5DCC6]">
              Real-time Sync Active
            </span>
          </div>
        </div>

        {/* Bar chart representation */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-7 gap-2 h-40 items-end border-b border-[#D9D1C7] pb-2">
            {analytics.map((day) => {
              const maxUsers = 800;
              const heightPercent = Math.min(100, Math.round((day.activeUsers / maxUsers) * 100));

              return (
                <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-[#736B5E] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.activeUsers} DAU
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-[#5A6D5B] hover:bg-[#4A5D4B] rounded-t-lg transition-all relative"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D362E] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      ${day.revenueUsd}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#575047] font-semibold">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-[#736B5E] pt-1">
            <span>DAU Activity Level</span>
            <span className="font-semibold text-[#2D362E]">Avg. Growth Rate: +14.8% / day</span>
          </div>
        </div>
      </div>

      {/* Section 2: Global Subscription Tracker */}
      <div className="bg-[#FBF9F5] border border-[#E3DDD3] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D8] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#5A6D5B]" />
              <span>International Subscription Tracker</span>
            </h3>
            <p className="text-xs text-[#736B5E]">
              Total Subscribers: <strong className="text-[#2D362E]">{totalSubscribersCount}</strong> | Active Pro: <strong className="text-[#5A6D5B]">{activeProCount}</strong> | Institutional: <strong className="text-[#2D362E]">{activeInstCount}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddSubModal(true)}
              className="px-4 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Subscriber</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl border border-[#D9D1C7] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F2EFE9]/60 p-3 rounded-xl border border-[#D9D1C7]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#575047]">Filter Currency:</span>
            {['ALL', 'USD', 'ZAR', 'EUR', 'GBP', 'JMD', 'NGN'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCurrency(c as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCurrency === c
                    ? 'bg-[#5A6D5B] text-white'
                    : 'bg-white text-[#575047] border border-[#D9D1C7] hover:bg-[#F2EFE9]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#575047]">Tier:</span>
            {['ALL', 'Free', 'Pro', 'Institutional'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tierFilter === t
                    ? 'bg-[#5A6D5B] text-white'
                    : 'bg-white text-[#575047] border border-[#D9D1C7] hover:bg-[#F2EFE9]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriber Roster Table */}
        <div className="overflow-x-auto border border-[#E8E2D8] rounded-xl bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2EFE9] text-[#575047] font-bold border-b border-[#E8E2D8]">
                <th className="p-3">Subscriber</th>
                <th className="p-3">Grade Target</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3">Monthly Billing</th>
                <th className="p-3">Docs Processed</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="p-3 font-semibold text-[#2D362E]">
                    <div>{sub.fullName}</div>
                    <div className="text-[11px] text-[#736B5E] font-normal">{sub.email}</div>
                  </td>
                  <td className="p-3 uppercase font-medium text-[#575047]">
                    {sub.gradeLevel}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.tier === 'Pro'
                        ? 'bg-[#E2EFE3] text-[#2D362E] border border-[#C5DCC6]'
                        : sub.tier === 'Institutional'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.tier}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#2D362E]">
                    {sub.currency} {sub.amount.toFixed(2)} / mo
                  </td>
                  <td className="p-3 text-[#575047]">
                    {sub.docsUploaded} documents
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{sub.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSubscribers((prev) =>
                          prev.map((s) => (s.id === sub.id ? { ...s, tier: s.tier === 'Pro' ? 'Free' : 'Pro' } : s))
                        );
                      }}
                      className="px-2.5 py-1 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-[11px] font-semibold rounded-lg border border-[#D9D1C7] transition-all cursor-pointer"
                    >
                      {sub.tier === 'Pro' ? 'Downgrade' : 'Grant Pro'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-[#E3DDD3] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <h3 className="text-base font-bold text-[#2D362E]">Add Global Subscriber</h3>
              <button
                onClick={() => setShowAddSubModal(false)}
                className="p-1 text-[#8C8275] hover:text-[#2D362E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#575047] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Amara Okafor"
                  className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#575047] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="amara@school.edu"
                  className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#575047] mb-1">Grade Target</label>
                  <select
                    value={newSubGrade}
                    onChange={(e) => setNewSubGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E]"
                  >
                    {GRADE_CONFIGS.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#575047] mb-1">Plan Tier</label>
                  <select
                    value={newSubTier}
                    onChange={(e) => setNewSubTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E]"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#575047] mb-1">Currency</label>
                  <select
                    value={newSubCurrency}
                    onChange={(e) => setNewSubCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E]"
                  >
                    {['USD', 'ZAR', 'EUR', 'GBP', 'JMD', 'NGN', 'CAD', 'AUD'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#575047] mb-1">Monthly Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSubAmount}
                    onChange={(e) => setNewSubAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D9D1C7] rounded-xl text-xs text-[#2D362E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-all mt-2"
              >
                Save Subscriber
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
